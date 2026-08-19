'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { merchantService } from '@/services/merchantService';
import { toast } from 'react-toastify';

export default function MerchantLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const data = await merchantService.login(email.trim(), password);

      if (data.status) {
        localStorage.setItem('merchantToken', data.token);
        localStorage.setItem('merchantUser', JSON.stringify(data.merchant));
        toast.success(`Welcome back, ${data.merchant?.business_name || data.merchant?.name}!`);
        router.push('/merchant/dashboard');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
          <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
            <Card.Header className="bg-dark text-white text-center py-4">
              <div className="d-inline-block p-2 rounded-circle bg-primary bg-opacity-25 mb-2">
                <span style={{ fontSize: '40px' }}>🏪</span>
              </div>
              <h3 className="mb-1 font-weight-bold text-white">Merchant Portal</h3>
            </Card.Header>
            <Card.Body className="p-4 bg-white">
              {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3" controlId="merchantEmail">
                  <Form.Label className="small fw-semibold text-secondary">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="merchant@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    size="lg"
                    className="fs-6"
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="merchantPassword">
                  <Form.Label className="small fw-semibold text-secondary">Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    size="lg"
                    className="fs-6"
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 py-2 fw-semibold shadow-sm" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Authenticating...
                    </>
                  ) : (
                    'SignIn'
                  )}
                </Button>
              </Form>

              <div className="text-center mt-4 pt-2 border-top">
                <p className="small text-muted mb-2">
                  Want to sell with us?{' '}
                  <Link href="/merchant/register" className="text-primary fw-semibold text-decoration-none">
                    Register as Merchant
                  </Link>
                </p>
                <div className="d-flex justify-content-center gap-3 mt-3 small">
                  <Link href="/" className="text-muted text-decoration-none">← Back to Store</Link>
                  <span className="text-muted">•</span>
                  <Link href="/admin/login" className="text-muted text-decoration-none">Admin Login</Link>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
