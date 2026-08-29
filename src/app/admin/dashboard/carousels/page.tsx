'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Card, Table, Button, Spinner, Alert, Modal, Form, Pagination, Badge, Row, Col } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
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

interface SearchableSelectProps {
  label: string;
  required?: boolean;
  placeholder: string;
  options: SearchableOption[];
  loading?: boolean;
  value: string;
  onChange: (id: string) => void;
  allowAll?: boolean;
  allLabel?: string;
}

function SearchableSelect({
  label,
  required,
  placeholder,
  options,
  loading,
  value,
  onChange,
  allowAll = false,
  allLabel = 'All Merchants / System Wide'
}: SearchableSelectProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o._id === value);

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
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [open]);

  const filtered = options.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.label.toLowerCase().includes(q) ||
      (o.sublabel || '').toLowerCase().includes(q)
    );
  });

  const handleSelect = (opt: SearchableOption | null) => {
    if (!opt) {
      onChange('');
      setSearch('');
    } else {
      onChange(opt._id);
      setSearch(opt.label);
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
    setOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlightIdx]) handleSelect(filtered[highlightIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div
      ref={wrapperRef}
      className="position-relative"
      onClick={(e) => e.stopPropagation()}
    >
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">
          {label} {required && <span className="text-danger">*</span>}
        </Form.Label>
        <div className="position-relative">
          <Form.Control
            type="text"
            placeholder={placeholder}
            className="placeholder-gray"
            style={{ color: value && !open ? '#212529' : undefined }}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setHighlightIdx(0);
              setOpen(true);
              if (value) onChange('');
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          {(search || value) && (
            <button
              type="button"
              onClick={handleClear}
              aria-label={`Clear ${label}`}
              className="btn-close"
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '10px',
              }}
            />
          )}
        </div>

        {open && (
          <div
            className="position-absolute w-100 mt-1 shadow-sm border bg-white rounded"
            style={{ zIndex: 1050, maxHeight: '220px', overflowY: 'auto' }}
          >
            {allowAll && (
              <div
                className="p-2 border-bottom text-primary fw-semibold"
                style={{ cursor: 'pointer', backgroundColor: value === '' ? '#eef2ff' : 'transparent' }}
                onClick={() => handleSelect(null)}
              >
                🌐 {allLabel}
                {value === '' && <span className="float-end text-success">✓</span>}
              </div>
            )}
            {loading ? (
              <div className="p-3 text-center text-muted">
                <Spinner animation="border" size="sm" className="me-2" />
                Loading merchants...
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((opt, idx) => (
                <div
                  key={opt._id}
                  className="p-2 border-bottom"
                  style={{
                    cursor: 'pointer',
                    backgroundColor:
                      idx === highlightIdx
                        ? '#f0f4ff'
                        : opt._id === value
                          ? '#f8f9fa'
                          : 'transparent',
                  }}
                  onMouseEnter={() => setHighlightIdx(idx)}
                  onClick={() => handleSelect(opt)}
                >
                  <strong>{opt.label}</strong>
                  {opt.sublabel && (
                    <>
                      <br />
                      <small className="text-muted">{opt.sublabel}</small>
                    </>
                  )}
                  {opt._id === value && (
                    <span className="float-end text-success">✓</span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-2 text-muted">No merchants found</div>
            )}
          </div>
        )}

        {value && !open && (
          <Form.Text className="text-success">
            Selected: <strong>{selected?.label}</strong>
          </Form.Text>
        )}
      </Form.Group>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Admin Carousels / Banners Management Page                            */
/* -------------------------------------------------------------------------- */

interface CarouselItem {
  _id: string;
  title?: string;
  description?: string;
  image: string;
  url?: string;
  merchantId?: {
    _id: string;
    name?: string;
    email?: string;
    business_name?: string;
    mobile?: string;
    subdomain?: string;
  } | null;
  adminId?: {
    _id: string;
    name?: string;
    username?: string;
    email?: string;
  } | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  is_admin?: boolean;
}

export default function AdminCarouselsPage() {
  const router = useRouter();

  // State
  const [carousels, setCarousels] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering & Pagination State
  const [selectedMerchantFilter, setSelectedMerchantFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCarousels, setTotalCarousels] = useState(0);
  const limit = 10;

  // Merchant List State for Dropdowns
  const [merchants, setMerchants] = useState<SearchableOption[]>([]);
  const [loadingMerchants, setLoadingMerchants] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Selected Items for View/Edit/Delete
  const [selectedCarousel, setSelectedCarousel] = useState<CarouselItem | null>(null);

  // Form State for Create/Edit
  const [formData, setFormData] = useState({
    merchantId: '',
    is_admin: false,
    title: '',
    description: '',
    image: '',
    url: '',
    order: 0,
    isActive: true,
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // 1. Fetch Merchants for the Dropdown
  const fetchMerchants = async () => {
    try {
      setLoadingMerchants(true);
      const res = await adminService.getMerchants();
      const list = res.merchants || res.data || [];
      const opts: SearchableOption[] = list.map((m: any) => ({
        _id: m._id,
        label: m.business_name ? `${m.business_name} (${m.name || m.email})` : m.name || m.email,
        sublabel: `${m.email} ${m.subdomain ? `• Subdomain: ${m.subdomain}` : ''}`,
      }));
      setMerchants(opts);
    } catch (err) {
      console.error('Error loading merchants:', err);
    } finally {
      setLoadingMerchants(false);
    }
  };

  // 2. Fetch Carousels from API
  const fetchCarousels = async () => {
    try {
      setLoading(true);
      setError('');

      let activeParam: boolean | undefined = undefined;
      if (statusFilter === 'active') activeParam = true;
      if (statusFilter === 'inactive') activeParam = false;

      const res = await adminService.getAdminCarousels(
        currentPage,
        limit,
        selectedMerchantFilter,
        activeParam,
        searchTerm
      );

      if (res.status !== false) {
        setCarousels(res.carousels || []);
        setTotalCarousels(res.pagination?.totalCarousels ?? (res.carousels?.length || 0));
        setTotalPages(res.pagination?.totalPages || 1);
      } else {
        setError(res.message || 'Failed to fetch carousels');
      }
    } catch (err: any) {
      console.error('Error fetching carousels:', err);
      setError(err.message || 'Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  // Initial Load & on Filter/Page Change
  useEffect(() => {
    fetchMerchants();
  }, []);

  useEffect(() => {
    fetchCarousels();
  }, [currentPage, selectedMerchantFilter, statusFilter]);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCarousels();
  };

  const handleClearFilters = () => {
    setSelectedMerchantFilter('');
    setStatusFilter('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Open Create Modal (pre-select filtered merchant if active)
  const handleOpenCreateModal = () => {
    setFormData({
      merchantId: '',
      is_admin: false,
      title: '',
      description: '',
      image: '',
      url: '',
      order: 0,
      isActive: true,
    });
    setSelectedImageFile(null);
    setFormError('');
    setShowCreateModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (carousel: CarouselItem) => {
    setSelectedCarousel(carousel);
    setFormData({
      merchantId: carousel.merchantId?._id || (typeof carousel.merchantId === 'string' ? carousel.merchantId : ''),
      is_admin: carousel.is_admin || false,
      title: carousel.title || '',
      description: carousel.description || '',
      image: carousel.image || '',
      url: carousel.url || '',
      order: carousel.order || 0,
      isActive: carousel.isActive,
    });
    setSelectedImageFile(null);
    setFormError('');
    setShowEditModal(true);
  };

  // Handle Create Carousel
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image.trim() && !selectedImageFile) {
      setFormError('Banner image URL or File is required');
      return;
    }
    if (!formData.is_admin && !formData.merchantId) {
      setFormError('Merchant is required for merchant carousels.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      const uploadData = new FormData();
      uploadData.append('title', formData.title.trim());
      uploadData.append('description', formData.description.trim());
      if (formData.image) uploadData.append('image', formData.image.trim());
      if (selectedImageFile) uploadData.append('image', selectedImageFile);
      if (formData.url) uploadData.append('url', formData.url.trim());
      if (formData.merchantId) uploadData.append('merchantId', formData.merchantId);
      uploadData.append('is_admin', String(formData.is_admin));
      uploadData.append('order', (Number(formData.order) || 0).toString());
      uploadData.append('isActive', formData.isActive.toString());

      const res = await adminService.createCarousel(uploadData as any);

      if (res.status !== false) {
        toast.success(res.message || 'Carousel banner created successfully!');
        setShowCreateModal(false);
        fetchCarousels();
      } else {
        setFormError(res.message || 'Failed to create carousel banner');
      }
    } catch (err: any) {
      setFormError(err.message || 'Error creating carousel banner');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Update Carousel
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCarousel) return;

    if (!formData.image.trim() && !selectedImageFile) {
      setFormError('Banner image URL or File is required');
      return;
    }
    if (!formData.is_admin && !formData.merchantId) {
      setFormError('Merchant is required for merchant carousels.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      const uploadData = new FormData();
      uploadData.append('title', formData.title.trim());
      uploadData.append('description', formData.description.trim());
      if (formData.image) uploadData.append('image', formData.image.trim());
      if (selectedImageFile) uploadData.append('image', selectedImageFile);
      if (formData.url) uploadData.append('url', formData.url.trim());
      if (formData.merchantId) uploadData.append('merchantId', formData.merchantId);
      uploadData.append('is_admin', String(formData.is_admin));
      uploadData.append('order', (Number(formData.order) || 0).toString());
      uploadData.append('isActive', formData.isActive.toString());

      const res = await adminService.updateCarousel(selectedCarousel._id, uploadData as any);

      if (res.status !== false) {
        toast.success(res.message || 'Carousel banner updated successfully!');
        setShowEditModal(false);
        fetchCarousels();
      } else {
        setFormError(res.message || 'Failed to update carousel banner');
      }
    } catch (err: any) {
      setFormError(err.message || 'Error updating carousel banner');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Toggle Active Status
  const handleToggleStatus = async (carousel: CarouselItem) => {
    try {
      const res = await adminService.toggleCarouselStatus(carousel._id);
      if (res.status !== false) {
        toast.success(res.message || 'Status updated successfully');
        // Update local state smoothly
        setCarousels((prev) =>
          prev.map((c) =>
            c._id === carousel._id ? { ...c, isActive: !c.isActive } : c
          )
        );
      } else {
        toast.error(res.message || 'Failed to update status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle status');
    }
  };

  // Handle Delete Carousel
  const handleDeleteSubmit = async () => {
    if (!selectedCarousel) return;

    try {
      setSubmitting(true);
      const res = await adminService.deleteCarousel(selectedCarousel._id);

      if (res.status !== false) {
        toast.success(res.message || 'Carousel banner deleted successfully');
        setShowDeleteModal(false);
        fetchCarousels();
      } else {
        toast.error(res.message || 'Failed to delete carousel banner');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error deleting carousel banner');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMerchantObj = merchants.find((m) => m._id === selectedMerchantFilter);

  return (
    <div className="carousel-admin-page">
      {/* Global CSS for Clean Gray Placeholders across all form fields */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .carousel-admin-page input::placeholder,
          .carousel-admin-page textarea::placeholder,
          .carousel-admin-page select::placeholder,
          .carousel-admin-page .placeholder-gray::placeholder,
          .modal input::placeholder,
          .modal textarea::placeholder,
          .modal .placeholder-gray::placeholder {
            color: #8c98a4 !important;
            opacity: 1 !important;
            font-size: 0.95rem;
          }
          .carousel-admin-page input::-webkit-input-placeholder,
          .carousel-admin-page textarea::-webkit-input-placeholder,
          .modal input::-webkit-input-placeholder,
          .modal textarea::-webkit-input-placeholder {
            color: #8c98a4 !important;
            opacity: 1 !important;
          }
          .carousel-admin-page input:-ms-input-placeholder,
          .carousel-admin-page textarea:-ms-input-placeholder,
          .modal input:-ms-input-placeholder,
          .modal textarea:-ms-input-placeholder {
            color: #8c98a4 !important;
            opacity: 1 !important;
          }
        `
      }} />

      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Carousel / Banner Management</h2>
          <p className="text-muted mb-0">
            Create, assign, and customize homepage hero banners for individual merchant stores or platform-wide.
          </p>
        </div>
        <Button variant="primary" className="d-flex align-items-center gap-2 shadow-sm" onClick={handleOpenCreateModal}>
          <span>➕</span>
          <span>Add Carousel Banner</span>
        </Button>
      </div>

      {/* Stats Summary Cards */}
      <Row className="mb-4 g-3">
        <Col xs={12} sm={6} md={3}>
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
        <Col xs={12} sm={6} md={3}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success"
                style={{ width: '48px', height: '48px', fontSize: '20px' }}
              >
                ✅
              </div>
              <div>
                <div className="text-muted small">Active Banners</div>
                <h4 className="fw-bold mb-0">
                  {carousels.filter((c) => c.isActive).length}
                </h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-warning bg-opacity-10 text-warning"
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
        <Col xs={12} sm={6} md={3}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-info bg-opacity-10 text-info"
                style={{ width: '48px', height: '48px', fontSize: '20px' }}
              >
                🏪
              </div>
              <div>
                <div className="text-muted small">Active Merchants</div>
                <h4 className="fw-bold mb-0">{merchants.length}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filter and Search Bar */}
      <Card className="border-0 shadow-sm rounded-3 mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            {/* 1. Merchant Filter */}
            <Col xs={12} md={4}>
              <SearchableSelect
                label="Filter by Merchant Account"
                placeholder="Search merchant or select All..."
                options={merchants}
                loading={loadingMerchants}
                value={selectedMerchantFilter}
                onChange={(id) => {
                  setSelectedMerchantFilter(id);
                  setCurrentPage(1);
                }}
                allowAll={true}
                allLabel="All Merchants & Platform Banners"
              />
            </Col>

            {/* 2. Status Filter */}
            <Col xs={12} sm={6} md={3}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Status Filter</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* 3. Search Query Input */}
            <Col xs={12} sm={6} md={3}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Keyword Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search title, description..."
                  className="placeholder-gray"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                />
              </Form.Group>
            </Col>

            {/* 4. Action Buttons */}
            <Col xs={12} md={2} className="mb-3 d-flex gap-2">
              <Button variant="primary" className="flex-grow-1" onClick={handleSearchSubmit}>
                Search
              </Button>
              <Button variant="outline-secondary" onClick={handleClearFilters} title="Reset Filters">
                Reset
              </Button>
            </Col>
          </Row>

          {/* Active Filter Indicator */}
          {selectedMerchantFilter && selectedMerchantObj && (
            <div className="d-flex align-items-center gap-2 mt-2 pt-2 border-top">
              <span className="text-muted small">Active Merchant Filter:</span>
              <Badge bg="primary" className="p-2 d-flex align-items-center gap-2">
                <span>🏪 {selectedMerchantObj.label}</span>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  style={{ fontSize: '8px' }}
                  onClick={() => setSelectedMerchantFilter('')}
                />
              </Badge>
              <span className="text-muted small ms-2">
                (New banners will default to this merchant)
              </span>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Main Table / Content Area */}
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
              <p className="mt-2 text-muted">Loading carousel banners...</p>
            </div>
          ) : carousels.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ fontSize: '48px' }}>🏜️</div>
              <h5 className="fw-bold mt-3">No Carousel Banners Found</h5>
              <p className="text-muted max-w-sm mx-auto">
                {selectedMerchantFilter
                  ? 'There are no banner carousels configured for this selected merchant yet.'
                  : 'Get started by creating your first carousel banner.'}
              </p>
              <Button variant="primary" className="mt-2" onClick={handleOpenCreateModal}>
                ➕ Create Banner Now
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '80px' }} className="ps-4">
                      Banner
                    </th>
                    <th>Title & Info</th>
                    <th>Merchant Account</th>
                    <th>Target URL</th>
                    <th className="text-center">Order</th>
                    <th className="text-center">Status</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {carousels.map((item) => (
                    <tr key={item._id}>
                      {/* Image Thumbnail */}
                      <td className="ps-4">
                        <div
                          className="rounded overflow-hidden border bg-light d-flex align-items-center justify-content-center shadow-sm"
                          style={{ width: '90px', height: '50px', cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedCarousel(item);
                            setShowDetailModal(true);
                          }}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title || 'Banner'}
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
                          {item.title || <span className="text-muted fst-italic">Untitled Banner</span>}
                        </div>
                        {item.description && (
                          <div
                            className="text-muted small text-truncate"
                            style={{ maxWidth: '280px' }}
                            title={item.description}
                          >
                            {item.description}
                          </div>
                        )}
                        <div className="text-muted small" style={{ fontSize: '11px' }}>
                          Created: {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Associated Merchant */}
                      <td className="align-middle text-center">
                        {item.is_admin ? (
                          <Badge bg="info" className="text-uppercase fw-semibold px-2 py-1">
                            Admin / Global
                          </Badge>
                        ) : item.merchantId ? (
                          <div className="d-flex flex-column align-items-center">
                            <span className="fw-semibold text-primary">
                              {item.merchantId.business_name || item.merchantId.name || 'Merchant'}
                            </span>
                          </div>
                        ) : (
                          <Badge bg="secondary" className="text-uppercase fw-semibold px-2 py-1">
                            System
                          </Badge>
                        )}
                      </td>

                      {/* Target Link */}
                      <td>
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-none text-primary small d-inline-flex align-items-center gap-1 text-truncate"
                            style={{ maxWidth: '160px' }}
                            title={item.url}
                          >
                            <span>🔗</span>
                            <span>{item.url}</span>
                          </a>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>

                      {/* Order */}
                      <td className="text-center">
                        <Badge bg="light" text="dark" className="border px-2 py-1 fw-bold">
                          #{item.order ?? 0}
                        </Badge>
                      </td>

                      {/* Status & Quick Toggle */}
                      <td className="text-center">
                        <div className="d-flex flex-column align-items-center gap-1">
                          <Badge bg={item.isActive ? 'success' : 'secondary'}>
                            {item.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Form.Check
                            type="switch"
                            id={`switch-${item._id}`}
                            checked={item.isActive}
                            onChange={() => handleToggleStatus(item)}
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
                            title="View Details"
                            onClick={() => {
                              setSelectedCarousel(item);
                              setShowDetailModal(true);
                            }}
                          >
                            👁️
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            title="Edit Banner"
                            onClick={() => handleOpenEditModal(item)}
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            title="Delete Banner"
                            onClick={() => {
                              setSelectedCarousel(item);
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

          {/* Pagination Controls */}
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
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <Pagination.Ellipsis disabled />}
                      <Pagination.Item
                        active={p === currentPage}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </Pagination.Item>
                    </React.Fragment>
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
      {/* 1. Create Carousel Modal                                                 */}
      {/* ========================================================================= */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Add New Carousel Banner</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateSubmit}>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}

            {/* Banner Ownership Toggle */}
            <div className="mb-4 p-3 bg-light rounded border border-primary-subtle">
              <Form.Label className="fw-bold d-block text-primary mb-3">Banner Ownership</Form.Label>
              <div className="d-flex w-100 gap-2">
                <Button
                  variant={formData.is_admin ? 'primary' : 'outline-secondary'}
                  className="w-50 fw-semibold shadow-sm"
                  onClick={() => setFormData(prev => ({ ...prev, is_admin: true, merchantId: '' }))}
                >
                  🌐 Platform-wide (Admin)
                </Button>
                <Button
                  variant={!formData.is_admin ? 'primary' : 'outline-secondary'}
                  className="w-50 fw-semibold shadow-sm"
                  onClick={() => setFormData(prev => ({ ...prev, is_admin: false }))}
                >
                  🏪 Merchant Specific
                </Button>
              </div>
              <Form.Text className="text-muted mt-2 d-block">
                {formData.is_admin
                  ? "This carousel banner will be globally managed by the Admin. No merchant is required."
                  : "This carousel banner will belong exclusively to the selected merchant."}
              </Form.Text>
            </div>

            {/* Merchant Account Selector */}
            {!formData.is_admin && (
              <div className="mb-4">
                <SearchableSelect
                  label="Select Target Merchant Account"
                  placeholder="Search and select a merchant..."
                  options={merchants}
                  loading={loadingMerchants}
                  value={formData.merchantId}
                  onChange={(id) => setFormData({ ...formData, merchantId: id })}
                />
              </div>
            )}

            <Row className="g-3">
              <Col xs={12} md={8}>
                {/* Banner Image File */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Upload Banner Image (File)
                  </Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedImageFile(e.target.files[0]);
                      }
                    }}
                  />
                  <Form.Text className="text-muted">
                    Recommended resolution: 1920x600 or 1200x500 for optimal high-definition hero display.
                  </Form.Text>
                </Form.Group>

                {/* Banner Image URL */}

                {/* Banner Title */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Banner Heading / Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Summer Mega Sale - Up to 50% Off"
                    className="placeholder-gray"
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
                    placeholder="e.g. Discover exclusive deals and discounts available this week only."
                    className="placeholder-gray"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Form.Group>

                {/* Destination Link */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Click Target URL / Redirect Link</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. /shop or https://external-link.com"
                    className="placeholder-gray"
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
                        id="create-active-switch"
                        label="Set as Active Banner"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="fw-semibold mt-3"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>

              {/* Real-time Image Preview Panel */}
              <Col xs={12} md={4}>
                <Form.Label className="fw-semibold">Image Preview</Form.Label>
                <div
                  className="border rounded p-2 bg-light d-flex flex-column align-items-center justify-content-center text-center"
                  style={{ minHeight: '180px' }}
                >
                  {(selectedImageFile || formData.image.trim()) ? (
                    <img
                      src={selectedImageFile ? URL.createObjectURL(selectedImageFile) : formData.image.trim()}
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
                      <small className="text-muted">Upload a file or enter a valid image URL to view preview</small>
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
                'Create Carousel Banner'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. Edit Carousel Modal                                                   */}
      {/* ========================================================================= */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Edit Carousel Banner</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateSubmit}>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}

            {/* Banner Ownership Toggle */}
            <div className="mb-4 p-3 bg-light rounded border border-primary-subtle">
              <Form.Label className="fw-bold d-block text-primary mb-3">Banner Ownership</Form.Label>
              <div className="d-flex w-100 gap-2">
                <Button
                  variant={formData.is_admin ? 'primary' : 'outline-secondary'}
                  className="w-50 fw-semibold shadow-sm"
                  onClick={() => setFormData(prev => ({ ...prev, is_admin: true, merchantId: '' }))}
                >
                  🌐 Platform-wide (Admin)
                </Button>
                <Button
                  variant={!formData.is_admin ? 'primary' : 'outline-secondary'}
                  className="w-50 fw-semibold shadow-sm"
                  onClick={() => setFormData(prev => ({ ...prev, is_admin: false }))}
                >
                  🏪 Merchant Specific
                </Button>
              </div>
              <Form.Text className="text-muted mt-2 d-block">
                {formData.is_admin
                  ? "This carousel banner will be globally managed by the Admin. No merchant is required."
                  : "This carousel banner will belong exclusively to the selected merchant."}
              </Form.Text>
            </div>

            {/* Merchant Account Selector */}
            {!formData.is_admin && (
              <div className="mb-4">
                <SearchableSelect
                  label="Assigned Merchant Account"
                  placeholder="Search and select a merchant..."
                  options={merchants}
                  loading={loadingMerchants}
                  value={formData.merchantId}
                  onChange={(id) => setFormData({ ...formData, merchantId: id })}
                />
              </div>
            )}

            <Row className="g-3">
              <Col xs={12} md={8}>
                {/* Banner Image File */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Upload Banner Image (File)
                  </Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedImageFile(e.target.files[0]);
                      }
                    }}
                  />
                </Form.Group>

                {/* Banner Image URL */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Or Banner Image URL
                  </Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="https://example.com/images/banner.jpg"
                    className="placeholder-gray"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </Form.Group>

                {/* Banner Title */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Banner Heading / Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Summer Mega Sale"
                    className="placeholder-gray"
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
                    placeholder="e.g. Special promotional discount"
                    className="placeholder-gray"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Form.Group>

                {/* Destination Link */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Click Target URL</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. /shop or https://example.com"
                    className="placeholder-gray"
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
                        id="edit-active-switch"
                        label="Set as Active Banner"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="fw-semibold mt-3"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>

              {/* Image Preview Panel */}
              <Col xs={12} md={4}>
                <Form.Label className="fw-semibold">Image Preview</Form.Label>
                <div
                  className="border rounded p-2 bg-light d-flex flex-column align-items-center justify-content-center text-center"
                  style={{ minHeight: '180px' }}
                >
                  {(selectedImageFile || formData.image.trim()) ? (
                    <img
                      src={selectedImageFile ? URL.createObjectURL(selectedImageFile) : formData.image.trim()}
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
                      <small className="text-muted">Upload a file or enter a URL to view preview</small>
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
              {/* Full Image Banner */}
              <div className="rounded overflow-hidden shadow-sm border mb-4 bg-dark">
                <img
                  src={selectedCarousel.image}
                  alt={selectedCarousel.title || 'Banner'}
                  style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                />
              </div>

              <Row className="g-3">
                <Col md={6}>
                  <div className="p-3 bg-light rounded border">
                    <h6 className="fw-bold text-dark mb-3">Banner Information</h6>
                    <div className="mb-2">
                      <span className="text-muted small d-block">Title</span>
                      <strong>{selectedCarousel.title || '—'}</strong>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted small d-block">Description</span>
                      <span>{selectedCarousel.description || '—'}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted small d-block">Target Link</span>
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
                        <span className="text-muted small d-block">Display Order</span>
                        <Badge bg="light" text="dark" className="border">
                          #{selectedCarousel.order}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted small d-block">Status</span>
                        <Badge bg={selectedCarousel.isActive ? 'success' : 'secondary'}>
                          {selectedCarousel.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="p-3 bg-light rounded border">
                    <h6 className="fw-bold text-dark mb-3">Target Merchant Details</h6>
                    {selectedCarousel.merchantId ? (
                      <div>
                        <div className="mb-2">
                          <span className="text-muted small d-block">Business Name</span>
                          <strong>{selectedCarousel.merchantId.business_name || '—'}</strong>
                        </div>
                        <div className="mb-2">
                          <span className="text-muted small d-block">Owner Name</span>
                          <span>{selectedCarousel.merchantId.name || '—'}</span>
                        </div>
                        <div className="mb-2">
                          <span className="text-muted small d-block">Email</span>
                          <span>{selectedCarousel.merchantId.email || '—'}</span>
                        </div>
                        {selectedCarousel.merchantId.subdomain && (
                          <div className="mb-2">
                            <span className="text-muted small d-block">Store Subdomain</span>
                            <Badge bg="primary">{selectedCarousel.merchantId.subdomain}</Badge>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-muted">
                        <em>Platform Wide Banner (Applied to all default stores)</em>
                      </div>
                    )}

                    <div className="border-top pt-2 mt-3 text-muted small">
                      <div>Created: {new Date(selectedCarousel.createdAt).toLocaleString()}</div>
                      <div>Updated: {new Date(selectedCarousel.updatedAt).toLocaleString()}</div>
                    </div>
                  </div>
                </Col>
              </Row>
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
      {/* 4. Delete Confirmation Modal                                             */}
      {/* ========================================================================= */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-danger">Delete Carousel Banner</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete this carousel banner{' '}
            {selectedCarousel?.title ? <strong>"{selectedCarousel.title}"</strong> : ''}?
          </p>
          {selectedCarousel?.merchantId && (
            <Alert variant="warning" className="small mb-0">
              This banner belongs to merchant{' '}
              <strong>
                {selectedCarousel.merchantId.business_name || selectedCarousel.merchantId.name}
              </strong>
              . Deleting it will remove it from their storefront.
            </Alert>
          )}
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
