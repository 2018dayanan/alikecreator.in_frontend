'use client';
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Spinner, Alert, Modal, Form, Pagination, Badge } from 'react-bootstrap';
import { merchantService } from '@/services/merchantService';
import { toast } from 'react-toastify';

export default function MerchantProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [error, setError] = useState('');

  // Filtering & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);

  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discount: '',
    quantity: '',
    categoryId: '',
    images: '',
    video: '',
    purchaseType: 'internal',
    externalLink: ''
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const fetchAvailableCategories = async () => {
    try {
      setCategoriesLoading(true);
      const data = await merchantService.getAvailableCategories();
      if (data.status) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchProducts = async (page = 1, catId = selectedCategory, search = searchQuery) => {
    try {
      setLoading(true);
      const data = await merchantService.getProducts(page, 10, catId, search);
      if (data.status) {
        setProducts(data.products || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setCurrentPage(data.pagination.currentPage || 1);
        }
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching your products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableCategories();
  }, []);

  useEffect(() => {
    fetchProducts(currentPage, selectedCategory, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1, selectedCategory, searchQuery);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setCurrentPage(1);
    fetchProducts(1, '', '');
  };

  const handleOpenAddModal = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      discount: '',
      quantity: '10',
      categoryId: categories[0]?._id || '',
      images: '',
      video: '',
      purchaseType: 'internal',
      externalLink: ''
    });
    setIsEditing(false);
    setCurrentProductId(null);
    setSelectedFiles([]);
    setShowModal(true);
  };

  const handleOpenEditModal = (product: any) => {
    setFormData({
      title: product.title || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      discount: product.discount?.toString() || '',
      quantity: product.quantity?.toString() || '0',
      categoryId: product.categoryId?._id || product.categoryId || '',
      images: Array.isArray(product.images) && product.images.length > 0
        ? product.images.join(', ')
        : (product.image || (typeof product.images === 'string' ? product.images : '')),
      video: product.video || '',
      purchaseType: product.purchaseType || 'internal',
      externalLink: product.externalLink || ''
    });
    setIsEditing(true);
    setCurrentProductId(product._id);
    setSelectedFiles([]);
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.categoryId) {
      toast.warning('Title, Price, and Category are required');
      return;
    }

    if (formData.purchaseType === 'external' && !formData.externalLink) {
      toast.warning('External link is required for external purchase products');
      return;
    }

    try {
      setSaving(true);
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('price', formData.price);
      if (formData.discount) uploadData.append('discount', formData.discount);
      uploadData.append('quantity', formData.quantity);
      uploadData.append('categoryId', formData.categoryId);
      uploadData.append('purchaseType', formData.purchaseType);
      if (formData.externalLink) uploadData.append('externalLink', formData.externalLink);
      if (formData.video) uploadData.append('video', formData.video.trim());

      if (formData.images) {
        const imageList = formData.images.split(',').map(s => s.trim()).filter(Boolean);
        imageList.forEach(url => uploadData.append('images', url));
      }

      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          uploadData.append('images', file);
        });
      }

      let res;
      if (isEditing && currentProductId) {
        res = await merchantService.updateProduct(currentProductId, uploadData as any);
      } else {
        res = await merchantService.createProduct(uploadData as any);
      }

      if (res.status) {
        toast.success(isEditing ? 'Product updated successfully!' : 'Product added successfully!');
        setShowModal(false);
        fetchProducts(currentPage);
      } else {
        toast.error(res.message || 'Failed to save product');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while saving product');
    } finally {
      setSaving(false);
    }
  };

  const handlePromptDelete = (product: any) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      const res = await merchantService.deleteProduct(productToDelete._id);
      if (res.status) {
        toast.success('Product deleted successfully');
        setShowDeleteModal(false);
        setProductToDelete(null);
        fetchProducts(currentPage);
      } else {
        toast.error(res.message || 'Failed to delete product');
      }
    } catch (err) {
      toast.error('Error deleting product');
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      setDetailLoading(true);
      setShowDetailModal(true);
      setSelectedProductDetail(null);
      const data = await merchantService.getProductById(id);
      if (data.status) {
        setSelectedProductDetail(data.product);
      } else {
        toast.error(data.message || 'Failed to fetch details');
      }
    } catch (err) {
      toast.error('Error loading product details');
    } finally {
      setDetailLoading(false);
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

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="text-dark fw-bold mb-1">My Products</h3>
          <p className="text-muted mb-0 small">Create, edit and manage products listed under your merchant store</p>
        </div>
        <Button variant="primary" onClick={handleOpenAddModal} className="fw-semibold shadow-sm">
          + Add New Product
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm border-0 rounded-3">
        <Card.Header className="bg-white py-3 border-bottom d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <h5 className="mb-0 fw-bold text-dark">Product Catalog</h5>

          {/* Filters */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            <Form onSubmit={handleSearchSubmit} className="d-flex gap-2">
              <Form.Control
                type="search"
                size="sm"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '180px' }}
              />
              <Button size="sm" variant="outline-primary" type="submit">
                Search
              </Button>
            </Form>

            <Form.Select
              size="sm"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              style={{ minWidth: '160px' }}
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>

            {(searchQuery || selectedCategory) && (
              <Button variant="outline-secondary" size="sm" onClick={handleResetFilters}>
                ✕ Reset
              </Button>
            )}
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted small">Loading your products...</p>
            </div>
          ) : (
            <>
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-5 text-muted">
                        No products found. Click <strong>+ Add New Product</strong> to list your first item!
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
                                style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  backgroundColor: '#e9ecef',
                                  borderRadius: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '18px'
                                }}
                              >
                                📦
                              </div>
                            )}
                          </td>
                          <td className="fw-semibold text-dark">{product.title}</td>
                          <td className="fw-bold text-success">₹{product.price}</td>
                          <td>
                            {product.quantity <= 5 ? (
                              <Badge bg="danger">{product.quantity} in stock</Badge>
                            ) : (
                              <span className="text-muted">{product.quantity} units</span>
                            )}
                          </td>
                          <td>
                            <Badge bg="light" text="dark" className="border">
                              {product.categoryId?.name || 'General'}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={product.purchaseType === 'external' ? 'warning' : 'primary'} text={product.purchaseType === 'external' ? 'dark' : 'white'}>
                              {product.purchaseType || 'internal'}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button variant="outline-info" size="sm" onClick={() => handleViewDetails(product._id)}>
                                View
                              </Button>
                              <Button variant="outline-primary" size="sm" onClick={() => handleOpenEditModal(product)}>
                                Edit
                              </Button>
                              <Button variant="outline-danger" size="sm" onClick={() => handlePromptDelete(product)}>
                                Delete
                              </Button>
                            </div>
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
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">{isEditing ? 'Edit Product' : 'Add New Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Form.Group controlId="prodTitle">
                  <Form.Label className="small fw-semibold">Product Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="e.g. Wireless Bluetooth Headphones"
                    required
                  />
                </Form.Group>
              </div>

              <div className="col-md-3">
                <Form.Group controlId="prodPrice">
                  <Form.Label className="small fw-semibold">Price (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    placeholder="999"
                    required
                  />
                </Form.Group>
              </div>

              <div className="col-md-3">
                <Form.Group controlId="prodDiscount">
                  <Form.Label className="small fw-semibold">Discount %</Form.Label>
                  <Form.Control
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleFormChange}
                    placeholder="10"
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Form.Group controlId="prodCategory">
                  <Form.Label className="small fw-semibold">Category *</Form.Label>
                  <Form.Select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group controlId="prodQuantity">
                  <Form.Label className="small fw-semibold">Stock Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleFormChange}
                    placeholder="50"
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3" controlId="prodDescription">
              <Form.Label className="small fw-semibold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Detailed features, specifications, etc."
              />
            </Form.Group>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Form.Group controlId="prodPurchaseType">
                  <Form.Label className="small fw-semibold">Purchase Type</Form.Label>
                  <Form.Select
                    name="purchaseType"
                    value={formData.purchaseType}
                    onChange={handleFormChange}
                  >
                    <option value="internal">Internal (Add to Cart / Direct Checkout)</option>
                    <option value="external">External Link (Redirect to Partner / External URL)</option>
                  </Form.Select>
                </Form.Group>
              </div>

              {formData.purchaseType === 'external' && (
                <div className="col-md-6">
                  <Form.Group controlId="prodExternalLink">
                    <Form.Label className="small fw-semibold">External URL *</Form.Label>
                    <Form.Control
                      type="url"
                      name="externalLink"
                      value={formData.externalLink}
                      onChange={handleFormChange}
                      placeholder="https://affiliate.example.com/product"
                      required
                    />
                  </Form.Group>
                </div>
              )}
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">Upload Product Images</Form.Label>
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

            <Form.Group className="mb-3" controlId="prodImages">
              <Form.Label className="small fw-semibold">Image URLs (comma separated)</Form.Label>
              <Form.Control
                type="text"
                name="images"
                value={formData.images}
                onChange={handleFormChange}
                placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
              />
              <Form.Text className="text-muted">Enter direct image URLs separated by comma</Form.Text>
            </Form.Group>

            <Form.Group className="mb-4" controlId="prodVideo">
              <Form.Label className="small fw-semibold">Product Video Link (YouTube / Video URL)</Form.Label>
              <Form.Control
                type="url"
                name="video"
                value={formData.video}
                onChange={handleFormChange}
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              />
              <Form.Text className="text-muted">Optional: Paste a YouTube link or direct video URL to showcase this product</Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? <Spinner as="span" animation="border" size="sm" className="me-1" /> : null}
                {isEditing ? 'Save Changes' : 'Create Product'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger fw-bold">Delete Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{productToDelete?.title}</strong>? This cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Product Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : selectedProductDetail ? (
            <div>
              {(() => {
                const detailImages = Array.isArray(selectedProductDetail.images) && selectedProductDetail.images.length > 0
                  ? selectedProductDetail.images
                  : (selectedProductDetail.image ? [selectedProductDetail.image] : (typeof selectedProductDetail.images === 'string' && selectedProductDetail.images ? [selectedProductDetail.images] : []));

                if (detailImages.length === 0) return null;

                return (
                  <div className="mb-3 d-flex flex-wrap gap-2">
                    {detailImages.map((img: string, i: number) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Product ${i}`}
                        style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #dee2e6' }}
                      />
                    ))}
                  </div>
                );
              })()}
              <h4 className="fw-bold text-dark mb-2">{selectedProductDetail.title}</h4>
              <p className="text-muted">{selectedProductDetail.description || 'No description provided.'}</p>
              <div className="row g-2 bg-light p-3 rounded mb-3">
                <div className="col-sm-4">
                  <span className="text-muted small d-block">Price</span>
                  <strong className="text-success fs-5">₹{selectedProductDetail.price}</strong>
                </div>
                <div className="col-sm-4">
                  <span className="text-muted small d-block">Quantity</span>
                  <strong>{selectedProductDetail.quantity ?? 0} units</strong>
                </div>
                <div className="col-sm-4">
                  <span className="text-muted small d-block">Category</span>
                  <strong>{selectedProductDetail.categoryId?.name || 'N/A'}</strong>
                </div>
              </div>

              {selectedProductDetail.video && (
                <div className="border rounded p-3 bg-white">
                  <h6 className="fw-bold text-secondary text-uppercase mb-2" style={{ fontSize: '12px' }}>Product Video</h6>
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
            </div>
          ) : (
            <p className="text-muted">No details found</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
