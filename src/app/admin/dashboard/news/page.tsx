'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Card, Table, Button, Spinner, Alert, Modal, Form, Pagination, Badge, Row, Col } from 'react-bootstrap';
import { adminService } from '@/services/adminService';
import { toast } from 'react-toastify';

interface MerchantOption {
  _id: string;
  name: string;
  business_name?: string;
  subdomain?: string;
}

export default function AdminNewsPage() {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [merchants, setMerchants] = useState<MerchantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering & Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNews, setTotalNews] = useState(0);
  const [selectedMerchantId, setSelectedMerchantId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    date: new Date().toISOString().split('T')[0],
    merchantId: '',
    is_active: true
  });
  const [saving, setSaving] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  // Load merchants for filter & form dropdown
  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const res = await adminService.getAdminMerchants(1, 100);
        if (res.status && res.merchants) {
          setMerchants(res.merchants);
        }
      } catch (err) {
        console.error('Failed to load merchants', err);
      }
    };
    fetchMerchants();
  }, []);

  // Load news list
  const loadNews = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getNews(page, limit, selectedMerchantId, searchTerm, activeFilter);
      if (res.status && res.news) {
        setNewsList(res.news);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalNews(res.pagination?.totalNews || 0);
      } else {
        setError(res.message || 'Failed to load news');
      }
    } catch (err: any) {
      setError(err.message || 'Server error loading news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, [page, selectedMerchantId, activeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadNews();
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedNews(null);
    setFormData({
      title: '',
      description: '',
      image: '',
      date: new Date().toISOString().split('T')[0],
      merchantId: selectedMerchantId || '',
      is_active: true
    });
    setSelectedImageFile(null);
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: any) => {
    setModalMode('edit');
    setSelectedNews(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      image: item.image || '',
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      merchantId: item.merchantId?._id || item.merchantId || '',
      is_active: item.is_active !== undefined ? item.is_active : true
    });
    setSelectedImageFile(null);
    setShowModal(true);
  };

  // Save News (Create / Edit)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    setSaving(true);
    try {
      const uploadData = new FormData();
      uploadData.append('title', formData.title.trim());
      uploadData.append('description', formData.description.trim());
      if (formData.image) uploadData.append('image', formData.image.trim());
      if (selectedImageFile) uploadData.append('image', selectedImageFile);
      if (formData.date) uploadData.append('date', formData.date);
      uploadData.append('is_active', formData.is_active.toString());
      if (formData.merchantId) uploadData.append('merchantId', formData.merchantId);

      if (modalMode === 'create') {
        const res = await adminService.createNews(uploadData as any);
        if (res.status) {
          toast.success('News article created successfully');
          setShowModal(false);
          loadNews();
        } else {
          toast.error(res.message || 'Failed to create news');
        }
      } else {
        const res = await adminService.updateNews(selectedNews._id, uploadData as any);
        if (res.status) {
          toast.success('News article updated successfully');
          setShowModal(false);
          loadNews();
        } else {
          toast.error(res.message || 'Failed to update news');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Error saving news');
    } finally {
      setSaving(false);
    }
  };

  // Toggle status
  const handleToggleStatus = async (item: any) => {
    try {
      const res = await adminService.toggleNewsStatus(item._id);
      if (res.status) {
        toast.success(res.message || 'Status updated');
        setNewsList(newsList.map(n => n._id === item._id ? { ...n, is_active: !n.is_active } : n));
      } else {
        toast.error(res.message || 'Failed to update status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating status');
    }
  };

  // Delete news
  const confirmDelete = (item: any) => {
    setNewsToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!newsToDelete) return;
    setDeleting(true);
    try {
      const res = await adminService.deleteNews(newsToDelete._id);
      if (res.status) {
        toast.success('News article deleted successfully');
        setShowDeleteModal(false);
        setNewsToDelete(null);
        loadNews();
      } else {
        toast.error(res.message || 'Failed to delete news');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error deleting news');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">News & Articles Management</h2>
          <p className="text-muted mb-0">Publish platform news and manage articles for merchants.</p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate} className="d-flex align-items-center gap-2">
          <span>+</span>
          <span>Add News Article</span>
        </Button>
      </div>

      {/* Filters Bar */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Label className="small fw-bold text-muted">Search News</Form.Label>
              <Form onSubmit={handleSearchSubmit}>
                <Form.Control
                  type="text"
                  placeholder="Search by title or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form>
            </Col>

            <Col md={3}>
              <Form.Label className="small fw-bold text-muted">Filter by Merchant</Form.Label>
              <Form.Select
                value={selectedMerchantId}
                onChange={(e) => {
                  setSelectedMerchantId(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All News (System & Merchants)</option>
                <option value="none">Global News Only (No Merchant)</option>
                {merchants.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.business_name || m.name} {m.subdomain ? `(@${m.subdomain})` : ''}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Label className="small fw-bold text-muted">Status</Form.Label>
              <Form.Select
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Statuses</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </Form.Select>
            </Col>

            <Col md={2} className="d-flex gap-2">
              <Button variant="secondary" className="w-100" onClick={() => { setPage(1); loadNews(); }}>
                Filter
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedMerchantId('');
                  setActiveFilter('');
                  setPage(1);
                }}
              >
                Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Main Content Table */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          {error && <Alert variant="danger" className="m-3">{error}</Alert>}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted small">Loading news articles...</p>
            </div>
          ) : newsList.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <div style={{ fontSize: '48px' }}>📰</div>
              <p className="fw-semibold mt-2 mb-1">No news articles found</p>
              <p className="small text-muted mb-3">Get started by creating the first news article.</p>
              <Button variant="primary" size="sm" onClick={handleOpenCreate}>
                + Add News Article
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="bg-light text-muted small text-uppercase">
                  <tr>
                    <th style={{ width: '80px' }}>Image</th>
                    <th>Title & Content</th>
                    <th>Merchant / Source</th>
                    <th>Published Date</th>
                    <th>Status</th>
                    <th className="text-end" style={{ width: '140px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {newsList.map((item) => (
                    <tr key={item._id}>
                      <td>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="rounded object-fit-cover shadow-sm"
                            style={{ width: '60px', height: '45px' }}
                            onError={(e: any) => { e.target.src = 'https://via.placeholder.com/60x45?text=News'; }}
                          />
                        ) : (
                          <div
                            className="rounded bg-light text-muted d-flex align-items-center justify-content-center border"
                            style={{ width: '60px', height: '45px', fontSize: '18px' }}
                          >
                            📰
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="fw-bold text-dark mb-1">{item.title}</div>
                        <div className="text-muted small text-truncate" style={{ maxWidth: '350px' }}>
                          {item.description}
                        </div>
                      </td>
                      <td>
                        {item.merchantId ? (
                          <div>
                            <span className="fw-semibold text-primary">
                              {item.merchantId.business_name || item.merchantId.name}
                            </span>
                            {item.merchantId.subdomain && (
                              <span className="badge bg-light text-dark border ms-1">
                                @{item.merchantId.subdomain}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge bg="secondary" className="text-uppercase px-2 py-1">
                            System / Global
                          </Badge>
                        )}
                      </td>
                      <td>
                        <div className="small text-dark">
                          {item.date ? new Date(item.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : '—'}
                        </div>
                      </td>
                      <td>
                        <Badge
                          bg={item.is_active ? 'success' : 'danger'}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleToggleStatus(item)}
                          title="Click to toggle status"
                        >
                          {item.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2 py-1 px-2"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit News"
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="py-1 px-2"
                          onClick={() => confirmDelete(item)}
                          title="Delete News"
                        >
                          🗑️
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>

        {/* Pagination Footer */}
        {!loading && totalNews > 0 && (
          <Card.Footer className="bg-white border-top d-flex justify-content-between align-items-center py-3">
            <span className="small text-muted">
              Showing <strong>{newsList.length}</strong> of <strong>{totalNews}</strong> articles
            </span>
            <Pagination className="mb-0">
              <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)} />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Pagination.Item key={p} active={p === page} onClick={() => setPage(p)}>
                  {p}
                </Pagination.Item>
              ))}
              <Pagination.Next disabled={page === totalPages} onClick={() => setPage(page + 1)} />
            </Pagination>
          </Card.Footer>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold">
              {modalMode === 'create' ? 'Add New News Article' : 'Edit News Article'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-bold small">Title <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter news title..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-bold small">Description / Content <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder="Enter detailed news content / description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={8}>
                <Form.Group>
                  <Form.Label className="fw-bold small">Upload Image (File)</Form.Label>
                  <Form.Control
                    type="file"
                    className="mb-2"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedImageFile(e.target.files[0]);
                      }
                    }}
                  />
                  <Form.Text className="text-muted small">
                    Upload a file or provide a direct image URL for the article thumbnail.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold small">Publish Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </Form.Group>
              </Col>

              {(selectedImageFile || formData.image) && (
                <Col xs={12}>
                  <div className="p-2 border rounded bg-light">
                    <span className="small text-muted d-block mb-1">Image Preview:</span>
                    <img
                      src={selectedImageFile ? URL.createObjectURL(selectedImageFile) : formData.image}
                      alt="Preview"
                      style={{ maxHeight: '160px', maxWidth: '100%' }}
                      className="rounded object-fit-cover"
                      onError={(e: any) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                </Col>
              )}

              <Col md={8}>
                <Form.Group>
                  <Form.Label className="fw-bold small">Assign to Merchant</Form.Label>
                  <Form.Select
                    value={formData.merchantId}
                    onChange={(e) => setFormData({ ...formData, merchantId: e.target.value })}
                  >
                    <option value="">System / Global (Platform News)</option>
                    {merchants.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.business_name || m.name} {m.subdomain ? `(@${m.subdomain})` : ''}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4} className="d-flex align-items-end">
                <Form.Group className="mb-2">
                  <Form.Check
                    type="switch"
                    id="news-active-switch"
                    label="Is Active / Published"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? <Spinner size="sm" animation="border" /> : (modalMode === 'create' ? 'Create News' : 'Save Changes')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-danger">Delete News Article</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this news article?</p>
          <div className="p-3 bg-light rounded border">
            <strong>{newsToDelete?.title}</strong>
            <p className="small text-muted mb-0 mt-1 text-truncate">{newsToDelete?.description}</p>
          </div>
          <p className="text-danger small mt-2 mb-0">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Spinner size="sm" animation="border" /> : 'Delete Article'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
