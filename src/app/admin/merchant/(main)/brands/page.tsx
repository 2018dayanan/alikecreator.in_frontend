'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Card, Table, Button, Spinner, Alert, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import { adminService } from '@/services/adminService';
import { toast } from 'react-toastify';

/* -------------------------------------------------------------------------- */
/*  Reusable Searchable Dropdown for Merchant Selection                       */
/* -------------------------------------------------------------------------- */
interface SearchableOption {
  _id: string;
  label: string;
  sublabel?: string;
}

function SearchableSelect({
  label, required, placeholder, options, loading, value, onChange, allowAll = false, allLabel = 'All Merchants'
}: any) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o: any) => o._id === value);

  useEffect(() => {
    if (!open) {
      if (value === '' && allowAll) {
        setSearch('');
      } else {
        setSearch(selected ? selected.label : '');
      }
    }
  }, [selected, open, value, allowAll]);

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [open]);

  const filtered = options.filter((o: any) => {
    const q = search.toLowerCase();
    return o.label.toLowerCase().includes(q) || (o.sublabel || '').toLowerCase().includes(q);
  });

  const handleSelect = (opt: any | null) => {
    if (!opt) {
      onChange('');
      setSearch('');
    } else {
      onChange(opt._id);
      setSearch(opt.label);
    }
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="position-relative" onClick={(e) => e.stopPropagation()}>
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">{label} {required && <span className="text-danger">*</span>}</Form.Label>
        <div className="position-relative">
          <Form.Control
            type="text"
            placeholder={placeholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setHighlightIdx(0);
              setOpen(true);
              if (value) onChange('');
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (!open) return;
              if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1)); }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIdx((i) => Math.max(i - 1, 0)); }
              else if (e.key === 'Enter') { e.preventDefault(); if (filtered[highlightIdx]) handleSelect(filtered[highlightIdx]); }
              else if (e.key === 'Escape') setOpen(false);
            }}
            autoComplete="off"
          />
        </div>
        {open && (
          <div className="position-absolute w-100 mt-1 shadow-sm border bg-white rounded" style={{ zIndex: 1050, maxHeight: '220px', overflowY: 'auto' }}>
            {allowAll && (
              <div className="p-2 border-bottom text-primary fw-semibold" style={{ cursor: 'pointer', backgroundColor: value === '' ? '#eef2ff' : 'transparent' }} onClick={() => handleSelect(null)}>
                🌐 {allLabel}
              </div>
            )}
            {loading ? <div className="p-3 text-center text-muted"><Spinner size="sm" /> Loading...</div> :
              filtered.length > 0 ? filtered.map((opt: any, idx: number) => (
                <div key={opt._id} className="p-2 border-bottom" style={{ cursor: 'pointer', backgroundColor: idx === highlightIdx ? '#f0f4ff' : 'transparent' }} onMouseEnter={() => setHighlightIdx(idx)} onClick={() => handleSelect(opt)}>
                  <strong>{opt.label}</strong>
                  {opt.sublabel && <><br /><small className="text-muted">{opt.sublabel}</small></>}
                </div>
              )) : <div className="p-2 text-muted">No merchants found</div>}
          </div>
        )}
      </Form.Group>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Admin Brands Page                                                    */
/* -------------------------------------------------------------------------- */
interface BrandItem {
  _id: string;
  title: string;
  description: string;
  logo: string;
  bgImage: string;
  merchantId?: any;
  isActive: boolean;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedMerchantFilter, setSelectedMerchantFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [merchants, setMerchants] = useState<SearchableOption[]>([]);
  const [loadingMerchants, setLoadingMerchants] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<BrandItem | null>(null);

  const [formData, setFormData] = useState({
    merchantId: '',
    title: '',
    description: '',
    isActive: true,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bgImageFile, setBgImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchMerchants = async () => {
    try {
      setLoadingMerchants(true);
      const res = await adminService.getMerchants();
      const list = res.merchants || res.data || [];
      setMerchants(list.map((m: any) => ({
        _id: m._id,
        label: m.business_name ? `${m.business_name} (${m.name})` : m.name,
        sublabel: m.email,
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMerchants(false);
    }
  };

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminService.getAdminBrands(1, 100, selectedMerchantFilter, searchTerm);
      if (res.status !== false) {
        setBrands(res.data || []);
      } else {
        setError(res.message || 'Failed to fetch brands');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMerchants(); }, []);
  useEffect(() => { fetchBrands(); }, [selectedMerchantFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBrands();
  };

  const handleOpenCreateModal = () => {
    setFormData({ merchantId: selectedMerchantFilter || '', title: '', description: '', isActive: true });
    setLogoFile(null);
    setBgImageFile(null);
    setFormError('');
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (brand: BrandItem) => {
    setSelectedBrand(brand);
    setFormData({
      merchantId: brand.merchantId?._id || brand.merchantId || '',
      title: brand.title || '',
      description: brand.description || '',
      isActive: brand.isActive ?? true,
    });
    setLogoFile(null);
    setBgImageFile(null);
    setFormError('');
    setShowEditModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.merchantId) return setFormError('Merchant is required');
    if (!formData.title) return setFormError('Title is required');
    if (!logoFile) return setFormError('Logo file is required for new brands');
    if (!bgImageFile) return setFormError('Background image file is required for new brands');

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append('merchantId', formData.merchantId);
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('isActive', String(formData.isActive));
      fd.append('logo', logoFile);
      fd.append('bgImage', bgImageFile);

      const res = await adminService.createBrand(fd);
      if (res.status !== false) {
        toast.success('Brand created successfully!');
        setShowCreateModal(false);
        fetchBrands();
      } else {
        setFormError(res.message || 'Failed to create brand');
      }
    } catch (err: any) {
      setFormError(err.message || 'Error creating brand');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrand) return;

    try {
      setSubmitting(true);
      const fd = new FormData();
      if (formData.merchantId) fd.append('merchantId', formData.merchantId);
      if (formData.title) fd.append('title', formData.title);
      if (formData.description) fd.append('description', formData.description);
      fd.append('isActive', String(formData.isActive));
      if (logoFile) fd.append('logo', logoFile);
      if (bgImageFile) fd.append('bgImage', bgImageFile);

      const res = await adminService.updateBrand(selectedBrand._id, fd);
      if (res.status !== false) {
        toast.success('Brand updated successfully!');
        setShowEditModal(false);
        fetchBrands();
      } else {
        setFormError(res.message || 'Failed to update brand');
      }
    } catch (err: any) {
      setFormError(err.message || 'Error updating brand');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedBrand) return;
    try {
      setSubmitting(true);
      const res = await adminService.deleteBrand(selectedBrand._id);
      if (res.status !== false) {
        toast.success('Brand deleted successfully');
        setShowDeleteModal(false);
        fetchBrands();
      } else {
        toast.error(res.message || 'Failed to delete brand');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error deleting brand');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Trusted Brands Management</h2>
          <p className="text-muted mb-0">Create and manage premium partners for merchant stores.</p>
        </div>
        <Button variant="primary" onClick={handleOpenCreateModal}>➕ Add Brand</Button>
      </div>

      <Card className="border-0 shadow-sm rounded-3 mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col xs={12} md={5}>
              <SearchableSelect
                label="Filter by Merchant"
                placeholder="Search merchant or select All..."
                options={merchants}
                loading={loadingMerchants}
                value={selectedMerchantFilter}
                onChange={(id: string) => setSelectedMerchantFilter(id)}
                allowAll={true}
              />
            </Col>
            <Col xs={12} md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Search Brand</Form.Label>
                <Form.Control type="text" placeholder="Title, description..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)} />
              </Form.Group>
            </Col>
            <Col xs={12} md={3} className="mb-3 d-flex gap-2">
              <Button variant="primary" className="flex-grow-1" onClick={handleSearchSubmit}>Search</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-0">
          {error && <div className="p-4"><Alert variant="danger" className="mb-0">{error}</Alert></div>}
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Loading brands...</p></div>
          ) : brands.length === 0 ? (
            <div className="text-center py-5">
              <h5 className="fw-bold mt-3">No Brands Found</h5>
              <p className="text-muted">Start by adding a new brand for a merchant.</p>
              <Button variant="primary" onClick={handleOpenCreateModal}>➕ Add Brand</Button>
            </div>
          ) : (
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Preview</th>
                  <th>Title</th>
                  <th>Merchant</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand._id}>
                    <td className="ps-4">
                      <div className="position-relative border rounded" style={{ width: '80px', height: '40px', background: `url(${brand.bgImage}) center/cover` }}>
                        <div className="position-absolute w-100 h-100 bg-white" style={{ opacity: 0.8 }} />
                        <img src={brand.logo} alt="logo" className="position-absolute top-50 start-50 translate-middle" style={{ maxWidth: '60px', maxHeight: '30px', objectFit: 'contain' }} />
                      </div>
                    </td>
                    <td><div className="fw-bold">{brand.title}</div><div className="small text-muted text-truncate" style={{ maxWidth: '200px' }}>{brand.description}</div></td>
                    <td>{brand.merchantId?.business_name || brand.merchantId?.name || 'Unknown'}</td>
                    <td><Badge bg={brand.isActive ? 'success' : 'secondary'}>{brand.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="text-end pe-4">
                      <Button variant="light" size="sm" className="me-2 text-primary" onClick={() => handleOpenEditModal(brand)}>✏️ Edit</Button>
                      <Button variant="light" size="sm" className="text-danger" onClick={() => { setSelectedBrand(brand); setShowDeleteModal(true); }}>🗑️</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Create / Edit Modal */}
      <Modal show={showCreateModal || showEditModal} onHide={() => { setShowCreateModal(false); setShowEditModal(false); }} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{showEditModal ? 'Edit Brand' : 'Create New Brand'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={showEditModal ? handleUpdateSubmit : handleCreateSubmit}>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <Row className="g-3">
              <Col xs={12}>
                <SearchableSelect label="Assign to Merchant" required placeholder="Select a merchant..." options={merchants} loading={loadingMerchants} value={formData.merchantId} onChange={(id: string) => setFormData({ ...formData, merchantId: id })} />
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Brand Title <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" placeholder="e.g. Nike" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={2} placeholder="Brief description..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Logo Image {showCreateModal && <span className="text-danger">*</span>}</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={(e: any) => setLogoFile(e.target.files[0])} />
                  {showEditModal && !logoFile && selectedBrand?.logo && <div className="mt-2 small text-muted">Current: <img src={selectedBrand.logo} alt="logo" height="30" /></div>}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Background Image {showCreateModal && <span className="text-danger">*</span>}</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={(e: any) => setBgImageFile(e.target.files[0])} />
                  {showEditModal && !bgImageFile && selectedBrand?.bgImage && <div className="mt-2 small text-muted">Current: <img src={selectedBrand.bgImage} alt="bg" height="30" /></div>}
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Check type="switch" id="brand-active" label="Is Active?" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} disabled={submitting}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>{submitting ? <Spinner size="sm" /> : (showEditModal ? 'Update Brand' : 'Create Brand')}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0 text-danger"><Modal.Title>Delete Brand?</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete <strong>{selectedBrand?.title}</strong>? This action cannot be undone.</Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={submitting}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteSubmit} disabled={submitting}>{submitting ? 'Deleting...' : 'Delete Brand'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
