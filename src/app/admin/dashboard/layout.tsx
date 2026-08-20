'use client';
import React from 'react';
import { Container, Row, Col, Nav, Navbar, Dropdown } from 'react-bootstrap';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
      <Navbar bg="dark" variant="dark" expand="lg" className="px-4 shadow-sm" style={{ zIndex: 1000 }}>
        <Navbar.Brand as={Link} href="/admin/dashboard" className="fw-bold">
          Admin Panel
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            <Dropdown align="end">
              <Dropdown.Toggle variant="dark" id="dropdown-basic" className="border-0">
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
              <Nav.Link as={Link} href="/admin/dashboard" className={`text-dark rounded ${pathname === '/admin/dashboard' ? 'bg-light fw-bold text-primary' : ''}`}>
                Dashboard
              </Nav.Link>
              <Nav.Link as={Link} href="/admin/dashboard/products" className={`text-dark rounded ${pathname === '/admin/dashboard/products' ? 'bg-light fw-bold text-primary' : ''}`}>
                Products
              </Nav.Link>
              <Nav.Link as={Link} href="/admin/dashboard/categories" className={`text-dark rounded ${pathname === '/admin/dashboard/categories' ? 'bg-light fw-bold text-primary' : ''}`}>
                Categories
              </Nav.Link>
              <Nav.Link as={Link} href="/admin/dashboard/orders" className={`text-dark rounded ${pathname === '/admin/dashboard/orders' ? 'bg-light fw-bold text-primary' : ''}`}>
                Orders
              </Nav.Link>
              <Nav.Link as={Link} href="/admin/dashboard/customers" className={`text-dark rounded ${pathname === '/admin/dashboard/customers' ? 'bg-light fw-bold text-primary' : ''}`}>
                Customers
              </Nav.Link>
              <Nav.Link as={Link} href="/admin/dashboard/merchants" className={`text-dark rounded ${pathname === '/admin/dashboard/merchants' ? 'bg-light fw-bold text-primary' : ''}`}>
                Merchants
              </Nav.Link>
              <Nav.Link as={Link} href="/admin/dashboard/carousels" className={`text-dark rounded ${pathname === '/admin/dashboard/carousels' ? 'bg-light fw-bold text-primary' : ''}`}>
                Carousels / Banners
              </Nav.Link>
              <Nav.Link as={Link} href="/admin/dashboard/settings" className={`text-dark rounded ${pathname === '/admin/dashboard/settings' ? 'bg-light fw-bold text-primary' : ''}`}>
                Settings
              </Nav.Link>
            </Nav>
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
