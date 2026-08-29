'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Table, Button, Spinner, Alert, Modal, Form, Pagination } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/adminService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* -------------------------------------------------------------------------- */
/*  Reusable searchable dropdown (used for both Merchant and Category)        */
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
  value: string; // selected id
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

  // Keep the search box showing the selected label when not actively typing/open
  useEffect(() => {
    if (!open) {
      setSearch(selected ? selected.label : '');
    }
  }, [selected, open]);

  // Close this dropdown on a genuine outside click. Clicks inside the
  // component never reach this listener because the wrapper below
  // stops propagation, so this only fires for real "outside" clicks.
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
    // stopPropagation here prevents the page-level "click outside" listener
    // from immediately closing this dropdown when the user clicks inside it.
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
              if (value) onChange(''); // typing invalidates prior selection
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
/*  Main page                                                                  */
/* -------------------------------------------------------------------------- */

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdminProductForm, setIsAdminProductForm] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; title: string } | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discount: '',
    quantity: '',
    categoryId: '',
    merchantId: '',
    is_admin: false,
    images: '',
    video: '',
    purchaseType: 'internal',
    externalLink: '',
    rewardCoins: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Merchant / Category source data
  const [merchants, setMerchants] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [merchantsLoading, setMerchantsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Filtering & Pagination state
  const [selectedMerchantFilter, setSelectedMerchantFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [selectedAdminFilter, setSelectedAdminFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
    } finally {
      setMerchantsLoading(false);
    }
  };

  const getCategoryMerchantId = (c: any) => {
    if (!c) return null;
    if (typeof c.merchantId === 'object' && c.merchantId !== null) {
      return c.merchantId._id || null;
    }
    return c.merchantId || null;
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const data = await adminService.getAdminCategories(1, 500);
      if (data.status || data.success) {
        setCategories(data.categories || data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchProducts = async (
    page = 1,
    merchantId = selectedMerchantFilter,
    categoryId = selectedCategoryFilter,
    search = searchTerm,
    isAdmin = selectedAdminFilter
  ) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const data = await adminService.getProducts(page, 10, merchantId, categoryId, search, isAdmin);

      if (data.status) {
        setProducts(data.products || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setCurrentPage(data.pagination.currentPage || 1);
        }
      } else {
        setError(data.message || 'Failed to fetch products');
        toast.error(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError('An error occurred while fetching products.');
      toast.error('An error occurred while fetching products.');
    } finally {
      setLoading(false);
    }
  };

  const loadModalDependencies = () => {
    if (merchants.length === 0 && !merchantsLoading) {
      fetchMerchants();
    }
    if (categories.length === 0 && !categoriesLoading) {
      fetchCategories();
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, selectedMerchantFilter, selectedCategoryFilter, searchTerm);
    fetchMerchants();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedMerchantFilter, selectedCategoryFilter, searchTerm]);

  const handleMerchantFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMerchant = e.target.value;
    setSelectedMerchantFilter(newMerchant);
    if (newMerchant) {
      const isCurrentCategoryValid = categories.some((c) => {
        const cMerchantId = getCategoryMerchantId(c);
        return String(cMerchantId) === String(newMerchant) && String(c._id) === String(selectedCategoryFilter);
      });
      if (!isCurrentCategoryValid) {
        setSelectedCategoryFilter('');
      }
    }
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedMerchantFilter('');
    setSelectedCategoryFilter('');
    setCurrentPage(1);
  };

  const handleViewDetails = async (productId: string) => {
    try {
      setDetailLoading(true);
      setShowDetailModal(true);
      setSelectedProductDetail(null);
      const data = await adminService.getProductById(productId);
      if (data.status) {
        setSelectedProductDetail(data.product);
      } else {
        toast.error(data.message || 'Failed to fetch product details');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error loading product details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handlePromptDelete = (product: any) => {
    setProductToDelete({ id: product._id, title: product.title });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const data = await adminService.deleteProduct(productToDelete.id);

      if (data.status) {
        toast.success('Product deleted successfully');
        setShowDeleteModal(false);
        setProductToDelete(null);
        fetchProducts(currentPage);
      } else {
        toast.error(data.message || 'Failed to delete product');
      }
    } catch (err) {
      toast.error('Error deleting product');
    }
  };

  const handleOpenAddModal = (isAdminProduct: boolean = false) => {
    loadModalDependencies();
    setFormData({
      title: '',
      description: '',
      price: '',
      discount: '',
      quantity: '',
      categoryId: '',
      merchantId: isAdminProduct ? '' : (selectedMerchantFilter || ''),
      is_admin: isAdminProduct,
      images: '',
      video: '',
      purchaseType: 'internal',
      externalLink: '',
      rewardCoins: '',
    });
    setIsAdminProductForm(isAdminProduct);
    setIsEditing(false);
    setCurrentProductId(null);
    setSelectedFiles([]);
    setShowModal(true);
  };

  const handleOpenEditModal = (product: any) => {
    loadModalDependencies();
    setFormData({
      title: product.title || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      discount: product.discount?.toString() || '',
      quantity: product.quantity?.toString() || '',
      categoryId: product.categoryId?._id || product.categoryId || '',
      merchantId: product.merchantId?._id || product.merchantId || '',
      is_admin: product.is_admin || false,
      images: Array.isArray(product.images) && product.images.length > 0
        ? product.images.join(', ')
        : (product.image || (typeof product.images === 'string' ? product.images : '')),
      video: product.video || '',
      purchaseType: product.purchaseType || 'internal',
      externalLink: product.externalLink || '',
      rewardCoins: product.rewardCoins?.toString() || '',
    });
    setIsAdminProductForm(product.is_admin || false);
    setIsEditing(true);
    setCurrentProductId(product._id);
    setSelectedFiles([]);
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked, merchantId: checked ? '' : prev.merchantId }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.price || !formData.categoryId) {
        toast.warning('Title, Price, and Category are required.');
        return;
      }
      if (!formData.is_admin && !formData.merchantId) {
        toast.warning('Merchant is required for merchant products.');
        return;
      }

      if (formData.purchaseType === 'external' && !formData.externalLink) {
        toast.warning('External link is required when purchase type is external.');
        return;
      }

      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('price', formData.price);
      if (formData.discount) uploadData.append('discount', formData.discount);
      uploadData.append('quantity', formData.quantity);
      uploadData.append('categoryId', formData.categoryId);
      if (formData.merchantId) uploadData.append('merchantId', formData.merchantId);
      uploadData.append('is_admin', String(formData.is_admin));
      uploadData.append('purchaseType', formData.purchaseType);
      if (formData.externalLink) uploadData.append('externalLink', formData.externalLink);
      if (formData.video) uploadData.append('video', formData.video.trim());
      if (formData.rewardCoins) uploadData.append('rewardCoins', formData.rewardCoins);

      if (formData.images) {
        const imageList = formData.images.split(',').map((s) => s.trim()).filter(Boolean);
        imageList.forEach((url) => uploadData.append('images', url));
      }

      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          uploadData.append('images', file);
        });
      }

      let data;
      if (isEditing && currentProductId) {
        data = await adminService.updateProduct(currentProductId, uploadData as any);
      } else {
        data = await adminService.createProduct(uploadData as any);
      }

      if (data.status) {
        toast.success(isEditing ? 'Product updated successfully' : 'Product created successfully');
        setShowModal(false);
        fetchProducts(currentPage);
      } else {
        toast.error(data.message || 'Failed to save product');
      }
    } catch (err) {
      toast.error('An error occurred while saving.');
    }
  };

  const getImageUrl = (productOrImages: any) => {
    if (!productOrImages) return null;
    if (typeof productOrImages === 'string') return productOrImages;
    if (Array.isArray(productOrImages) && productOrImages.length > 0) return productOrImages[0];
    if (typeof productOrImages === 'object') {
      if (Array.isArray(productOrImages.images) && productOrImages.images.length > 0) return productOrImages.images[0];
      if (typeof productOrImages.images === 'string' && productOrImages.images) return productOrImages.images;
      if (productOrImages.image && typeof productOrImages.image === 'string') return productOrImages.image;
    }
    return null;
  };

  // Map raw merchant records to the shape SearchableSelect expects
  const merchantOptions: SearchableOption[] = merchants.map((m) => ({
    _id: m._id,
    label: m.business_name ? `${m.business_name} (${m.name})` : (m.name || 'Unnamed merchant'),
    sublabel: `${m.email || ''} ${m.subdomain ? `• ${m.subdomain}.store` : ''}`,
  }));

  // Categories belonging exclusively to the merchant selected in the Add/Edit modal, or platform-wide if Admin product
  const modalCategoryOptions: SearchableOption[] = useMemo(() => {
    if (formData.is_admin) {
      return categories
        .filter((c) => c.is_admin)
        .map((c) => ({
          _id: c._id,
          label: c.name || 'Unnamed admin category',
          sublabel: c.slug ? `Slug: ${c.slug}` : undefined,
        }));
    }

    if (!formData.merchantId) {
      return [];
    }
    return categories
      .filter((c) => {
        const cMerchantId = getCategoryMerchantId(c);
        return cMerchantId && String(cMerchantId) === String(formData.merchantId);
      })
      .map((c) => ({
        _id: c._id,
        label: c.name || 'Unnamed category',
        sublabel: c.slug ? `Slug: ${c.slug}` : undefined,
      }));
  }, [categories, formData.merchantId, formData.is_admin]);

  // Categories filtered for the top toolbar dropdown based on selectedMerchantFilter
  const toolbarFilteredCategories = useMemo(() => {
    if (!selectedMerchantFilter) {
      return categories;
    }
    return categories.filter((c) => {
      const cMerchantId = getCategoryMerchantId(c);
      return cMerchantId && String(cMerchantId) === String(selectedMerchantFilter);
    });
  }, [categories, selectedMerchantFilter]);

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark fw-bold mb-0">Products</h2>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={() => handleOpenAddModal(false)} className="fw-semibold shadow-sm">
            + Add New Product
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white py-3 border-bottom d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <h5 className="mb-0 fw-bold text-dark">All Products</h5>

          {/* Top Backend Filters */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            <div className="d-flex align-items-center gap-1 me-2">
              <Form.Control
                type="text"
                size="sm"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchTerm(searchInput);
                    setCurrentPage(1);
                  }
                }}
                style={{ minWidth: '200px' }}
                className="border-primary-subtle"
              />
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => {
                  setSearchTerm(searchInput);
                  setCurrentPage(1);
                }}
              >
                Search
              </Button>
              {searchTerm && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-danger text-decoration-none px-1"
                  onClick={() => {
                    setSearchInput('');
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                >
                  Clear
                </Button>
              )}
            </div>

            <div className="d-flex align-items-center gap-1">
              <span className="text-muted small fw-medium text-nowrap">Ownership:</span>
              <Form.Select
                size="sm"
                value={selectedAdminFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedAdminFilter(val);
                  if (val === 'true') {
                    setSelectedMerchantFilter(''); // Clear merchant if admin
                  }
                  setCurrentPage(1);
                  fetchProducts(1, val === 'true' ? '' : selectedMerchantFilter, selectedCategoryFilter, searchTerm, val);
                }}
                style={{ minWidth: '150px' }}
                className="border-primary-subtle"
              >
                <option value="">All Products</option>
                <option value="true">Admin Products</option>
                <option value="false">Merchant Products</option>
              </Form.Select>
            </div>

            <div className="d-flex align-items-center gap-1">
              <span className="text-muted small fw-medium text-nowrap">Merchant:</span>
              <Form.Select
                size="sm"
                value={selectedMerchantFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedMerchantFilter(val);
                  if (val) setSelectedAdminFilter(''); // Clear admin filter if specific merchant selected
                  setCurrentPage(1);
                  fetchProducts(1, val, selectedCategoryFilter, searchTerm, val ? '' : selectedAdminFilter);
                }}
                style={{ minWidth: '180px' }}
                className="border-primary-subtle"
                disabled={selectedAdminFilter === 'true'}
              >
                <option value="">All Merchants ({merchants.length})</option>
                {merchants.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.business_name || m.name} ({m.email})
                  </option>
                ))}
              </Form.Select>
            </div>

            <div className="d-flex align-items-center gap-1">
              <span className="text-muted small fw-medium text-nowrap">Category:</span>
              <Form.Select
                size="sm"
                value={selectedCategoryFilter}
                onChange={handleCategoryFilterChange}
                style={{ minWidth: '160px' }}
                className="border-primary-subtle"
              >
                <option value="">
                  {selectedMerchantFilter ? `Merchant Categories (${toolbarFilteredCategories.length})` : `All Categories (${categories.length})`}
                </option>
                {toolbarFilteredCategories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>
            </div>

            {(selectedMerchantFilter || selectedCategoryFilter || selectedAdminFilter) && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setSelectedMerchantFilter('');
                  setSelectedCategoryFilter('');
                  setSelectedAdminFilter('');
                  setSearchInput('');
                  setSearchTerm('');
                  setCurrentPage(1);
                  fetchProducts(1, '', '', '', '');
                }}
                className="text-nowrap"
              >
                ✕ Reset
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted small">Loading products...</p>
            </div>
          ) : (
            <>
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Merchant</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-5 text-muted">
                        No products found {selectedMerchantFilter || selectedCategoryFilter ? 'matching the selected filters' : ''}.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const imageSrc = getImageUrl(product);
                      return (
                        <tr key={product._id} className="align-middle">
                          <td>
                            {imageSrc ? (
                              <img
                                src={imageSrc}
                                alt={product.title}
                                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                              />
                            ) : (
                              <div style={{ width: '50px', height: '50px', backgroundColor: '#e9ecef', borderRadius: '4px' }} />
                            )}
                          </td>
                          <td className="fw-medium">{product.title}</td>
                          <td>₹{product.price}</td>
                          <td>{product.categoryId?.name || 'N/A'}</td>
                          <td>{product.merchantId?.name || 'N/A'}</td>
                          <td>
                            <Button variant="outline-info" size="sm" className="me-2" onClick={() => handleViewDetails(product._id)}>
                              View
                            </Button>
                            <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenEditModal(product)}>
                              Edit
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handlePromptDelete(product)}>
                              Delete
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>

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

      {/* Add / Edit Product Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Product' : 'Add New Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Product Ownership Toggle */}
            <div className="mb-4 p-3 bg-light rounded border border-primary-subtle">
              <Form.Label className="fw-bold d-block text-primary mb-3">Product Ownership</Form.Label>
              <div className="d-flex w-100 gap-2">
                <Button
                  variant={!formData.is_admin ? 'primary' : 'outline-secondary'}
                  className="w-50 fw-semibold shadow-sm"
                  onClick={() => setFormData(prev => ({ ...prev, is_admin: false }))}
                >
                  🏪 Merchant Specific
                </Button>
                <Button
                  variant={formData.is_admin ? 'primary' : 'outline-secondary'}
                  className="w-50 fw-semibold shadow-sm"
                  onClick={() => setFormData(prev => ({ ...prev, is_admin: true, merchantId: '' }))}
                >
                  🌐 Platform-wide (Admin)
                </Button>
              </div>
              <Form.Text className="text-muted mt-2 d-block">
                {formData.is_admin
                  ? "This product will be globally managed by the Admin. No merchant is required."
                  : "This product will belong exclusively to the selected merchant."}
              </Form.Text>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Product Title *</Form.Label>
                  <Form.Control type="text" name="title" value={formData.title} onChange={handleFormChange} placeholder="Enter product title" />
                </Form.Group>
              </div>
              <div className="col-md-2">
                <Form.Group className="mb-3">
                  <Form.Label>Price (₹) *</Form.Label>
                  <Form.Control type="number" name="price" value={formData.price} onChange={handleFormChange} placeholder="Price" />
                </Form.Group>
              </div>
              <div className="col-md-2">
                <Form.Group className="mb-3">
                  <Form.Label>Discount (%)</Form.Label>
                  <Form.Control type="number" name="discount" value={formData.discount} onChange={handleFormChange} />
                </Form.Group>
              </div>
              <div className="col-md-2">
                <Form.Group className="mb-3">
                  <Form.Label>Reward Coins</Form.Label>
                  <Form.Control type="number" name="rewardCoins" value={formData.rewardCoins} onChange={handleFormChange} placeholder="Auto calc" />
                </Form.Group>
              </div>
              <div className="col-md-2">
                <Form.Group className="mb-3">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control type="number" name="quantity" value={formData.quantity} onChange={handleFormChange} placeholder="Quantity" />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleFormChange} placeholder="Enter description" />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Purchase Type *</Form.Label>
                  <Form.Select name="purchaseType" value={formData.purchaseType} onChange={handleFormChange}>
                    <option value="internal">Internal (Add to Cart)</option>
                    <option value="external">External Link</option>
                  </Form.Select>
                </Form.Group>
              </div>
              {formData.purchaseType === 'external' && (
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>External Link *</Form.Label>
                    <Form.Control type="url" name="externalLink" value={formData.externalLink} onChange={handleFormChange} placeholder="https://example.com/buy" />
                  </Form.Group>
                </div>
              )}
            </div>

            <div className="row">


              {/* 1. Merchant selection FIRST */}
              {!formData.is_admin && (
                <div className="col-md-6">
                  <SearchableSelect
                    label="Merchant"
                    required
                    placeholder="Select Merchant first"
                    options={merchantOptions}
                    loading={merchantsLoading}
                    value={formData.merchantId}
                    onChange={(id) => {
                      setFormData((prev) => {
                        // Validate if existing category belongs to new merchant
                        const isCatValid = categories.some((c) => {
                          const cMerchantId = getCategoryMerchantId(c);
                          return String(cMerchantId) === String(id) && String(c._id) === String(prev.categoryId);
                        });
                        return {
                          ...prev,
                          merchantId: id,
                          categoryId: isCatValid ? prev.categoryId : '',
                        };
                      });
                    }}
                  />
                </div>
              )}

              {/* 2. Category selection */}
              <div className="col-md-6">
                <SearchableSelect
                  label="Category"
                  required
                  placeholder={
                    formData.is_admin
                      ? (modalCategoryOptions.length > 0 ? "Select an Admin category" : "No Admin categories exist")
                      : (!formData.merchantId
                        ? "⚠️ Please select a Merchant first"
                        : modalCategoryOptions.length > 0
                          ? "Search merchant's categories"
                          : "No categories for this merchant")
                  }
                  options={modalCategoryOptions}
                  loading={categoriesLoading}
                  value={formData.categoryId}
                  onChange={(id) => setFormData((prev) => ({ ...prev, categoryId: id }))}
                />
                {!formData.is_admin && !formData.merchantId ? (
                  <small className="text-warning d-block" style={{ marginTop: '-10px', marginBottom: '10px' }}>
                    💡 Please select a merchant first to see their categories.
                  </small>
                ) : modalCategoryOptions.length === 0 && !categoriesLoading ? (
                  <small className="text-danger d-block" style={{ marginTop: '-10px', marginBottom: '10px' }}>
                    {formData.is_admin
                      ? "⚠️ There are no Admin categories yet. Please create one first."
                      : "⚠️ This merchant has no categories yet. Please add a category for them first."}
                  </small>
                ) : null}
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Upload Product Images</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (e.target.files) {
                    setSelectedFiles(Array.from(e.target.files));
                  }
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Product Video Link (YouTube / Video URL)</Form.Label>
              <Form.Control type="url" name="video" value={formData.video} onChange={handleFormChange} placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..." />
              <Form.Text className="text-muted">Optional: Paste a YouTube video URL or direct video link</Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{productToDelete?.title}</strong>? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete Product
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Product Details Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">Product & Merchant Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {detailLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading product and merchant details...</p>
            </div>
          ) : selectedProductDetail ? (
            <div>
              {/* Images Preview */}
              {(() => {
                const detailImages = Array.isArray(selectedProductDetail.images) && selectedProductDetail.images.length > 0
                  ? selectedProductDetail.images
                  : (selectedProductDetail.image ? [selectedProductDetail.image] : (typeof selectedProductDetail.images === 'string' && selectedProductDetail.images ? [selectedProductDetail.images] : []));

                if (detailImages.length === 0) return null;

                return (
                  <div className="mb-4">
                    <h6 className="fw-bold text-secondary text-uppercase mb-2" style={{ fontSize: '12px' }}>Product Images</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {detailImages.map((img: string, i: number) => (
                        <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                          <img
                            src={img}
                            alt={`Product ${i + 1}`}
                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #dee2e6' }}
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Product Info Section */}
              <div className="card border-0 bg-light p-3 mb-4 rounded-3">
                <h5 className="fw-bold text-dark mb-3">{selectedProductDetail.title}</h5>
                <div className="row g-3">
                  <div className="col-md-4">
                    <span className="text-muted d-block small">Price</span>
                    <strong className="text-success fs-5">₹{selectedProductDetail.price}</strong>
                  </div>
                  <div className="col-md-4">
                    <span className="text-muted d-block small">Quantity / Stock</span>
                    <strong>{selectedProductDetail.quantity ?? 0} units</strong>
                  </div>
                  <div className="col-md-4">
                    <span className="text-muted d-block small">Purchase Type</span>
                    <span className={`badge ${selectedProductDetail.purchaseType === 'external' ? 'bg-warning text-dark' : 'bg-primary'}`}>
                      {selectedProductDetail.purchaseType || 'internal'}
                    </span>
                  </div>
                  <div className="col-md-4">
                    <span className="text-muted d-block small">Reward Coins</span>
                    <strong className="text-warning fs-5">🪙 {selectedProductDetail.rewardCoins ?? 'N/A'}</strong>
                  </div>
                  {selectedProductDetail.externalLink && (
                    <div className="col-12">
                      <span className="text-muted d-block small">External Purchase Link</span>
                      <a href={selectedProductDetail.externalLink} target="_blank" rel="noopener noreferrer" className="text-primary text-break">
                        {selectedProductDetail.externalLink} ↗
                      </a>
                    </div>
                  )}
                  {selectedProductDetail.description && (
                    <div className="col-12">
                      <span className="text-muted d-block small">Description</span>
                      <p className="mb-0 text-dark" style={{ whiteSpace: 'pre-wrap' }}>{selectedProductDetail.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Info */}
              <div className="card border p-3 mb-4 rounded-3">
                <h6 className="fw-bold text-primary mb-3">📁 Category Details</h6>
                {selectedProductDetail.categoryId ? (
                  <div className="row g-2">
                    <div className="col-md-6">
                      <span className="text-muted d-block small">Category Name</span>
                      <strong>{selectedProductDetail.categoryId.name}</strong>
                    </div>
                    <div className="col-md-6">
                      <span className="text-muted d-block small">Slug</span>
                      <code>{selectedProductDetail.categoryId.slug}</code>
                    </div>
                    {selectedProductDetail.categoryId.description && (
                      <div className="col-12 mt-2">
                        <span className="text-muted d-block small">Description</span>
                        <span className="text-secondary small">{selectedProductDetail.categoryId.description}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted mb-0">No category assigned</p>
                )}
              </div>

              {/* Product Video Section */}
              {selectedProductDetail.video && (
                <div className="card border p-3 mb-4 rounded-3">
                  <h6 className="fw-bold text-primary mb-3">🎥 Product Video</h6>
                  {selectedProductDetail.video.includes('youtube.com') || selectedProductDetail.video.includes('youtu.be') ? (
                    <div className="ratio ratio-16x9 rounded overflow-hidden shadow-sm">
                      <iframe
                        src={
                          selectedProductDetail.video.includes('embed')
                            ? selectedProductDetail.video
                            : selectedProductDetail.video.includes('youtu.be')
                              ? `https://www.youtube.com/embed/${selectedProductDetail.video.split('/').pop()?.split('?')[0]}`
                              : `https://www.youtube.com/embed/${new URLSearchParams(selectedProductDetail.video.split('?')[1] || '').get('v') || ''}`
                        }
                        title="Product Video"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div>
                      <a href={selectedProductDetail.video} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                        ▶ Watch Video Link
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Merchant Details Card */}
              <div className="card bg-primary text-white border-0 p-3 mb-3 rounded-3 shadow-sm">
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom border-white border-opacity-25 pb-2">
                  <h6 className="fw-bold text-white mb-0">🏪 Merchant Information</h6>
                  {selectedProductDetail.merchantId?.status && (
                    <span className={`badge ${selectedProductDetail.merchantId.status === 'active' ? 'bg-success' : 'bg-light text-dark'}`}>
                      Status: {selectedProductDetail.merchantId.status}
                    </span>
                  )}
                </div>

                {selectedProductDetail.merchantId ? (
                  <div className="row g-3">
                    <div className="col-md-6">
                      <span className="text-white-50 d-block small">Business Name</span>
                      <strong className="fs-6 text-white">{selectedProductDetail.merchantId.business_name || 'N/A'}</strong>
                    </div>
                    <div className="col-md-6">
                      <span className="text-white-50 d-block small">Merchant Name</span>
                      <strong className="text-white">{selectedProductDetail.merchantId.name || 'N/A'}</strong>
                    </div>
                    <div className="col-md-6">
                      <span className="text-white-50 d-block small">Email Address</span>
                      <a href={`mailto:${selectedProductDetail.merchantId.email}`} className="text-white text-decoration-underline">
                        {selectedProductDetail.merchantId.email || 'N/A'}
                      </a>
                    </div>
                    <div className="col-md-6">
                      <span className="text-white-50 d-block small">Mobile / Phone</span>
                      <span className="text-white">{selectedProductDetail.merchantId.mobile || 'N/A'}</span>
                    </div>
                    {selectedProductDetail.merchantId.subdomain && (
                      <div className="col-md-6">
                        <span className="text-white-50 d-block small">Subdomain</span>
                        <code className="bg-white bg-opacity-25 text-white px-2 py-1 rounded small">{selectedProductDetail.merchantId.subdomain}</code>
                      </div>
                    )}
                    {selectedProductDetail.merchantId.unique_id && (
                      <div className="col-md-6">
                        <span className="text-white-50 d-block small">Merchant ID (UID)</span>
                        <code className="bg-white bg-opacity-25 text-white px-2 py-1 rounded small">{selectedProductDetail.merchantId.unique_id}</code>
                      </div>
                    )}
                    {selectedProductDetail.merchantId.store_description && (
                      <div className="col-12">
                        <span className="text-white-50 d-block small">Store Description</span>
                        <span className="small text-white" style={{ opacity: 0.9 }}>{selectedProductDetail.merchantId.store_description}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-white-50 mb-0">No merchant linked to this product.</p>
                )}
              </div>

              {/* Metadata */}
              <div className="d-flex justify-content-between text-muted small px-1">
                <span>Product ID: <code>{selectedProductDetail._id}</code></span>
                <span>Created: {new Date(selectedProductDetail.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted">No details found.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedProductDetail && (
            <Button
              variant="outline-primary"
              onClick={() => {
                setShowDetailModal(false);
                handleOpenEditModal(selectedProductDetail);
              }}
            >
              Edit This Product
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