'use client';
import React from 'react';
import { Container, Row, Col, Nav, Navbar, Dropdown } from 'react-bootstrap';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function RentalDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  if (!isAuthenticated) {
    return null; // Optionally return a full-screen loading spinner here
  }

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar bg="primary" variant="dark" expand="lg" className="px-4 shadow-sm" style={{ zIndex: 1000 }}>
        <Navbar.Brand as={Link} href="/admin/rental" className="fw-bold">
          Rental Dashboard
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav className="align-items-center">
            <Link href="/admin/merchant/dashboard" className="btn btn-outline-light btn-sm me-3 fw-bold">
              Merchant Portal
            </Link>
            <Link href="/admin/dashboard" className="btn btn-outline-light btn-sm me-3 fw-bold">
              Main Dashboard
            </Link>
            <Dropdown align="end">
              <Dropdown.Toggle variant="primary" id="dropdown-basic" className="border-0 text-white">
                Admin User
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item href="#/action-1">Profile</Dropdown.Item>
                <Dropdown.Item href="#/action-2">Settings</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      {/* Main Content Area */}
      <Container fluid className="flex-grow-1 p-0">
        <Row className="g-0 h-100">
          {/* Sidebar */}
          <Col md={2} className="bg-white border-end shadow-sm d-none d-md-block h-100" style={{ minHeight: 'calc(100vh - 56px)' }}>
            <Nav className="flex-column p-3 pt-4 gap-2">
              <Nav.Link as={Link} href="/admin/rental" className={`text-dark rounded ${pathname === '/admin/rental' ? 'bg-light fw-bold text-primary' : ''}`}>
                Overview
              </Nav.Link>
              <Nav.Link as={Link} href="/admin/rental/categories" className={`text-dark rounded ${pathname === '/admin/rental/categories' ? 'bg-light fw-bold text-primary' : ''}`}>
                Rental Categories
              </Nav.Link>
              <Nav.Link as={Link} href="/admin/rental/products" className={`text-dark rounded ${pathname === '/admin/rental/products' ? 'bg-light fw-bold text-primary' : ''}`}>
                Rental Products
              </Nav.Link>
            </Nav>
          </Col>

          {/* Main Content */}
          <Col md={10} className="p-4 overflow-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
            {children}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
