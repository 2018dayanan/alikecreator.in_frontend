'use client';
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Nav, Navbar, Dropdown, Spinner, Button } from 'react-bootstrap';
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
    { href: '/merchant/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/merchant/dashboard/products', label: 'Products', icon: '📦' },
    { href: '/merchant/dashboard/categories', label: 'Categories', icon: '🏷️' },
    { href: '/merchant/dashboard/orders', label: 'Orders', icon: '🛒' },
    { href: '/merchant/dashboard/profile', label: 'Store Profile', icon: '⚙️' },
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
          {/* Mobile navigation links */}
          <Nav className="d-lg-none py-2 border-bottom border-secondary mb-2">
            {navLinks.map((link) => (
              <Nav.Link
                key={link.href}
                as={Link}
                href={link.href}
                className={`text-light py-2 px-2 d-flex align-items-center gap-2 ${pathname === link.href ? 'text-primary fw-bold' : ''}`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Nav.Link>
            ))}
          </Nav>

          <Nav className="align-items-center gap-3">
            <span className="text-light small d-none d-md-inline">
              Store: <strong className="text-warning">{merchantUser?.business_name || merchantUser?.name || 'Merchant'}</strong>
            </span>

            {/* Profile Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle variant="dark" id="merchant-profile-dropdown" className="border-0 d-flex align-items-center gap-2">
                <div 
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: '32px', height: '32px', fontSize: '13px' }}
                >
                  {(merchantUser?.name || 'M').charAt(0).toUpperCase()}
                </div>
                <span className="d-none d-sm-inline">{merchantUser?.name || 'Merchant'}</span>
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
                <Dropdown.Item onClick={handleLogout} className="text-danger fw-semibold">
                  🚪 Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* Direct 1-Click Logout Button in Top Navbar */}
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleLogout}
              className="d-flex align-items-center gap-1 px-3 py-1 fw-semibold"
              style={{ fontSize: '13px', borderRadius: '6px' }}
              title="Sign out of your merchant account"
            >
              <span>🚪</span>
              <span>Logout</span>
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      {/* Main Container */}
      <Container fluid className="flex-grow-1 p-0">
        <Row className="g-0 h-100">
          {/* Sidebar */}
          <Col
            md={2}
            className="bg-white border-end shadow-sm d-none d-md-flex flex-column justify-content-between p-3"
            style={{ minHeight: 'calc(100vh - 56px)' }}
          >
            <div>
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
                      className={`text-dark rounded px-3 py-2 transition-all d-flex align-items-center gap-2 ${
                        isActive
                          ? 'bg-primary text-white fw-semibold shadow-sm'
                          : 'hover-bg-light'
                      }`}
                      style={isActive ? { color: '#fff !important' } : {}}
                    >
                      <span>{link.icon}</span>
                      <span>{link.label}</span>
                    </Nav.Link>
                  );
                })}
              </Nav>
            </div>

            {/* Sidebar Bottom Profile & Logout Card */}
            <div className="pt-3 border-top mt-4">
              <div className="d-flex align-items-center gap-2 mb-3 px-2">
                <div 
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                  style={{ width: '36px', height: '36px', fontSize: '14px' }}
                >
                  {(merchantUser?.name || 'M').charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="fw-bold text-dark text-truncate small">
                    {merchantUser?.name || 'Merchant'}
                  </div>
                  <div className="text-muted text-truncate" style={{ fontSize: '11px' }}>
                    {merchantUser?.email || ''}
                  </div>
                </div>
              </div>

              <Button
                variant="outline-danger"
                className="w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold shadow-sm"
                onClick={handleLogout}
                style={{ borderRadius: '6px', fontSize: '13px', padding: '8px' }}
              >
                <span>🚪</span>
                <span>Log Out</span>
              </Button>
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
