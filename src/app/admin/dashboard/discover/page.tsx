'use client';
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Spinner, Alert, Modal, Form, Badge, Row, Col, Tabs, Tab, InputGroup } from 'react-bootstrap';
import { adminService } from '@/services/adminService';
import { toast } from 'react-toastify';

interface ProductItem {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  images?: string[];
  price: number;
  discount?: number | null;
  categoryId?: {
    _id: string;
    name: string;
  } | string;
}

interface DiscoverItem {
  _id: string;
  productId: ProductItem;
  isActive: boolean;
  order: number;
  customBadge?: string | null;
  customTitle?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDiscoverPage() {
  // State
  const [discoverItems, setDiscoverItems] = useState<DiscoverItem[]>([]);
  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Search & Filter
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [merchantFilter, setMerchantFilter] = useState('');
  const [discoverMerchantFilter, setDiscoverMerchantFilter] = useState('');

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DiscoverItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    order: 0,
    isActive: true,
    customBadge: '',
    customTitle: '',
  });

  // 1. Fetch Admin Products and Discover Collection
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Parallel fetch: Products, Discover Items, Categories, Merchants
      const [prodRes, discRes, catRes, merchRes] = await Promise.all([
        adminService.getProducts(1, 100, merchantFilter, '', '', merchantFilter ? '' : 'true'),
        adminService.getDiscoverItems(1, 100, discoverMerchantFilter),
        adminService.getAdminCategories(1, 100, merchantFilter, merchantFilter ? '' : 'true'),
        adminService.getMerchants(),
      ]);

      const productsList: ProductItem[] = prodRes.products || prodRes.data || [];
      const discoverList: DiscoverItem[] = discRes.discoverItems || discRes.data || [];
      const categoriesList = catRes.categories || catRes.data || [];
      const merchantsList = merchRes.merchants || merchRes.data || [];

      setAllProducts(productsList);
      setDiscoverItems(discoverList);
      setCategories(categoriesList);
      setMerchants(merchantsList);

      // Initialize selected product IDs from discover items
      const selectedIds = discoverList.map((item) =>
        typeof item.productId === 'object' ? item.productId._id : (item.productId as string)
      );
      setSelectedProductIds(selectedIds);
    } catch (err: any) {
      console.error('Error fetching discover data:', err);
      setError(err.message || 'Error loading products and showcase collection');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchFilteredProductsAndCategories = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          adminService.getProducts(1, 100, merchantFilter, '', '', merchantFilter ? '' : 'true'),
          adminService.getAdminCategories(1, 100, merchantFilter, merchantFilter ? '' : 'true'),
        ]);
        setAllProducts(prodRes.products || prodRes.data || []);
        setCategories(catRes.categories || catRes.data || []);

        setCategoryFilter(''); // reset selected category
        if (merchantFilter) {
          toast.success('Merchant products and categories loaded successfully!');
        }
      } catch (err: any) {
        console.error('Error fetching filtered data:', err);
        toast.error(err.message || 'Error fetching merchant data');
      } finally {
        setLoading(false);
      }
    };
    if (merchants.length > 0) {
      fetchFilteredProductsAndCategories();
    }
  }, [merchantFilter]);

  // Refetch Discover Items when Manage Filter Changes
  useEffect(() => {
    const fetchFilteredDiscover = async () => {
      try {
        const discRes = await adminService.getDiscoverItems(1, 100, discoverMerchantFilter);
        const newDiscoverList = discRes.discoverItems || discRes.data || [];
        setDiscoverItems(newDiscoverList);

        // We only update selectedProductIds if the manage filter matches the product picker filter
        if (merchantFilter === discoverMerchantFilter) {
          const selectedIds = newDiscoverList.map((item: any) =>
            typeof item.productId === 'object' ? item.productId._id : (item.productId as string)
          );
          setSelectedProductIds(selectedIds);
        }
      } catch (err: any) {
        console.error('Error fetching discover data:', err);
      }
    };
    if (merchants.length > 0) {
      fetchFilteredDiscover();
    }
  }, [discoverMerchantFilter]);

  // Toggle single product checkbox selection
  const handleToggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Select All Filtered Products
  const handleSelectAll = () => {
    const visibleIds = filteredProducts.map((p) => p._id);
    setSelectedProductIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
  };

  // Deselect All
  const handleDeselectAll = () => {
    setSelectedProductIds([]);
  };

  // Sync / Save Checked Products to Backend
  const handleSaveSelection = async () => {
    try {
      setSaving(true);
      const res = await adminService.syncDiscoverProducts(selectedProductIds, merchantFilter);

      if (res.status !== false) {
        toast.success(res.message || 'Discover Collection saved successfully!');
        const updatedList: DiscoverItem[] = res.discoverItems || [];
        setDiscoverItems(updatedList);
      } else {
        toast.error(res.message || 'Failed to save collection');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error saving collection');
    } finally {
      setSaving(false);
    }
  };

  // Toggle single item active status
  const handleToggleItemStatus = async (item: DiscoverItem) => {
    try {
      const res = await adminService.toggleDiscoverStatus(item._id);
      if (res.status !== false) {
        toast.success(res.message || 'Status updated');
        setDiscoverItems((prev) =>
          prev.map((d) => (d._id === item._id ? { ...d, isActive: !d.isActive } : d))
        );
      } else {
        toast.error(res.message || 'Failed to toggle status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating status');
    }
  };

  // Delete / Remove single item
  const handleDeleteItem = async (itemId: string, productId: string) => {
    try {
      const res = await adminService.deleteDiscoverItem(itemId);
      if (res.status !== false) {
        toast.success(res.message || 'Removed from Discover Collection');
        setDiscoverItems((prev) => prev.filter((d) => d._id !== itemId));
        setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
      } else {
        toast.error(res.message || 'Failed to remove item');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error removing item');
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: DiscoverItem) => {
    setEditingItem(item);
    setEditFormData({
      order: item.order || 0,
      isActive: item.isActive ?? true,
      customBadge: item.customBadge || '',
      customTitle: item.customTitle || '',
    });
    setShowEditModal(true);
  };

  // Save Edit Item
  const handleSaveEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setSaving(true);
      const payload = {
        order: Number(editFormData.order) || 0,
        isActive: editFormData.isActive,
        customBadge: editFormData.customBadge.trim() || null,
        customTitle: editFormData.customTitle.trim() || null,
      };

      const res = await adminService.updateDiscoverItem(editingItem._id, payload);

      if (res.status !== false) {
        toast.success(res.message || 'Item updated successfully');
        setShowEditModal(false);
        setDiscoverItems((prev) =>
          prev.map((d) => (d._id === editingItem._id ? res.discover || { ...d, ...payload } : d))
        );
      } else {
        toast.error(res.message || 'Failed to update item');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating item');
    } finally {
      setSaving(false);
    }
  };

  // Filtered Products for the Checkbox Picker
  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch =
      !productSearch.trim() ||
      product.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(productSearch.toLowerCase());

    const catId = typeof product.categoryId === 'object' ? product.categoryId?._id : product.categoryId;
    const matchesCat = !categoryFilter || catId === categoryFilter;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="admin-discover-page">
      {/* Global CSS for Clean Gray Placeholders */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .admin-discover-page input::placeholder,
          .admin-discover-page textarea::placeholder,
          .modal input::placeholder {
            color: #8c98a4 !important;
            opacity: 1 !important;
            font-size: 0.95rem;
          }
        `
      }} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Discover / Latest Collection Showcase</h2>
          <p className="text-muted mb-0">
            Select the specific products you want to feature in the "Discover latest collection" slider on the main website homepage.
          </p>
        </div>
        <Button
          variant="success"
          className="d-flex align-items-center gap-2 shadow-sm px-4 py-2 fw-semibold"
          onClick={handleSaveSelection}
          disabled={saving || loading}
        >
          {saving ? (
            <>
              <Spinner animation="border" size="sm" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>💾</span>
              <span>Save Showcase ({selectedProductIds.length} Selected)</span>
            </>
          )}
        </Button>
      </div>

      {/* KPI Stats */}
      <Row className="mb-4 g-3">
        <Col xs={12} sm={4}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary"
                style={{ width: '48px', height: '48px', fontSize: '20px' }}
              >
                ✨
              </div>
              <div>
                <div className="text-muted small">Selected for Slider</div>
                <h4 className="fw-bold mb-0">{selectedProductIds.length} Products</h4>
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
                <div className="text-muted small">Active in Showcase</div>
                <h4 className="fw-bold mb-0">
                  {discoverItems.filter((i) => i.isActive).length} Products
                </h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-info bg-opacity-10 text-info"
                style={{ width: '48px', height: '48px', fontSize: '20px' }}
              >
                📦
              </div>
              <div>
                <div className="text-muted small">Total Platform Products</div>
                <h4 className="fw-bold mb-0">{allProducts.length} Products</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Main Tabs */}
      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-4">
          <Tabs defaultActiveKey="picker" id="discover-tabs" className="mb-4">
            {/* ========================================================================= */}
            {/* TAB 1: Product Checkbox Picker                                           */}
            {/* ========================================================================= */}
            <Tab
              eventKey="picker"
              title={
                <span>
                  ☑️ Choose Products ({selectedProductIds.length})
                </span>
              }
            >
              {/* Search & Category Filter */}
              <Row className="g-3 mb-4 align-items-center mt-2">
                <Col xs={12} md={5}>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">🔍</InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search your products by name..."
                      className="border-start-0 ps-0"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col xs={12} sm={6} md={3}>
                  <Form.Select
                    value={merchantFilter}
                    onChange={(e) => setMerchantFilter(e.target.value)}
                  >
                    <option value="">Admin Products</option>
                    {merchants.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.businessName || m.name || m.email}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xs={12} sm={6} md={2}>
                  <Form.Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xs={12} sm={12} md={4} className="d-flex justify-content-md-end gap-2">
                  <Button variant="outline-primary" size="sm" onClick={handleSelectAll}>
                    Select All Filtered
                  </Button>
                  <Button variant="outline-secondary" size="sm" onClick={handleDeselectAll}>
                    Clear All
                  </Button>
                </Col>
              </Row>

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted">Loading your store products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-5">
                  <div style={{ fontSize: '42px' }}>📦</div>
                  <h6 className="fw-bold mt-2">No Products Found</h6>
                  <p className="text-muted small">
                    {allProducts.length === 0
                      ? 'You have not added any admin products yet.'
                      : 'No products match your search/filter.'}
                  </p>
                </div>
              ) : (
                <Row className="g-3">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedProductIds.includes(product._id);
                    const prodImg =
                      product.image ||
                      (Array.isArray(product.images) && product.images[0]) ||
                      null;

                    return (
                      <Col key={product._id} xs={12} sm={6} md={4} lg={3}>
                        <Card
                          className={`h-100 border transition-all ${isSelected
                            ? 'border-primary shadow-sm bg-primary bg-opacity-10'
                            : 'border-light-subtle hover-shadow'
                            }`}
                          style={{ cursor: 'pointer', borderRadius: '10px' }}
                          onClick={() => handleToggleProductSelection(product._id)}
                        >
                          <Card.Body className="p-3 d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <Form.Check
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => { }} // Handled by Card click
                                style={{ transform: 'scale(1.25)', cursor: 'pointer' }}
                              />
                              {isSelected && (
                                <Badge bg="primary" className="fw-semibold px-2 py-1">
                                  ✓ In Slider
                                </Badge>
                              )}
                            </div>

                            {/* Thumbnail */}
                            <div
                              className="rounded overflow-hidden bg-white border mb-3 d-flex align-items-center justify-content-center"
                              style={{ height: '140px' }}
                            >
                              {prodImg ? (
                                <img
                                  src={prodImg}
                                  alt={product.title}
                                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <span className="text-muted small">No Image</span>
                              )}
                            </div>

                            {/* Product Title & Price */}
                            <h6
                              className="fw-bold text-dark text-truncate mb-1"
                              title={product.title}
                            >
                              {product.title}
                            </h6>
                            <div className="mt-auto pt-2 d-flex justify-content-between align-items-center">
                              <span className="fw-bold text-primary">₹{product.price}</span>
                              {typeof product.categoryId === 'object' && product.categoryId && (
                                <Badge bg="light" text="dark" className="border small">
                                  {product.categoryId.name}
                                </Badge>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}

              {/* Bottom Sticky Save Bar */}
              <div className="border-top pt-4 mt-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div className="text-muted small">
                  <strong>{selectedProductIds.length}</strong> of {allProducts.length} products selected for your homepage collection slider.
                </div>
                <Button
                  variant="success"
                  className="px-4 fw-semibold"
                  onClick={handleSaveSelection}
                  disabled={saving || loading}
                >
                  {saving ? 'Saving Selection...' : 'Save & Publish to Storefront'}
                </Button>
              </div>
            </Tab>

            {/* ========================================================================= */}
            {/* TAB 2: Manage Showcase Order & Badges                                    */}
            {/* ========================================================================= */}
            <Tab
              eventKey="manage"
              title={
                <span>
                  ⚙️ Slider Ordering & Badges ({discoverItems.length})
                </span>
              }
            >
              <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <h6 className="mb-0 fw-bold">Manage Showcase Items</h6>
                  <div style={{ width: '250px' }}>
                    <Form.Select
                      value={discoverMerchantFilter}
                      onChange={(e) => setDiscoverMerchantFilter(e.target.value)}
                      size="sm"
                    >
                      <option value="">Admin Collection</option>
                      <option value="all">View All (Admin + Merchants)</option>
                      {merchants.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.businessName || m.name || m.email} Collection
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                </div>

                {discoverItems.length === 0 ? (
                  <div className="text-center py-5">
                    <div style={{ fontSize: '42px' }}>✨</div>
                    <h6 className="fw-bold mt-2">No Products in Discover Collection</h6>
                    <p className="text-muted small">
                      Go to the <strong>"Choose Products"</strong> tab and tick products to add them to this slider.
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="mb-0 align-middle">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '80px' }} className="ps-4">Product</th>
                          <th>Title & Category</th>
                          <th>Price</th>
                          <th>Custom Badge</th>
                          <th className="text-center">Order</th>
                          <th className="text-center">Status</th>
                          <th className="text-end pe-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {discoverItems.map((item) => {
                          const prod = item.productId || ({} as ProductItem);
                          const prodImg =
                            prod.image ||
                            (Array.isArray(prod.images) && prod.images[0]) ||
                            null;

                          return (
                            <tr key={item._id}>
                              <td className="ps-4">
                                <div
                                  className="rounded overflow-hidden border bg-light d-flex align-items-center justify-content-center"
                                  style={{ width: '60px', height: '60px' }}
                                >
                                  {prodImg ? (
                                    <img
                                      src={prodImg}
                                      alt={prod.title || 'Product'}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  ) : (
                                    <span className="text-muted small">No Img</span>
                                  )}
                                </div>
                              </td>

                              <td>
                                <div className="fw-bold text-dark">
                                  {item.customTitle || prod.title || 'Untitled Product'}
                                </div>
                                {typeof prod.categoryId === 'object' && prod.categoryId && (
                                  <Badge bg="light" text="dark" className="border small mt-1">
                                    {prod.categoryId.name}
                                  </Badge>
                                )}
                              </td>

                              <td>
                                <span className="fw-bold text-primary">₹{prod.price ?? '—'}</span>
                              </td>

                              <td>
                                {item.customBadge ? (
                                  <Badge bg="warning" text="dark" className="px-2 py-1">
                                    {item.customBadge}
                                  </Badge>
                                ) : (
                                  <span className="text-muted small">—</span>
                                )}
                              </td>

                              <td className="text-center">
                                <Badge bg="light" text="dark" className="border px-2 py-1 fw-bold">
                                  #{item.order ?? 0}
                                </Badge>
                              </td>

                              <td className="text-center">
                                <div className="d-flex flex-column align-items-center">
                                  <Badge bg={item.isActive ? 'success' : 'secondary'}>
                                    {item.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                  <Form.Check
                                    type="switch"
                                    id={`discover-switch-${item._id}`}
                                    checked={item.isActive}
                                    onChange={() => handleToggleItemStatus(item)}
                                    className="mt-1"
                                  />
                                </div>
                              </td>

                              <td className="text-end pe-4">
                                <div className="d-flex justify-content-end gap-1">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    title="Edit Order / Badge"
                                    onClick={() => handleOpenEditModal(item)}
                                  >
                                    ✏️ Edit
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    title="Remove from Slider"
                                    onClick={() => handleDeleteItem(item._id, prod._id)}
                                  >
                                    🗑️
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* ========================================================================= */}
      {/* Edit Showcase Item Modal                                                 */}
      {/* ========================================================================= */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Edit Showcase Item</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveEditItem}>
          <Modal.Body>
            <div className="mb-3 p-2 bg-light rounded border">
              <small className="text-muted d-block">Original Product</small>
              <strong>{editingItem?.productId?.title}</strong>
            </div>

            {/* Custom Title Override */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Custom Heading / Title Override</Form.Label>
              <Form.Control
                type="text"
                placeholder="Leave blank to use original product title"
                value={editFormData.customTitle}
                onChange={(e) => setEditFormData({ ...editFormData, customTitle: e.target.value })}
              />
            </Form.Group>

            {/* Custom Badge */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Custom Promotional Badge</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. HOT, NEW, 30% OFF, BESTSELLER"
                value={editFormData.customBadge}
                onChange={(e) => setEditFormData({ ...editFormData, customBadge: e.target.value })}
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
                    value={editFormData.order}
                    onChange={(e) => setEditFormData({ ...editFormData, order: parseInt(e.target.value) || 0 })}
                  />
                  <Form.Text className="text-muted">Lower numbers appear first.</Form.Text>
                </Form.Group>
              </Col>

              {/* Active Switch */}
              <Col xs={6} className="d-flex align-items-center">
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="edit-discover-active"
                    label="Show in Slider"
                    checked={editFormData.isActive}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                    className="fw-semibold mt-3"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
