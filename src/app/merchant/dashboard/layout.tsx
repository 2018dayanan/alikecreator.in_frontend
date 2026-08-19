'use client';
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Nav, Navbar, Dropdown, Spinner } from 'react-bootstrap';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function MerchantDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [merchantUser, setMerchantUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('merchantToken');
    const userStr = localStorage.getItem('merchantUser');
    if (!token) {
      router.replace('/merchant/login');
    } else {
      if (userStr) {
        try {
          setMerchantUser(JSON.parse(userStr));
        } catch {
          // Ignore json parse error
        }
      }
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('merchantToken');
    localStorage.removeItem('merchantUser');
    router.replace('/merchant/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const navLinks = [
    { href: '/merchant/dashboard', label: 'Dashboard' },
    { href: '/merchant/dashboard/products', label: 'Products' },
    { href: '/merchant/dashboard/categories', label: 'Categories' },
    { href: '/merchant/dashboard/orders', label: 'Orders' },
    { href: '/merchant/dashboard/profile', label: 'Store Profile' },
  ];

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="px-4 shadow-sm" style={{ zIndex: 1000 }}>
        <Navbar.Brand as={Link} href="/merchant/dashboard" className="fw-bold d-flex align-items-center gap-2">
          <span style={{ fontSize: '20px' }}>🏪</span>
          <span>Merchant Panel</span>
          <span className="badge bg-primary text-uppercase px-2 py-1 ms-1" style={{ fontSize: '10px' }}>Store</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="merchant-navbar-nav" />
        <Navbar.Collapse id="merchant-navbar-nav" className="justify-content-end">
          <Nav className="align-items-center gap-3">
            <span className="text-light small d-none d-md-inline">
              Store: <strong className="text-warning">{merchantUser?.business_name || merchantUser?.name || 'Merchant'}</strong>
            </span>
            <Dropdown align="end">
              <Dropdown.Toggle variant="dark" id="merchant-profile-dropdown" className="border-0 d-flex align-items-center gap-2">
                <div 
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: '32px', height: '32px', fontSize: '13px' }}
                >
                  {(merchantUser?.name || 'M').charAt(0).toUpperCase()}
                </div>
                <span>{merchantUser?.name || 'Merchant'}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu className="shadow border-0 mt-2">
                <div className="px-3 py-2 border-bottom">
                  <p className="mb-0 fw-bold small text-dark">{merchantUser?.business_name || merchantUser?.name}</p>
                  <p className="mb-0 text-muted small" style={{ fontSize: '11px' }}>{merchantUser?.email}</p>
                </div>
                <Dropdown.Item as={Link} href="/merchant/dashboard/profile">Store Profile</Dropdown.Item>
                <Dropdown.Item as={Link} href="/merchant/dashboard/products">Manage Products</Dropdown.Item>
                <Dropdown.Item as={Link} href="/merchant/dashboard/orders">View Orders</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item as={Link} href="/" target="_blank">View Main Store ↗</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      {/* Main Container */}
      <Container fluid className="flex-grow-1 p-0">
        <Row className="g-0 h-100">
          {/* Sidebar */}
          <Col md={2} className="bg-white border-end shadow-sm d-none d-md-block h-100" style={{ minHeight: 'calc(100vh - 56px)' }}>
            <div className="p-3">
              <div className="text-uppercase text-secondary fw-bold px-3 mb-2" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                Store Management
              </div>
              <Nav className="flex-column gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Nav.Link
                      key={link.href}
                      as={Link}
                      href={link.href}
                      className={`text-dark rounded px-3 py-2 transition-all ${
                        isActive
                          ? 'bg-primary text-white fw-semibold shadow-sm'
                          : 'hover-bg-light'
                      }`}
                      style={isActive ? { color: '#fff !important' } : {}}
                    >
                      {link.label}
                    </Nav.Link>
                  );
                })}
              </Nav>
            </div>
          </Col>

          {/* Page Content */}
          <Col xs={12} md={10} className="p-4">
            {children}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
