'use client';
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Spinner, Alert, Modal, Form, Pagination, Badge, Row, Col } from 'react-bootstrap';
import { merchantService } from '@/services/merchantService';
import { toast } from 'react-toastify';

interface CarouselItem {
  _id: string;
  title?: string;
  description?: string;
  image: string;
  url?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function MerchantCarouselsPage() {
  // State
  const [carousels, setCarousels] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering & Pagination
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCarousels, setTotalCarousels] = useState(0);
  const limit = 10;

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Selected item
  const [selectedCarousel, setSelectedCarousel] = useState<CarouselItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    url: '',
    order: 0,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // 1. Fetch Merchant Carousels
  const fetchCarousels = async () => {
    try {
      setLoading(true);
      setError('');

      let activeParam: boolean | undefined = undefined;
      if (statusFilter === 'active') activeParam = true;
      if (statusFilter === 'inactive') activeParam = false;

      const res = await merchantService.getCarousels(
        currentPage,
        limit,
        activeParam,
        searchTerm
      );

      if (res.status !== false) {
        setCarousels(res.carousels || []);
        setTotalCarousels(res.pagination?.totalCarousels ?? (res.carousels?.length || 0));
        setTotalPages(res.pagination?.totalPages || 1);
      } else {
        setError(res.message || 'Failed to load store carousel banners');
      }
    } catch (err: any) {
      console.error('Error fetching merchant carousels:', err);
      setError(err.message || 'Error connecting to the server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarousels();
  }, [currentPage, statusFilter]);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCarousels();
  };

  const handleResetFilters = () => {
    setStatusFilter('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      url: '',
      order: 0,
      isActive: true,
    });
    setFormError('');
    setShowCreateModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (carousel: CarouselItem) => {
    setSelectedCarousel(carousel);
    setFormData({
      title: carousel.title || '',
      description: carousel.description || '',
      image: carousel.image || '',
      url: carousel.url || '',
      order: carousel.order || 0,
      isActive: carousel.isActive ?? true,
    });
    setFormError('');
    setShowEditModal(true);
  };

  // Create Carousel
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image.trim()) {
      setFormError('Banner image URL is required');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        image: formData.image.trim(),
        url: formData.url.trim() || null,
        order: Number(formData.order) || 0,
        isActive: formData.isActive,
      };

      const res = await merchantService.createCarousel(payload);

      if (res.status !== false) {
        toast.success(res.message || 'Banner created successfully!');
        setShowCreateModal(false);
        fetchCarousels();
      } else {
        setFormError(res.message || 'Failed to create banner');
      }
    } catch (err: any) {
      setFormError(err.message || 'Error creating banner');
    } finally {
      setSubmitting(false);
    }
  };

  // Update Carousel
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCarousel) return;

    if (!formData.image.trim()) {
      setFormError('Banner image URL is required');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        image: formData.image.trim(),
        url: formData.url.trim() || null,
        order: Number(formData.order) || 0,
        isActive: formData.isActive,
      };

      const res = await merchantService.updateCarousel(selectedCarousel._id, payload);

      if (res.status !== false) {
        toast.success(res.message || 'Banner updated successfully!');
        setShowEditModal(false);
        fetchCarousels();
      } else {
        setFormError(res.message || 'Failed to update banner');
      }
    } catch (err: any) {
      setFormError(err.message || 'Error updating banner');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (carousel: CarouselItem) => {
    try {
      const res = await merchantService.toggleCarouselStatus(carousel._id);
      if (res.status !== false) {
        toast.success(res.message || 'Status updated successfully');
        setCarousels((prev) =>
          prev.map((c) =>
            c._id === carousel._id ? { ...c, isActive: !c.isActive } : c
          )
        );
      } else {
        toast.error(res.message || 'Failed to toggle status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle status');
    }
  };

  // Delete Carousel
  const handleDeleteSubmit = async () => {
    if (!selectedCarousel) return;

    try {
      setSubmitting(true);
      const res = await merchantService.deleteCarousel(selectedCarousel._id);

      if (res.status !== false) {
        toast.success(res.message || 'Banner deleted successfully');
        setShowDeleteModal(false);
        fetchCarousels();
      } else {
        toast.error(res.message || 'Failed to delete banner');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error deleting banner');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="merchant-carousels-page">
      {/* Global CSS for Clean Gray Placeholders */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .merchant-carousels-page input::placeholder,
          .merchant-carousels-page textarea::placeholder,
          .merchant-carousels-page select::placeholder,
          .modal input::placeholder,
          .modal textarea::placeholder {
            color: #8c98a4 !important;
            opacity: 1 !important;
            font-size: 0.95rem;
          }
          .merchant-carousels-page input::-webkit-input-placeholder,
          .merchant-carousels-page textarea::-webkit-input-placeholder,
          .modal input::-webkit-input-placeholder,
          .modal textarea::-webkit-input-placeholder {
            color: #8c98a4 !important;
            opacity: 1 !important;
          }
        `
      }} />

      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Store Banner / Carousel</h2>
          <p className="text-muted mb-0">
            Customize hero slider banners displayed on your storefront homepage.
          </p>
        </div>
        <Button variant="primary" className="d-flex align-items-center gap-2 shadow-sm" onClick={handleOpenCreateModal}>
          <span>➕</span>
          <span>Add New Banner</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4 g-3">
        <Col xs={12} sm={4}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary"
                style={{ width: '48px', height: '48px', fontSize: '20px' }}
              >
                🖼️
              </div>
              <div>
                <div className="text-muted small">Total Banners</div>
                <h4 className="fw-bold mb-0">{totalCarousels}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success"
                style={{ width: '48px', height: '48px', fontSize: '20px' }}
              >
                ✅
              </div>
              <div>
                <div className="text-muted small">Active on Storefront</div>
                <h4 className="fw-bold mb-0">
                  {carousels.filter((c) => c.isActive).length}
                </h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-secondary bg-opacity-10 text-secondary"
                style={{ width: '48px', height: '48px', fontSize: '20px' }}
              >
                ⏸️
              </div>
              <div>
                <div className="text-muted small">Inactive Banners</div>
                <h4 className="fw-bold mb-0">
                  {carousels.filter((c) => !c.isActive).length}
                </h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filter and Search Bar */}
      <Card className="border-0 shadow-sm rounded-3 mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col xs={12} sm={6} md={4}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-semibold">Status Filter</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Banners</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} sm={6} md={5}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-semibold">Search Banners</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={3} className="d-flex gap-2">
              <Button variant="primary" className="flex-grow-1" onClick={handleSearchSubmit}>
                Search
              </Button>
              <Button variant="outline-secondary" onClick={handleResetFilters}>
                Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Main Table */}
      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-0">
          {error && (
            <div className="p-4">
              <Alert variant="danger" className="mb-0">
                {error}
              </Alert>
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading your store banners...</p>
            </div>
          ) : carousels.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ fontSize: '48px' }}>🖼️</div>
              <h5 className="fw-bold mt-3">No Banners Found</h5>
              <p className="text-muted max-w-sm mx-auto">
                {searchTerm || statusFilter !== 'all'
                  ? 'No banners matched your search criteria.'
                  : 'You haven’t created any banners yet. Add a banner to showcase promotions on your store!'}
              </p>
              <Button variant="primary" className="mt-2" onClick={handleOpenCreateModal}>
                ➕ Create Your First Banner
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '100px' }} className="ps-4">
                      Banner
                    </th>
                    <th>Heading & Details</th>
                    <th>Target Link</th>
                    <th className="text-center">Order</th>
                    <th className="text-center">Status</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {carousels.map((carousel) => (
                    <tr key={carousel._id}>
                      {/* Image Thumbnail */}
                      <td className="ps-4">
                        <div
                          className="rounded overflow-hidden border bg-light d-flex align-items-center justify-content-center shadow-sm"
                          style={{ width: '90px', height: '50px', cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedCarousel(carousel);
                            setShowDetailModal(true);
                          }}
                        >
                          {carousel.image ? (
                            <img
                              src={carousel.image}
                              alt={carousel.title || 'Banner'}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-muted small">No Image</span>
                          )}
                        </div>
                      </td>

                      {/* Title & Description */}
                      <td>
                        <div className="fw-bold text-dark">
                          {carousel.title || <span className="text-muted fst-italic">Untitled Banner</span>}
                        </div>
                        {carousel.description && (
                          <div
                            className="text-muted small text-truncate"
                            style={{ maxWidth: '300px' }}
                            title={carousel.description}
                          >
                            {carousel.description}
                          </div>
                        )}
                        <div className="text-muted small" style={{ fontSize: '11px' }}>
                          Updated: {new Date(carousel.updatedAt || carousel.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Target Link */}
                      <td>
                        {carousel.url ? (
                          <a
                            href={carousel.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-none text-primary small d-inline-flex align-items-center gap-1 text-truncate"
                            style={{ maxWidth: '180px' }}
                            title={carousel.url}
                          >
                            <span>🔗</span>
                            <span>{carousel.url}</span>
                          </a>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>

                      {/* Order */}
                      <td className="text-center">
                        <Badge bg="light" text="dark" className="border px-2 py-1 fw-bold">
                          #{carousel.order ?? 0}
                        </Badge>
                      </td>

                      {/* Status Toggle */}
                      <td className="text-center">
                        <div className="d-flex flex-column align-items-center gap-1">
                          <Badge bg={carousel.isActive ? 'success' : 'secondary'}>
                            {carousel.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Form.Check
                            type="switch"
                            id={`merchant-switch-${carousel._id}`}
                            checked={carousel.isActive}
                            onChange={() => handleToggleStatus(carousel)}
                            title="Toggle active status"
                            className="mt-1"
                          />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-1">
                          <Button
                            variant="outline-info"
                            size="sm"
                            title="View Banner Details"
                            onClick={() => {
                              setSelectedCarousel(carousel);
                              setShowDetailModal(true);
                            }}
                          >
                            👁️
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            title="Edit Banner"
                            onClick={() => handleOpenEditModal(carousel)}
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            title="Delete Banner"
                            onClick={() => {
                              setSelectedCarousel(carousel);
                              setShowDeleteModal(true);
                            }}
                          >
                            🗑️
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="text-muted small">
                Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCarousels} total banners)
              </div>
              <Pagination className="mb-0">
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                />
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                  .map((p) => (
                    <Pagination.Item
                      key={p}
                      active={p === currentPage}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </Pagination.Item>
                  ))}
                <Pagination.Next
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* ========================================================================= */}
      {/* 1. Create Modal                                                          */}
      {/* ========================================================================= */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Add Storefront Banner</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateSubmit}>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}

            <Row className="g-3">
              <Col xs={12} md={8}>
                {/* Image URL */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Banner Image URL <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="https://example.com/images/store-banner.jpg"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    required
                  />
                  <Form.Text className="text-muted">
                    Recommended resolution: 1920x600 or 1200x500 for optimal high-definition hero display.
                  </Form.Text>
                </Form.Group>

                {/* Banner Title */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Banner Heading / Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Grand Opening Sale - Flat 30% Off"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </Form.Group>

                {/* Banner Description */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Description / Subtitle</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="e.g. Shop our latest arrivals and enjoy complimentary express delivery."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Form.Group>

                {/* Destination Link */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Click Target URL / Redirect Link</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. /shop or https://your-brand-link.com"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </Form.Group>

                <Row>
                  {/* Display Order */}
                  <Col xs={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Display Order</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      />
                      <Form.Text className="text-muted">Lower numbers appear first.</Form.Text>
                    </Form.Group>
                  </Col>

                  {/* Active Toggle */}
                  <Col xs={6} className="d-flex align-items-center">
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="merchant-create-active"
                        label="Set as Active Banner"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="fw-semibold mt-3"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>

              {/* Image Preview */}
              <Col xs={12} md={4}>
                <Form.Label className="fw-semibold">Image Preview</Form.Label>
                <div
                  className="border rounded p-2 bg-light d-flex flex-column align-items-center justify-content-center text-center"
                  style={{ minHeight: '180px' }}
                >
                  {formData.image.trim() ? (
                    <img
                      src={formData.image.trim()}
                      alt="Banner Preview"
                      className="img-fluid rounded shadow-sm"
                      style={{ maxHeight: '160px', width: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-muted p-3">
                      <div style={{ fontSize: '32px' }}>🖼️</div>
                      <small className="text-muted">Enter a valid image URL to view preview</small>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                'Create Banner'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. Edit Modal                                                            */}
      {/* ========================================================================= */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Edit Banner</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateSubmit}>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}

            <Row className="g-3">
              <Col xs={12} md={8}>
                {/* Image URL */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Banner Image URL <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="https://example.com/images/store-banner.jpg"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    required
                  />
                </Form.Group>

                {/* Banner Title */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Banner Heading / Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Grand Opening Sale"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </Form.Group>

                {/* Banner Description */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Description / Subtitle</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Form.Group>

                {/* Destination Link */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Click Target URL</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </Form.Group>

                <Row>
                  {/* Display Order */}
                  <Col xs={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Display Order</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      />
                    </Form.Group>
                  </Col>

                  {/* Active Toggle */}
                  <Col xs={6} className="d-flex align-items-center">
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="merchant-edit-active"
                        label="Set as Active Banner"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="fw-semibold mt-3"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>

              {/* Image Preview */}
              <Col xs={12} md={4}>
                <Form.Label className="fw-semibold">Image Preview</Form.Label>
                <div
                  className="border rounded p-2 bg-light d-flex flex-column align-items-center justify-content-center text-center"
                  style={{ minHeight: '180px' }}
                >
                  {formData.image.trim() ? (
                    <img
                      src={formData.image.trim()}
                      alt="Banner Preview"
                      className="img-fluid rounded shadow-sm"
                      style={{ maxHeight: '160px', width: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="text-muted p-3">
                      <div style={{ fontSize: '32px' }}>🖼️</div>
                      <small className="text-muted">No image URL entered</small>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ========================================================================= */}
      {/* 3. Detail / Preview Modal                                                */}
      {/* ========================================================================= */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Banner Details & Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCarousel && (
            <div>
              <div className="rounded overflow-hidden shadow-sm border mb-4 bg-dark">
                <img
                  src={selectedCarousel.image}
                  alt={selectedCarousel.title || 'Banner'}
                  style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                />
              </div>

              <div className="p-3 bg-light rounded border">
                <div className="mb-2">
                  <span className="text-muted small d-block">Heading / Title</span>
                  <strong>{selectedCarousel.title || '—'}</strong>
                </div>
                <div className="mb-2">
                  <span className="text-muted small d-block">Description</span>
                  <span>{selectedCarousel.description || '—'}</span>
                </div>
                <div className="mb-2">
                  <span className="text-muted small d-block">Target Redirect Link</span>
                  {selectedCarousel.url ? (
                    <a href={selectedCarousel.url} target="_blank" rel="noreferrer" className="text-primary">
                      {selectedCarousel.url}
                    </a>
                  ) : (
                    '—'
                  )}
                </div>
                <div className="d-flex gap-4 mt-3">
                  <div>
                    <span className="text-muted small d-block">Display Sequence</span>
                    <Badge bg="light" text="dark" className="border">
                      #{selectedCarousel.order}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted small d-block">Current Status</span>
                    <Badge bg={selectedCarousel.isActive ? 'success' : 'secondary'}>
                      {selectedCarousel.isActive ? 'Active on Storefront' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div className="border-top pt-2 mt-3 text-muted small">
                  <div>Created: {new Date(selectedCarousel.createdAt).toLocaleString()}</div>
                  <div>Last Updated: {new Date(selectedCarousel.updatedAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
          {selectedCarousel && (
            <Button
              variant="primary"
              onClick={() => {
                setShowDetailModal(false);
                handleOpenEditModal(selectedCarousel);
              }}
            >
              Edit This Banner
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* ========================================================================= */}
      {/* 4. Delete Modal                                                          */}
      {/* ========================================================================= */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-danger">Delete Banner</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete this banner{' '}
            {selectedCarousel?.title ? <strong>"{selectedCarousel.title}"</strong> : ''}?
          </p>
          <Alert variant="warning" className="small mb-0">
            This will immediately remove the banner from your storefront homepage.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteSubmit} disabled={submitting}>
            {submitting ? 'Deleting...' : 'Confirm Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
