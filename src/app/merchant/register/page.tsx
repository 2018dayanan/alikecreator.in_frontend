'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { merchantService } from '@/services/merchantService';
import { toast } from 'react-toastify';

export default function MerchantRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    subdomain: '',
    store_description: '',
    tax_id: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.business_name || !formData.email || !formData.mobile || !formData.password || !formData.subdomain) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      const { confirmPassword, ...payload } = formData;
      const data = await merchantService.register(payload);

      if (data.status) {
        setSuccess('Registration submitted successfully! Your account is pending admin verification. You will be redirected to login.');
        toast.success('Registration successful! Waiting for admin verification.');
        setTimeout(() => {
          router.push('/merchant/login');
        }, 3500);
      } else {
        setError(data.message || 'Registration failed. Please check your information.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5" style={{ minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
            <Card.Header className="bg-dark text-white text-center py-4">
              <div className="d-inline-block p-2 rounded-circle bg-primary bg-opacity-25 mb-2">
                <span style={{ fontSize: '24px' }}>📝</span>
              </div>
              <h3 className="mb-1 font-weight-bold text-white">Merchant Registration</h3>
            </Card.Header>
            <Card.Body className="p-4 bg-white">
              {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
              {success && <Alert variant="success" className="py-2 small">{success}</Alert>}

              <Form onSubmit={handleRegister}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-secondary">Full Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-secondary">Business / Store Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="business_name"
                        placeholder="Apex Electronics"
                        value={formData.business_name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-secondary">Email Address *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="store@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-secondary">Mobile Number *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="mobile"
                        placeholder="+91 9876543210"
                        value={formData.mobile}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-secondary">Password *</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="Min 6 characters"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-secondary">Confirm Password *</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        placeholder="Repeat password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-secondary">
                        Store Subdomain <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="subdomain"
                        placeholder="mystore (mystore.domain.com)"
                        value={formData.subdomain}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-secondary">Tax ID / GST Number (Optional)</Form.Label>
                      <Form.Control
                        type="text"
                        name="tax_id"
                        placeholder="TAX12345678"
                        value={formData.tax_id}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-semibold text-secondary">Store Description (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="store_description"
                    placeholder="Tell customers about your store..."
                    value={formData.store_description}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 py-2 fw-semibold shadow-sm" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Creating Merchant Account...
                    </>
                  ) : (
                    'Register as Merchant'
                  )}
                </Button>
              </Form>

              <div className="text-center mt-4 pt-2 border-top">
                <p className="small text-muted mb-0">
                  Already have a merchant account?{' '}
                  <Link href="/merchant/login" className="text-primary fw-semibold text-decoration-none">
                    Sign In
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
