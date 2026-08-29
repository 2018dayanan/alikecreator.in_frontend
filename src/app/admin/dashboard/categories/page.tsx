'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Card, Table, Button, Spinner, Alert, Modal, Form, Pagination } from 'react-bootstrap';
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
}

function SearchableSelect({
  label,
  required,
  placeholder,
  options,
  loading,
  value,
  onChange,
}: SearchableSelectProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o._id === value);

  useEffect(() => {
    if (!open) {
      setSearch(selected ? selected.label : '');
    }
  }, [selected, open]);

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = () => setOpen(false);
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

  const handleSelect = (opt: SearchableOption) => {
    onChange(opt._id);
    setSearch(opt.label);
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
        <Form.Label>
          {label} {required && <span className="text-danger">*</span>}
        </Form.Label>
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
            {loading ? (
              <div className="p-3 text-center text-muted">
                <Spinner animation="border" size="sm" className="me-2" />
                Loading...
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
              <div className="p-2 text-muted">No results found</div>
            )}
          </div>
        )}

        {value && !open && (
          <Form.Text className="text-success">Selected: {selected?.label}</Form.Text>
        )}
      </Form.Group>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Admin Categories Page                                                */
/* -------------------------------------------------------------------------- */

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering & Pagination State
  const [selectedMerchantFilter, setSelectedMerchantFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Merchants Data
  const [merchants, setMerchants] = useState<any[]>([]);
  const [merchantsLoading, setMerchantsLoading] = useState(false);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCategoryDetail, setSelectedCategoryDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    image: '',
    merchantId: '',
    status: 'active',
  });
  const [selectedIconFile, setSelectedIconFile] = useState<File | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const router = useRouter();

  const fetchMerchants = async () => {
    try {
      setMerchantsLoading(true);
      const data = await adminService.getMerchants();
      if (data.success || data.status) {
        setMerchants(data.data || data.merchants || []);
      }
    } catch (err) {
      console.error('Failed to fetch merchants', err);
      toast.error('Failed to load merchants');
    } finally {
      setMerchantsLoading(false);
    }
  };

  const loadModalDependencies = () => {
    if (merchants.length === 0 && !merchantsLoading) {
      fetchMerchants();
    }
  };

  const fetchCategories = async (page = 1, merchantId = selectedMerchantFilter) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const data = await adminService.getAdminCategories(page, 10, merchantId);

      if (data.status) {
        setCategories(data.categories || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setCurrentPage(data.pagination.currentPage || 1);
        }
      } else {
        setError(data.message || 'Failed to fetch categories');
        toast.error(data.message || 'Failed to fetch categories');
      }
    } catch (err) {
      setError('An error occurred while fetching categories.');
      toast.error('An error occurred while fetching categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(currentPage, selectedMerchantFilter);
    fetchMerchants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedMerchantFilter]);

  const handleMerchantFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const merchantId = e.target.value;
    setSelectedMerchantFilter(merchantId);
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const handlePromptDelete = (category: any) => {
    setCategoryToDelete({ id: category._id, name: category.name });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const data = await adminService.deleteCategory(categoryToDelete.id);

      if (data.status) {
        toast.success('Category deleted successfully');
        setShowDeleteModal(false);
        setCategoryToDelete(null);
        fetchCategories(currentPage, selectedMerchantFilter);
      } else {
        toast.error(data.message || 'Failed to delete category');
      }
    } catch (err) {
      toast.error('Error deleting category');
    }
  };

  const handleViewDetails = async (categoryId: string) => {
    try {
      setDetailLoading(true);
      setShowDetailModal(true);
      setSelectedCategoryDetail(null);
      const data = await adminService.getAdminCategoryById(categoryId);
      if (data.status) {
        setSelectedCategoryDetail(data.category);
      } else {
        toast.error(data.message || 'Failed to fetch category details');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error loading category details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    loadModalDependencies();
    setFormData({
      name: '',
      description: '',
      icon: '',
      image: '',
      merchantId: selectedMerchantFilter || '',
      status: 'active',
    });
    setIsEditing(false);
    setCurrentCategoryId(null);
    setSelectedIconFile(null);
    setSelectedImageFile(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (category: any) => {
    loadModalDependencies();
    setFormData({
      name: category.name || '',
      description: category.description || '',
      icon: category.icon || '',
      image: category.image || '',
      merchantId: category.merchantId?._id || category.merchantId || '',
      status: category.status || 'active',
    });
    setIsEditing(true);
    setCurrentCategoryId(category._id);
    setSelectedIconFile(null);
    setSelectedImageFile(null);
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.merchantId) {
        toast.warning('Category Name and Merchant are required.');
        return;
      }

      const uploadData = new FormData();
      uploadData.append('name', formData.name);
      if (formData.description) uploadData.append('description', formData.description);
      uploadData.append('merchantId', formData.merchantId);
      uploadData.append('status', formData.status);
      
      if (formData.icon) uploadData.append('icon', formData.icon);
      if (formData.image) uploadData.append('image', formData.image);

      if (selectedIconFile) uploadData.append('icon', selectedIconFile);
      if (selectedImageFile) uploadData.append('image', selectedImageFile);

      let data;
      if (isEditing && currentCategoryId) {
        data = await adminService.updateCategory(currentCategoryId, uploadData as any);
      } else {
        data = await adminService.createCategory(uploadData as any);
      }

      if (data.status) {
        toast.success(isEditing ? 'Category updated successfully' : 'Category created successfully');
        setShowModal(false);
        fetchCategories(currentPage, selectedMerchantFilter);
      } else {
        toast.error(data.message || 'Failed to save category');
      }
    } catch (err) {
      toast.error('An error occurred while saving.');
    }
  };

  const merchantOptions: SearchableOption[] = merchants.map((m) => ({
    _id: m._id,
    label: m.name || m.business_name || 'Unnamed merchant',
    sublabel: `${m.business_name ? `${m.business_name} • ` : ''}${m.email || ''}`,
  }));

  return (
    <div>
      {/* Header & Actions */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="text-dark fw-bold mb-0">Categories</h2>
          <small className="text-muted">Manage store categories across merchants</small>
        </div>
        <Button variant="primary" onClick={handleOpenAddModal}>
          + Add Category
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Main Content Card with Merchant Filter */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white py-3 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <h5 className="mb-0 fw-bold text-dark">All Categories</h5>

          {/* Top Filter By Merchant */}
          <div className="d-flex align-items-center gap-2" style={{ minWidth: '280px' }}>
            <span className="text-muted small fw-medium text-nowrap">Filter by Merchant:</span>
            <Form.Select 
              size="sm" 
              value={selectedMerchantFilter} 
              onChange={handleMerchantFilterChange}
              className="border-primary-subtle"
            >
              <option value="">All Merchants ({merchants.length})</option>
              {merchants.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.business_name || m.name} ({m.email})
                </option>
              ))}
            </Form.Select>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted small">Loading categories...</p>
            </div>
          ) : (
            <>
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Icon / Image</th>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Merchant</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-5 text-muted">
                        No categories found {selectedMerchantFilter ? 'for this merchant' : ''}.
                      </td>
                    </tr>
                  ) : (
                    categories.map((category) => {
                      const displayImg = category.icon || category.image;
                      return (
                        <tr key={category._id} className="align-middle">
                          <td>
                            {displayImg ? (
                              <img
                                src={displayImg}
                                alt={category.name}
                                style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #dee2e6' }}
                              />
                            ) : (
                              <div 
                                style={{ width: '42px', height: '42px', backgroundColor: '#e9ecef', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                📁
                              </div>
                            )}
                          </td>
                          <td className="fw-bold text-dark">{category.name}</td>
                          <td>
                            <code>{category.slug}</code>
                          </td>
                          <td>
                            {category.merchantId ? (
                              <div>
                                <span className="fw-medium text-dark">{category.merchantId.business_name || category.merchantId.name}</span>
                                <br />
                                <small className="text-muted">{category.merchantId.email}</small>
                              </div>
                            ) : (
                              <span className="text-muted">Global / None</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge rounded-pill px-3 py-1 ${category.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                              {category.status || 'active'}
                            </span>
                          </td>
                          <td>
                            <Button 
                              variant="outline-info" 
                              size="sm" 
                              className="me-2" 
                              onClick={() => handleViewDetails(category._id)}
                            >
                              View
                            </Button>
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="me-2" 
                              onClick={() => handleOpenEditModal(category)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              onClick={() => handlePromptDelete(category)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>

              {/* Pagination UI */}
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

      {/* Add / Edit Category Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Category' : 'Add New Category'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="row">
              <div className="col-md-8">
                <Form.Group className="mb-3">
                  <Form.Label>Category Name *</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleFormChange} 
                    placeholder="e.g. Electronics, Fashion" 
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Status *</Form.Label>
                  <Form.Select name="status" value={formData.status} onChange={handleFormChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                name="description" 
                value={formData.description} 
                onChange={handleFormChange} 
                placeholder="Category summary and description" 
              />
            </Form.Group>

            {/* Searchable Merchant Dropdown */}
            <SearchableSelect
              label="Merchant"
              required
              placeholder="Search by merchant name or email"
              options={merchantOptions}
              loading={merchantsLoading}
              value={formData.merchantId}
              onChange={(id) => setFormData((prev) => ({ ...prev, merchantId: id }))}
            />

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Upload Icon (File)</Form.Label>
                  <Form.Control 
                    type="file" 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedIconFile(e.target.files[0]);
                      }
                    }} 
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Or Icon URL</Form.Label>
                  <Form.Control 
                    type="url" 
                    name="icon" 
                    value={formData.icon} 
                    onChange={handleFormChange} 
                    placeholder="https://example.com/icon.png" 
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Upload Banner Image (File)</Form.Label>
                  <Form.Control 
                    type="file" 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedImageFile(e.target.files[0]);
                      }
                    }} 
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Or Banner URL</Form.Label>
                  <Form.Control 
                    type="url" 
                    name="image" 
                    value={formData.image} 
                    onChange={handleFormChange} 
                    placeholder="https://example.com/category-banner.jpg" 
                  />
                </Form.Group>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {isEditing ? 'Save Changes' : 'Create Category'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the category <strong>{categoryToDelete?.name}</strong>? This will remove the category from the store.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete Category
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Category Details Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">Category & Merchant Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {detailLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading details...</p>
            </div>
          ) : selectedCategoryDetail ? (
            <div>
              {/* Images Preview */}
              {(selectedCategoryDetail.image || selectedCategoryDetail.icon) && (
                <div className="mb-4 d-flex gap-3 align-items-center">
                  {selectedCategoryDetail.icon && (
                    <div>
                      <span className="text-muted d-block small mb-1">Icon</span>
                      <img 
                        src={selectedCategoryDetail.icon} 
                        alt="Icon" 
                        style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #dee2e6', padding: '4px' }} 
                      />
                    </div>
                  )}
                  {selectedCategoryDetail.image && (
                    <div>
                      <span className="text-muted d-block small mb-1">Banner Image</span>
                      <img 
                        src={selectedCategoryDetail.image} 
                        alt="Banner" 
                        style={{ width: '140px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #dee2e6' }} 
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Category Info */}
              <div className="card border-0 bg-light p-3 mb-4 rounded-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="fw-bold text-dark mb-0">{selectedCategoryDetail.name}</h5>
                  <span className={`badge ${selectedCategoryDetail.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                    Status: {selectedCategoryDetail.status || 'active'}
                  </span>
                </div>
                <div className="row g-3 mt-1">
                  <div className="col-md-6">
                    <span className="text-muted d-block small">Slug</span>
                    <code>{selectedCategoryDetail.slug}</code>
                  </div>
                  {selectedCategoryDetail.description && (
                    <div className="col-12">
                      <span className="text-muted d-block small">Description</span>
                      <p className="mb-0 text-dark" style={{ whiteSpace: 'pre-wrap' }}>{selectedCategoryDetail.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Merchant Details Card (Styled with White text on primary background) */}
              <div className="card bg-primary text-white border-0 p-3 mb-3 rounded-3 shadow-sm">
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom border-white border-opacity-25 pb-2">
                  <h6 className="fw-bold text-white mb-0">🏪 Assigned Merchant</h6>
                  {selectedCategoryDetail.merchantId?.status && (
                    <span className={`badge ${selectedCategoryDetail.merchantId.status === 'active' ? 'bg-success' : 'bg-light text-dark'}`}>
                      Status: {selectedCategoryDetail.merchantId.status}
                    </span>
                  )}
                </div>

                {selectedCategoryDetail.merchantId ? (
                  <div className="row g-3">
                    <div className="col-md-6">
                      <span className="text-white-50 d-block small">Business Name</span>
                      <strong className="fs-6 text-white">{selectedCategoryDetail.merchantId.business_name || 'N/A'}</strong>
                    </div>
                    <div className="col-md-6">
                      <span className="text-white-50 d-block small">Merchant Name</span>
                      <strong className="text-white">{selectedCategoryDetail.merchantId.name || 'N/A'}</strong>
                    </div>
                    <div className="col-md-6">
                      <span className="text-white-50 d-block small">Email Address</span>
                      <a href={`mailto:${selectedCategoryDetail.merchantId.email}`} className="text-white text-decoration-underline">
                        {selectedCategoryDetail.merchantId.email || 'N/A'}
                      </a>
                    </div>
                    <div className="col-md-6">
                      <span className="text-white-50 d-block small">Mobile / Phone</span>
                      <span className="text-white">{selectedCategoryDetail.merchantId.mobile || 'N/A'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-white-50 mb-0">No specific merchant assigned (Global Category).</p>
                )}
              </div>

              {/* Metadata */}
              <div className="d-flex justify-content-between text-muted small px-1">
                <span>Category ID: <code>{selectedCategoryDetail._id}</code></span>
                <span>Created: {new Date(selectedCategoryDetail.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted">No details found.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedCategoryDetail && (
            <Button 
              variant="outline-primary" 
              onClick={() => {
                setShowDetailModal(false);
                handleOpenEditModal(selectedCategoryDetail);
              }}
            >
              Edit This Category
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
