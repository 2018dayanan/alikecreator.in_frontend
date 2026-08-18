'use client';
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Spinner, Alert, Modal, Form, Tabs, Tab, Badge, Pagination } from 'react-bootstrap';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminService } from '@/services/adminService';
import { toast } from 'react-toastify';

export default function MerchantDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const merchantId = params?.id as string;

  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'category' | 'product'>('profile');

  // Categories Pagination & State
  const [categories, setCategories] = useState<any[]>([]);
  const [allMerchantCategories, setAllMerchantCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryTotalPages, setCategoryTotalPages] = useState(1);
  const [categoryTotalCount, setCategoryTotalCount] = useState(0);

  // Products Pagination & State
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [productTotalCount, setProductTotalCount] = useState(0);
  const [productCategoryFilter, setProductCategoryFilter] = useState('');

  // Product Details Modal State
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Add Category Modal
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    icon: '',
    image: '',
    status: 'active',
  });

  // Add Product Modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [productFormData, setProductFormData] = useState({
    title: '',
    description: '',
    price: '',
    quantity: '',
    categoryId: '',
    images: '',
    purchaseType: 'internal',
    externalLink: '',
  });

  const fetchMerchantDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const data = await adminService.getAdminMerchantById(merchantId);
      if (data.success || data.status) {
        setMerchant(data.data || data.merchant);
      } else {
        setError(data.message || 'Failed to load merchant');
        toast.error(data.message || 'Failed to load merchant');
      }
    } catch (err) {
      setError('An error occurred while loading merchant details.');
      toast.error('An error occurred while loading merchant details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCategoriesForDropdown = async () => {
    try {
      const data = await adminService.getAdminCategories(1, 100, merchantId);
      if (data.status) {
        setAllMerchantCategories(data.categories || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async (page = 1) => {
    try {
      setCategoriesLoading(true);
      const data = await adminService.getAdminCategories(page, 10, merchantId);
      if (data.status) {
        setCategories(data.categories || []);
        if (data.pagination) {
          setCategoryTotalPages(data.pagination.totalPages || 1);
          setCategoryPage(data.pagination.currentPage || 1);
          setCategoryTotalCount(data.pagination.totalCategories || (data.categories || []).length);
        } else {
          setCategoryTotalCount((data.categories || []).length);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchProducts = async (page = 1, categoryId = productCategoryFilter) => {
    try {
      setProductsLoading(true);
      const data = await adminService.getProducts(page, 10, merchantId, categoryId);
      if (data.status) {
        setProducts(data.products || []);
        if (data.pagination) {
          setProductTotalPages(data.pagination.totalPages || 1);
          setProductPage(data.pagination.currentPage || 1);
          setProductTotalCount(data.pagination.totalProducts || (data.products || []).length);
        } else {
          setProductTotalCount((data.products || []).length);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (merchantId) {
      fetchMerchantDetails();
      fetchAllCategoriesForDropdown();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantId]);

  useEffect(() => {
    if (merchantId) {
      fetchCategories(categoryPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantId, categoryPage]);

  useEffect(() => {
    if (merchantId) {
      fetchProducts(productPage, productCategoryFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantId, productPage, productCategoryFilter]);

  const handleProductCategoryFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProductCategoryFilter(e.target.value);
    setProductPage(1);
  };

  const handleClearProductFilter = () => {
    setProductCategoryFilter('');
    setProductPage(1);
  };

  const handleVerifyMerchant = async () => {
    try {
      const data = await adminService.verifyMerchant(merchantId);
      if (data.success || data.status) {
        toast.success('Merchant approved & verified successfully');
        setMerchant((prev: any) => ({ ...prev, is_verified_by_admin: true, status: 'active' }));
      } else {
        toast.error(data.message || 'Failed to verify merchant');
      }
    } catch (err) {
      toast.error('Error verifying merchant');
    }
  };

  // View Product by ID
  const handleViewProductDetails = async (productId: string) => {
    try {
      setDetailLoading(true);
      setShowProductDetailModal(true);
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

  // Add Category Handler
  const handleOpenAddCategory = () => {
    setCategoryFormData({
      name: '',
      description: '',
      icon: '',
      image: '',
      status: 'active',
    });
    setShowAddCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryFormData.name) {
      toast.warning('Category Name is required.');
      return;
    }

    try {
      const payload = {
        ...categoryFormData,
        merchantId,
      };
      const data = await adminService.createCategory(payload);
      if (data.status) {
        toast.success('Category created successfully');
        setShowAddCategoryModal(false);
        fetchCategories(categoryPage);
        fetchAllCategoriesForDropdown();
      } else {
        toast.error(data.message || 'Failed to create category');
      }
    } catch (err) {
      toast.error('Error creating category');
    }
  };

  // Add Product Handler
  const handleOpenAddProduct = () => {
    setProductFormData({
      title: '',
      description: '',
      price: '',
      quantity: '',
      categoryId: allMerchantCategories.length > 0 ? allMerchantCategories[0]._id : '',
      images: '',
      purchaseType: 'internal',
      externalLink: '',
    });
    setShowAddProductModal(true);
  };

  const handleSaveProduct = async () => {
    if (!productFormData.title || !productFormData.price || !productFormData.categoryId) {
      toast.warning('Title, Price, and Category are required.');
      return;
    }

    if (productFormData.purchaseType === 'external' && !productFormData.externalLink) {
      toast.warning('External Link is required when Purchase Type is External.');
      return;
    }

    try {
      const payload = {
        ...productFormData,
        merchantId,
        price: Number(productFormData.price),
        quantity: Number(productFormData.quantity) || 0,
        images: productFormData.images ? productFormData.images.split(',').map((s) => s.trim()) : [],
      };

      const data = await adminService.createProduct(payload);
      if (data.status) {
        toast.success('Product created successfully');
        setShowAddProductModal(false);
        fetchProducts(productPage, productCategoryFilter);
      } else {
        toast.error(data.message || 'Failed to create product');
      }
    } catch (err) {
      toast.error('Error creating product');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Loading merchant dashboard...</p>
      </div>
    );
  }

  if (error || !merchant) {
    return (
      <div>
        <Link href="/admin/dashboard/merchants" className="btn btn-outline-secondary btn-sm mb-3">
          ← Back to Merchants
        </Link>
        <Alert variant="danger">{error || 'Merchant not found'}</Alert>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <Link href="/admin/dashboard/merchants" className="btn btn-outline-secondary btn-sm">
          ← Back to Merchants
        </Link>
        <span className="text-muted">/</span>
        <span className="text-dark fw-medium">{merchant.business_name || merchant.name}</span>
      </div>

      {/* Main Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          {merchant.profile_picture ? (
            <img
              src={merchant.profile_picture}
              alt={merchant.business_name}
              style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '50%' }}
            />
          ) : (
            <div
              style={{ width: '56px', height: '56px', backgroundColor: '#e9ecef', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}
            >
              🏪
            </div>
          )}
          <div>
            <div className="d-flex align-items-center gap-2">
              <h2 className="text-dark fw-bold mb-0">{merchant.business_name || merchant.name}</h2>
              <Badge bg={merchant.status === 'active' ? 'success' : merchant.status === 'suspended' ? 'danger' : 'secondary'}>
                {merchant.status || 'inactive'}
              </Badge>
              {merchant.is_verified_by_admin && (
                <Badge bg="info" text="dark">
                  Verified
                </Badge>
              )}
            </div>
            <small className="text-muted">
              Owner: {merchant.name} • {merchant.email} {merchant.mobile && `• ${merchant.mobile}`}
            </small>
          </div>
        </div>

        {!merchant.is_verified_by_admin && (
          <Button variant="warning" onClick={handleVerifyMerchant}>
            Approve & Verify Merchant
          </Button>
        )}
      </div>

      {/* Dashboard Tabs */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-4">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab((k as any) || 'profile')}
            className="mb-4 nav-pills"
          >
            {/* ------------------ TAB 1: Profile ------------------ */}
            <Tab eventKey="profile" title="Profile Overview">
              <div className="card bg-primary text-white border-0 p-4 mb-4 rounded-3 shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom border-white border-opacity-25 pb-2">
                  <h5 className="fw-bold text-white mb-0">Merchant Store Information</h5>
                  {merchant.is_verified_by_admin ? (
                    <span className="badge bg-success">Verified Merchant</span>
                  ) : (
                    <span className="badge bg-warning text-dark">Pending Verification</span>
                  )}
                </div>

                <div className="row g-3">
                  <div className="col-md-4">
                    <span className="text-white-50 d-block small">Business Name</span>
                    <strong className="fs-5 text-white">{merchant.business_name || 'N/A'}</strong>
                  </div>
                  <div className="col-md-4">
                    <span className="text-white-50 d-block small">Owner Full Name</span>
                    <strong className="text-white">{merchant.name || 'N/A'}</strong>
                  </div>
                  <div className="col-md-4">
                    <span className="text-white-50 d-block small">Email Address</span>
                    <a href={`mailto:${merchant.email}`} className="text-white text-decoration-underline">
                      {merchant.email || 'N/A'}
                    </a>
                  </div>
                  <div className="col-md-4">
                    <span className="text-white-50 d-block small">Mobile / Phone</span>
                    <span className="text-white">{merchant.mobile || 'N/A'}</span>
                  </div>
                  <div className="col-md-4">
                    <span className="text-white-50 d-block small">Subdomain</span>
                    <code className="bg-white bg-opacity-25 text-white px-2 py-1 rounded small">
                      {merchant.subdomain ? `${merchant.subdomain}.store` : 'Not Set'}
                    </code>
                  </div>
                  <div className="col-md-4">
                    <span className="text-white-50 d-block small">Merchant ID</span>
                    <code className="bg-white bg-opacity-25 text-white px-2 py-1 rounded small">
                      {merchant._id}
                    </code>
                  </div>
                  {merchant.store_description && (
                    <div className="col-12">
                      <span className="text-white-50 d-block small">Store Description</span>
                      <p className="mb-0 text-white" style={{ opacity: 0.9 }}>{merchant.store_description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics Counters */}
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="card p-3 border text-center rounded-3 bg-light">
                    <span className="text-muted small">Total Categories</span>
                    <h3 className="fw-bold text-primary mb-0 mt-1">{categoryTotalCount}</h3>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card p-3 border text-center rounded-3 bg-light">
                    <span className="text-muted small">Total Products</span>
                    <h3 className="fw-bold text-success mb-0 mt-1">{productTotalCount}</h3>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card p-3 border text-center rounded-3 bg-light">
                    <span className="text-muted small">Account Status</span>
                    <h3 className="fw-bold text-dark mb-0 mt-1 text-capitalize">{merchant.status || 'Active'}</h3>
                  </div>
                </div>
              </div>
            </Tab>

            {/* ------------------ TAB 2: Categories ------------------ */}
            <Tab eventKey="category" title={`Categories (${categoryTotalCount})`}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="fw-bold text-dark mb-0">Merchant Categories</h5>
                  <small className="text-muted">Categories assigned to this merchant</small>
                </div>
                <Button variant="primary" size="sm" onClick={handleOpenAddCategory}>
                  + Add Category for this Merchant
                </Button>
              </div>

              {categoriesLoading ? (
                <div className="text-center p-4">
                  <Spinner animation="border" size="sm" variant="primary" />
                  <p className="mt-2 text-muted small">Loading categories...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center p-5 border rounded bg-light">
                  <p className="text-muted mb-3">No categories found for this merchant.</p>
                  <Button variant="outline-primary" size="sm" onClick={handleOpenAddCategory}>
                    + Create First Category
                  </Button>
                </div>
              ) : (
                <>
                  <Table responsive hover className="border mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Icon / Image</th>
                        <th>Category Name</th>
                        <th>Slug</th>
                        <th>Description</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((c) => (
                        <tr key={c._id} className="align-middle">
                          <td>
                            {c.icon || c.image ? (
                              <img
                                src={c.icon || c.image}
                                alt={c.name}
                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                              />
                            ) : (
                              <div style={{ width: '40px', height: '40px', backgroundColor: '#e9ecef', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                📁
                              </div>
                            )}
                          </td>
                          <td className="fw-bold text-dark">{c.name}</td>
                          <td>
                            <code>{c.slug}</code>
                          </td>
                          <td className="text-muted small">{c.description || '—'}</td>
                          <td>
                            <Badge bg={c.status === 'active' ? 'success' : 'secondary'}>
                              {c.status || 'active'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Backend Pagination for Categories */}
                  {categoryTotalPages > 1 && (
                    <div className="d-flex justify-content-center p-3 border-top">
                      <Pagination className="mb-0">
                        <Pagination.Prev
                          onClick={() => setCategoryPage((prev) => Math.max(prev - 1, 1))}
                          disabled={categoryPage === 1}
                        />
                        {[...Array(categoryTotalPages)].map((_, idx) => (
                          <Pagination.Item
                            key={idx + 1}
                            active={idx + 1 === categoryPage}
                            onClick={() => setCategoryPage(idx + 1)}
                          >
                            {idx + 1}
                          </Pagination.Item>
                        ))}
                        <Pagination.Next
                          onClick={() => setCategoryPage((prev) => Math.min(prev + 1, categoryTotalPages))}
                          disabled={categoryPage === categoryTotalPages}
                        />
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </Tab>

            {/* ------------------ TAB 3: Products ------------------ */}
            <Tab eventKey="product" title={`Products (${productTotalCount})`}>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
                <div>
                  <h5 className="fw-bold text-dark mb-0">Merchant Products</h5>
                  <small className="text-muted">Products catalog listed under this merchant</small>
                </div>

                <div className="d-flex flex-wrap align-items-center gap-2">
                  {/* Backend Category Filter */}
                  <div className="d-flex align-items-center gap-1">
                    <span className="text-muted small fw-medium text-nowrap">Category:</span>
                    <Form.Select
                      size="sm"
                      value={productCategoryFilter}
                      onChange={handleProductCategoryFilterChange}
                      style={{ minWidth: '160px' }}
                      className="border-primary-subtle"
                    >
                      <option value="">All Categories ({allMerchantCategories.length})</option>
                      {allMerchantCategories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </Form.Select>
                  </div>

                  {productCategoryFilter && (
                    <Button variant="outline-secondary" size="sm" onClick={handleClearProductFilter}>
                      ✕ Clear
                    </Button>
                  )}

                  <Button variant="success" size="sm" onClick={handleOpenAddProduct}>
                    + Add Product
                  </Button>
                </div>
              </div>

              {productsLoading ? (
                <div className="text-center p-4">
                  <Spinner animation="border" size="sm" variant="primary" />
                  <p className="mt-2 text-muted small">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center p-5 border rounded bg-light">
                  <p className="text-muted mb-3">
                    No products found {productCategoryFilter ? 'matching the selected category filter' : 'for this merchant'}.
                  </p>
                  <Button variant="outline-success" size="sm" onClick={handleOpenAddProduct}>
                    + Create First Product
                  </Button>
                </div>
              ) : (
                <>
                  <Table responsive hover className="border mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Image</th>
                        <th>Product Title</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Purchase Type</th>
                        <th>Stock / Quantity</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => {
                        const img = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : p.images;
                        return (
                          <tr key={p._id} className="align-middle">
                            <td>
                              {img ? (
                                <img
                                  src={img}
                                  alt={p.title}
                                  style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px' }}
                                />
                              ) : (
                                <div style={{ width: '45px', height: '45px', backgroundColor: '#e9ecef', borderRadius: '6px' }} />
                              )}
                            </td>
                            <td className="fw-bold text-dark">{p.title}</td>
                            <td className="text-success fw-bold">₹{p.price}</td>
                            <td>{p.categoryId?.name || 'N/A'}</td>
                            <td>
                              <Badge bg={p.purchaseType === 'external' ? 'warning' : 'primary'} text={p.purchaseType === 'external' ? 'dark' : 'white'}>
                                {p.purchaseType || 'internal'}
                              </Badge>
                            </td>
                            <td>{p.quantity ?? 0} units</td>
                            <td>
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => handleViewProductDetails(p._id)}
                              >
                                View Details
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>

                  {/* Backend Pagination for Products */}
                  {productTotalPages > 1 && (
                    <div className="d-flex justify-content-center p-3 border-top">
                      <Pagination className="mb-0">
                        <Pagination.Prev
                          onClick={() => setProductPage((prev) => Math.max(prev - 1, 1))}
                          disabled={productPage === 1}
                        />
                        {[...Array(productTotalPages)].map((_, idx) => (
                          <Pagination.Item
                            key={idx + 1}
                            active={idx + 1 === productPage}
                            onClick={() => setProductPage(idx + 1)}
                          >
                            {idx + 1}
                          </Pagination.Item>
                        ))}
                        <Pagination.Next
                          onClick={() => setProductPage((prev) => Math.min(prev + 1, productTotalPages))}
                          disabled={productPage === productTotalPages}
                        />
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Product Details Modal (Fetched by ID) */}
      <Modal show={showProductDetailModal} onHide={() => setShowProductDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">Product Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {detailLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading product details...</p>
            </div>
          ) : selectedProductDetail ? (
            <div>
              {/* Image Previews */}
              {selectedProductDetail.images && selectedProductDetail.images.length > 0 && (
                <div className="mb-3 d-flex gap-2 flex-wrap">
                  {(Array.isArray(selectedProductDetail.images) ? selectedProductDetail.images : [selectedProductDetail.images]).map((img: string, i: number) => (
                    <img 
                      key={i} 
                      src={img} 
                      alt={`Product preview ${i + 1}`} 
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #dee2e6' }} 
                    />
                  ))}
                </div>
              )}

              {/* Product Basic Info */}
              <div className="card border-0 bg-light p-3 mb-3 rounded-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h4 className="fw-bold text-dark mb-0">{selectedProductDetail.title}</h4>
                  <span className="badge bg-primary fs-6">₹{selectedProductDetail.price}</span>
                </div>
                
                <div className="row g-2 mt-1">
                  <div className="col-md-4">
                    <span className="text-muted d-block small">Stock Quantity</span>
                    <strong className="text-dark">{selectedProductDetail.quantity ?? 0} units</strong>
                  </div>
                  <div className="col-md-4">
                    <span className="text-muted d-block small">Purchase Type</span>
                    <span className={`badge ${selectedProductDetail.purchaseType === 'external' ? 'bg-warning text-dark' : 'bg-success'}`}>
                      {selectedProductDetail.purchaseType || 'internal'}
                    </span>
                  </div>
                  <div className="col-md-4">
                    <span className="text-muted d-block small">Category</span>
                    <strong className="text-dark">{selectedProductDetail.categoryId?.name || 'Unassigned'}</strong>
                  </div>
                  
                  {selectedProductDetail.purchaseType === 'external' && selectedProductDetail.externalLink && (
                    <div className="col-12 mt-2">
                      <span className="text-muted d-block small">External Purchase Link</span>
                      <a href={selectedProductDetail.externalLink} target="_blank" rel="noreferrer" className="text-primary text-break">
                        {selectedProductDetail.externalLink} ↗
                      </a>
                    </div>
                  )}

                  {selectedProductDetail.description && (
                    <div className="col-12 mt-2">
                      <span className="text-muted d-block small">Description</span>
                      <p className="mb-0 text-secondary" style={{ whiteSpace: 'pre-wrap' }}>{selectedProductDetail.description}</p>
                    </div>
                  )}
                </div>
              </div>

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
          <Button variant="secondary" onClick={() => setShowProductDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Category Modal */}
      <Modal show={showAddCategoryModal} onHide={() => setShowAddCategoryModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Category for {merchant.business_name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Category Name *</Form.Label>
              <Form.Control
                type="text"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                placeholder="e.g. Laptops, Watches"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={categoryFormData.description}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                placeholder="Category summary..."
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Icon URL</Form.Label>
              <Form.Control
                type="url"
                value={categoryFormData.icon}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                placeholder="https://example.com/icon.png"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Banner / Image URL</Form.Label>
              <Form.Control
                type="url"
                value={categoryFormData.image}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, image: e.target.value })}
                placeholder="https://example.com/banner.jpg"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddCategoryModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveCategory}>
            Save Category
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Product Modal */}
      <Modal show={showAddProductModal} onHide={() => setShowAddProductModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Product for {merchant.business_name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Product Title *</Form.Label>
                  <Form.Control
                    type="text"
                    value={productFormData.title}
                    onChange={(e) => setProductFormData({ ...productFormData, title: e.target.value })}
                    placeholder="Enter product title"
                  />
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group className="mb-3">
                  <Form.Label>Price (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    value={productFormData.price}
                    onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                    placeholder="0"
                  />
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group className="mb-3">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    value={productFormData.quantity}
                    onChange={(e) => setProductFormData({ ...productFormData, quantity: e.target.value })}
                    placeholder="0"
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    value={productFormData.categoryId}
                    onChange={(e) => setProductFormData({ ...productFormData, categoryId: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {allMerchantCategories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </Form.Select>
                  {allMerchantCategories.length === 0 && (
                    <Form.Text className="text-danger">
                      Please create a category under this merchant first!
                    </Form.Text>
                  )}
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Purchase Type *</Form.Label>
                  <Form.Select
                    value={productFormData.purchaseType}
                    onChange={(e) => setProductFormData({ ...productFormData, purchaseType: e.target.value })}
                  >
                    <option value="internal">Internal (Add to Cart)</option>
                    <option value="external">External Link</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            {productFormData.purchaseType === 'external' && (
              <Form.Group className="mb-3">
                <Form.Label>External Purchase Link *</Form.Label>
                <Form.Control
                  type="url"
                  value={productFormData.externalLink}
                  onChange={(e) => setProductFormData({ ...productFormData, externalLink: e.target.value })}
                  placeholder="https://example.com/product"
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={productFormData.description}
                onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                placeholder="Product description..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image URLs</Form.Label>
              <Form.Control
                type="text"
                value={productFormData.images}
                onChange={(e) => setProductFormData({ ...productFormData, images: e.target.value })}
                placeholder="https://image1.jpg, https://image2.jpg"
              />
              <Form.Text className="text-muted">Comma-separated image URLs.</Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddProductModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSaveProduct}>
            Save Product
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
