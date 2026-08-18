'use client';
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Spinner, Alert, Modal, Form, Pagination, Badge } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminService } from '@/services/adminService';
import { toast } from 'react-toastify';

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Add / Edit Merchant Modal
  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [isEditingMerchant, setIsEditingMerchant] = useState(false);
  const [currentMerchantId, setCurrentMerchantId] = useState<string | null>(null);
  const [merchantFormData, setMerchantFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    business_name: '',
    subdomain: '',
    store_description: '',
    status: 'active',
  });

  // Delete Merchant Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [merchantToDelete, setMerchantToDelete] = useState<{ id: string; name: string } | null>(null);

  const router = useRouter();

  const fetchMerchants = async (page = 1, search = searchTerm, status = statusFilter) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const data = await adminService.getAdminMerchants(page, 10, search, status);

      if (data.success || data.status) {
        setMerchants(data.data || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setCurrentPage(data.pagination.currentPage || 1);
        }
      } else {
        setError(data.message || 'Failed to fetch merchants');
        toast.error(data.message || 'Failed to fetch merchants');
      }
    } catch (err) {
      setError('An error occurred while fetching merchants.');
      toast.error('An error occurred while fetching merchants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants(currentPage, searchTerm, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMerchants(1, searchTerm, statusFilter);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCurrentPage(1);
    fetchMerchants(1, '', '');
  };

  // ---------------------------------------------------------------------------
  // Merchant CRUD Actions
  // ---------------------------------------------------------------------------
  const handleOpenAddMerchant = () => {
    setMerchantFormData({
      name: '',
      email: '',
      mobile: '',
      password: '',
      business_name: '',
      subdomain: '',
      store_description: '',
      status: 'active',
    });
    setIsEditingMerchant(false);
    setCurrentMerchantId(null);
    setShowMerchantModal(true);
  };

  const handleOpenEditMerchant = (merchant: any) => {
    setMerchantFormData({
      name: merchant.name || '',
      email: merchant.email || '',
      mobile: merchant.mobile || '',
      password: '', // Leave blank unless changing
      business_name: merchant.business_name || '',
      subdomain: merchant.subdomain || '',
      store_description: merchant.store_description || '',
      status: merchant.status || 'active',
    });
    setIsEditingMerchant(true);
    setCurrentMerchantId(merchant._id);
    setShowMerchantModal(true);
  };

  const handleMerchantFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMerchantFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveMerchant = async () => {
    try {
      if (!merchantFormData.name || !merchantFormData.email || !merchantFormData.business_name) {
        toast.warning('Name, Email, and Business Name are required.');
        return;
      }

      if (!isEditingMerchant && !merchantFormData.password) {
        toast.warning('Password is required when creating a new merchant.');
        return;
      }

      let data;
      if (isEditingMerchant && currentMerchantId) {
        data = await adminService.updateMerchant(currentMerchantId, merchantFormData);
      } else {
        data = await adminService.createMerchant(merchantFormData);
      }

      if (data.success || data.status) {
        toast.success(isEditingMerchant ? 'Merchant updated successfully' : 'Merchant created successfully');
        setShowMerchantModal(false);
        fetchMerchants(currentPage, searchTerm, statusFilter);
      } else {
        toast.error(data.message || 'Failed to save merchant');
      }
    } catch (err) {
      toast.error('An error occurred while saving.');
    }
  };

  const handlePromptDelete = (merchant: any) => {
    setMerchantToDelete({ id: merchant._id, name: merchant.business_name || merchant.name });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!merchantToDelete) return;

    try {
      const data = await adminService.deleteMerchant(merchantToDelete.id);

      if (data.success || data.status) {
        toast.success('Merchant deleted successfully');
        setShowDeleteModal(false);
        setMerchantToDelete(null);
        fetchMerchants(currentPage, searchTerm, statusFilter);
      } else {
        toast.error(data.message || 'Failed to delete merchant');
      }
    } catch (err) {
      toast.error('Error deleting merchant');
    }
  };

  const handleVerifyMerchant = async (merchantId: string) => {
    try {
      const data = await adminService.verifyMerchant(merchantId);
      if (data.success || data.status) {
        toast.success('Merchant approved & verified successfully');
        fetchMerchants(currentPage, searchTerm, statusFilter);
      } else {
        toast.error(data.message || 'Failed to verify merchant');
      }
    } catch (err) {
      toast.error('Error verifying merchant');
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="text-dark fw-bold mb-0">Merchants</h2>
          <small className="text-muted">Manage merchants, store profiles, categories, and products</small>
        </div>
        <Button variant="primary" onClick={handleOpenAddMerchant}>
          + Add Merchant
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Main Merchants Table Card */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white py-3 border-bottom d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <h5 className="mb-0 fw-bold text-dark">All Merchants</h5>

          {/* Search and Status Filters */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            <Form onSubmit={handleSearchSubmit} className="d-flex gap-2">
              <Form.Control
                size="sm"
                type="text"
                placeholder="Search name, email, business..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '220px' }}
              />
              <Button type="submit" variant="secondary" size="sm">
                Search
              </Button>
            </Form>

            <Form.Select
              size="sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '130px' }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </Form.Select>

            {(searchTerm || statusFilter) && (
              <Button variant="outline-secondary" size="sm" onClick={handleClearFilters}>
                ✕ Reset
              </Button>
            )}
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted small">Loading merchants...</p>
            </div>
          ) : (
            <>
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Store / Business</th>
                    <th>Merchant Owner</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Verified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {merchants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-5 text-muted">
                        No merchants found {searchTerm || statusFilter ? 'matching your filters' : ''}.
                      </td>
                    </tr>
                  ) : (
                    merchants.map((merchant) => (
                      <tr key={merchant._id} className="align-middle">
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {merchant.profile_picture ? (
                              <img
                                src={merchant.profile_picture}
                                alt={merchant.business_name}
                                style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '50%' }}
                              />
                            ) : (
                              <div
                                style={{ width: '38px', height: '38px', backgroundColor: '#e9ecef', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                🏪
                              </div>
                            )}
                            <div>
                              <strong className="text-dark d-block">{merchant.business_name || 'N/A'}</strong>
                              {merchant.subdomain && <small className="text-muted">{merchant.subdomain}.store</small>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="fw-medium text-dark">{merchant.name}</span>
                        </td>
                        <td>
                          <span className="d-block small">{merchant.email}</span>
                          {merchant.mobile && <small className="text-muted">{merchant.mobile}</small>}
                        </td>
                        <td>
                          <Badge bg={merchant.status === 'active' ? 'success' : merchant.status === 'suspended' ? 'danger' : 'secondary'}>
                            {merchant.status || 'inactive'}
                          </Badge>
                        </td>
                        <td>
                          {merchant.is_verified_by_admin ? (
                            <span className="text-success small fw-bold">✓ Verified</span>
                          ) : (
                            <Button
                              variant="outline-warning"
                              size="sm"
                              className="py-0 px-2"
                              style={{ fontSize: '11px' }}
                              onClick={() => handleVerifyMerchant(merchant._id)}
                            >
                              Approve
                            </Button>
                          )}
                        </td>
                        <td>
                          {/* Dashboard Page Link */}
                          <Link
                            href={`/admin/dashboard/merchants/${merchant._id}`}
                            className="btn btn-primary btn-sm me-2 fw-medium"
                          >
                            📊 Dashboard
                          </Link>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleOpenEditMerchant(merchant)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handlePromptDelete(merchant)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center p-3 border-top">
                  <Pagination className="mb-0">
                    <Pagination.Prev
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    />
                    {[...Array(totalPages)].map((_, idx) => (
                      <Pagination.Item
                        key={idx + 1}
                        active={idx + 1 === currentPage}
                        onClick={() => setCurrentPage(idx + 1)}
                      >
                        {idx + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Add / Edit Merchant Modal */}
      <Modal show={showMerchantModal} onHide={() => setShowMerchantModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditingMerchant ? 'Edit Merchant' : 'Add New Merchant'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Business / Store Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="business_name"
                    value={merchantFormData.business_name}
                    onChange={handleMerchantFormChange}
                    placeholder="e.g. Apex Electronics"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Owner Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={merchantFormData.name}
                    onChange={handleMerchantFormChange}
                    placeholder="e.g. John Doe"
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Email Address *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={merchantFormData.email}
                    onChange={handleMerchantFormChange}
                    placeholder="john@example.com"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Mobile / Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="mobile"
                    value={merchantFormData.mobile}
                    onChange={handleMerchantFormChange}
                    placeholder="+91 9876543210"
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>{isEditingMerchant ? 'New Password (optional)' : 'Password *'}</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={merchantFormData.password}
                    onChange={handleMerchantFormChange}
                    placeholder={isEditingMerchant ? 'Leave blank to keep current' : 'Min 6 characters'}
                  />
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group className="mb-3">
                  <Form.Label>Subdomain</Form.Label>
                  <Form.Control
                    type="text"
                    name="subdomain"
                    value={merchantFormData.subdomain}
                    onChange={handleMerchantFormChange}
                    placeholder="store-name"
                  />
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select name="status" value={merchantFormData.status} onChange={handleMerchantFormChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Store Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="store_description"
                value={merchantFormData.store_description}
                onChange={handleMerchantFormChange}
                placeholder="Brief summary of what this merchant sells..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMerchantModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveMerchant}>
            {isEditingMerchant ? 'Save Changes' : 'Create Merchant'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete merchant <strong>{merchantToDelete?.name}</strong>? All associated stores and links will be affected.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete Merchant
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
