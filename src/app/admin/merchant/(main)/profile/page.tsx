'use client';
import React, { useEffect, useState } from 'react';
import { Card, Form, Button, Spinner, Alert, Row, Col, Badge } from 'react-bootstrap';
import { merchantService } from '@/services/merchantService';
import { toast } from 'react-toastify';

export default function MerchantProfilePage() {
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [error, setError] = useState('');
  const [merchant, setMerchant] = useState<any>(null);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: '',
    business_name: '',
    mobile: '',
    store_description: '',
    tax_id: '',
    bank_account_number: '',
    bank_name: '',
    bank_routing: '',
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const data = await merchantService.getProfile();
      if (data.status && data.merchant) {
        const m = data.merchant;
        setMerchant(m);
        setProfileForm({
          name: m.name || '',
          business_name: m.business_name || '',
          mobile: m.mobile || '',
          store_description: m.store_description || '',
          tax_id: m.tax_id || '',
          bank_account_number: m.bank_details?.account_number || '',
          bank_name: m.bank_details?.bank_name || '',
          bank_routing: m.bank_details?.routing_number || '',
        });
      } else {
        setError(data.message || 'Failed to fetch merchant profile');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred loading merchant profile');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const payload = {
        name: profileForm.name,
        business_name: profileForm.business_name,
        mobile: profileForm.mobile,
        store_description: profileForm.store_description,
        tax_id: profileForm.tax_id,
        bank_details: {
          account_number: profileForm.bank_account_number,
          bank_name: profileForm.bank_name,
          routing_number: profileForm.bank_routing
        }
      };

      const data = await merchantService.updateProfile(payload);
      if (data.status) {
        toast.success('Store profile updated successfully');
        // Update stored user info
        localStorage.setItem('merchantUser', JSON.stringify(data.merchant));
        setMerchant(data.merchant);
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (err) {
      toast.error('Error saving profile changes');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.warning('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.warning('Password must be at least 6 characters');
      return;
    }

    try {
      setSavingPassword(true);
      const data = await merchantService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (data.status) {
        toast.success('Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (err) {
      toast.error('Error changing password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="text-dark fw-bold mb-1">Store Profile & Settings</h3>
          <p className="text-muted mb-0 small">Update your merchant business information and manage account security</p>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {profileLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted small">Loading profile...</p>
        </div>
      ) : (
        <Row className="g-4">
          <Col lg={8}>
            {/* Store Information Card */}
            <Card className="shadow-sm border-0 rounded-3 mb-4">
              <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold text-dark">Business Details</h5>
                <Badge bg={merchant?.status === 'active' ? 'success' : 'warning'}>
                  Status: {merchant?.status || 'inactive'}
                </Badge>
              </Card.Header>
              <Card.Body className="p-4">
                <Form onSubmit={handleUpdateProfile}>
                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Group controlId="merchantName">
                        <Form.Label className="small fw-semibold">Contact Person Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={profileForm.name}
                          onChange={handleProfileChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="businessName">
                        <Form.Label className="small fw-semibold">Business / Store Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="business_name"
                          value={profileForm.business_name}
                          onChange={handleProfileChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Group controlId="merchantEmail">
                        <Form.Label className="small fw-semibold">Email Address (Read-only)</Form.Label>
                        <Form.Control
                          type="email"
                          value={merchant?.email || ''}
                          disabled
                          className="bg-light"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="merchantMobile">
                        <Form.Label className="small fw-semibold">Phone Number</Form.Label>
                        <Form.Control
                          type="tel"
                          name="mobile"
                          value={profileForm.mobile}
                          onChange={handleProfileChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Group controlId="merchantSubdomain">
                        <Form.Label className="small fw-semibold">Subdomain</Form.Label>
                        <Form.Control
                          type="text"
                          value={merchant?.subdomain || 'Not configured'}
                          disabled
                          className="bg-light"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="merchantTaxId">
                        <Form.Label className="small fw-semibold">Tax ID / GST Number</Form.Label>
                        <Form.Control
                          type="text"
                          name="tax_id"
                          value={profileForm.tax_id}
                          onChange={handleProfileChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4" controlId="merchantDesc">
                    <Form.Label className="small fw-semibold">Store Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="store_description"
                      value={profileForm.store_description}
                      onChange={handleProfileChange}
                      placeholder="About your store, warranty terms, return policy..."
                    />
                  </Form.Group>

                  <h6 className="fw-bold text-dark mt-4 mb-3 pt-3 border-top">Payout & Banking Details</h6>
                  <Row className="g-3 mb-4">
                    <Col md={4}>
                      <Form.Group controlId="bankName">
                        <Form.Label className="small fw-semibold">Bank Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="bank_name"
                          placeholder="e.g. HDFC Bank"
                          value={profileForm.bank_name}
                          onChange={handleProfileChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group controlId="bankAccount">
                        <Form.Label className="small fw-semibold">Account Number</Form.Label>
                        <Form.Control
                          type="text"
                          name="bank_account_number"
                          placeholder="XXXXXXXXXXXX"
                          value={profileForm.bank_account_number}
                          onChange={handleProfileChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group controlId="bankRouting">
                        <Form.Label className="small fw-semibold">Routing / IFSC Code</Form.Label>
                        <Form.Control
                          type="text"
                          name="bank_routing"
                          placeholder="HDFC0001234"
                          value={profileForm.bank_routing}
                          onChange={handleProfileChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button variant="primary" type="submit" disabled={savingProfile} className="fw-semibold">
                    {savingProfile ? <Spinner as="span" animation="border" size="sm" className="me-2" /> : null}
                    Save Profile Changes
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            {/* Account Status & Info */}
            <Card className="shadow-sm border-0 rounded-3 mb-4 bg-light">
              <Card.Body className="p-4">
                <h6 className="fw-bold text-dark mb-3">Account Verification</h6>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="text-muted small">Admin Verification:</span>
                  <Badge bg={merchant?.is_verified_by_admin ? 'success' : 'warning'}>
                    {merchant?.is_verified_by_admin ? 'Verified' : 'Pending Review'}
                  </Badge>
                </div>
                <div className="text-muted small">
                  Registered: {merchant?.createdAt ? new Date(merchant.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </Card.Body>
            </Card>

            {/* Change Password Card */}
            <Card className="shadow-sm border-0 rounded-3">
              <Card.Header className="bg-white py-3 border-bottom">
                <h6 className="mb-0 fw-bold text-dark">Change Password</h6>
              </Card.Header>
              <Card.Body className="p-4">
                <Form onSubmit={handleUpdatePassword}>
                  <Form.Group className="mb-3" controlId="currentPass">
                    <Form.Label className="small fw-semibold">Current Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="newPass">
                    <Form.Label className="small fw-semibold">New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Min 6 characters"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="confirmPass">
                    <Form.Label className="small fw-semibold">Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Form.Group>

                  <Button variant="outline-primary" type="submit" disabled={savingPassword} className="w-100 fw-semibold">
                    {savingPassword ? <Spinner as="span" animation="border" size="sm" className="me-2" /> : null}
                    Update Password
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
