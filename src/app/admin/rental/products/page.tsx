'use client';
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Spinner, Row, Col } from 'react-bootstrap';

interface Category {
  _id: string;
  title: string;
}

interface Product {
  _id: string;
  title: string;
  description: string;
  image: string;
  categoryId: Category | string;
  rentalPrice: number;
  rentalDuration: string;
  securityDeposit: number;
  rewardCoins: number;
  sizes: string[];
  isActive: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RentalProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState('');

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    categoryId: '',
    rentalPrice: 0,
    rentalDuration: '3 Days',
    securityDeposit: 0,
    sizes: '',
    isActive: true
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      // Fetch Products with filters and pagination
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        categoryId: filterCategoryId
      });

      const prodRes = await fetch(`${API_URL}/admin/rental/product?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const prodData = await prodRes.json();
      if (prodData.status) {
        setProducts(prodData.data);
        if (prodData.pagination) {
          setTotalPages(prodData.pagination.totalPages);
        }
      }

      // Fetch Categories for the dropdown (only need to do this once, but keeping it simple here)
      const catRes = await fetch(`${API_URL}/admin/rental/category`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const catData = await catRes.json();
      if (catData.status) {
        setCategories(catData.data);
      }

    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, filterCategoryId]); // Re-fetch when these change

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on new search
    fetchData();
  };

  const handleShow = (product?: Product) => {
    if (product) {
      setEditMode(true);
      setCurrentId(product._id);
      setFormData({
        title: product.title,
        description: product.description,
        image: product.image || '',
        categoryId: typeof product.categoryId === 'object' ? product.categoryId._id : product.categoryId,
        rentalPrice: product.rentalPrice,
        rentalDuration: product.rentalDuration,
        securityDeposit: product.securityDeposit,
        sizes: product.sizes.join(', '),
        isActive: product.isActive
      });
    } else {
      setEditMode(false);
      setFormData({
        title: '', description: '', image: '', categoryId: categories.length > 0 ? categories[0]._id : '',
        rentalPrice: 0, rentalDuration: '3 Days', securityDeposit: 0, sizes: '', isActive: true
      });
    }
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const url = editMode ? `${API_URL}/admin/rental/product/${currentId}` : `${API_URL}/admin/rental/product`;
      const method = editMode ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s)
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.status) {
        fetchData();
        handleClose();
      } else {
        alert(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Submit error', error);
      alert('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/admin/rental/product/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status) {
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Delete error', error);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold m-0">Rental Products</h3>
        <Button variant="success" onClick={() => handleShow()}>
          <i className="fa-solid fa-plus me-1"></i> Add Product
        </Button>
      </div>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Form onSubmit={handleSearchSubmit} className="d-flex gap-3">
            <Form.Control
              type="text"
              placeholder="Search products by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <Form.Select
              value={filterCategoryId}
              onChange={(e) => {
                setFilterCategoryId(e.target.value);
                setPage(1);
              }}
              style={{ width: '250px' }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.title}</option>
              ))}
            </Form.Select>
            <Button variant="primary" type="submit">
              Search
            </Button>
            {(search || filterCategoryId) && (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch('');
                  setFilterCategoryId('');
                  setPage(1);
                }}
              >
                Clear
              </Button>
            )}
          </Form>
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0">
        <Card.Body>
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="success" />
            </div>
          ) : (
            <>
              <Table responsive hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Duration</th>
                    <th>Deposit</th>
                    <th>Reward</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4 text-muted">No rental products found.</td>
                    </tr>
                  ) : (
                    products.map(prod => (
                      <tr key={prod._id}>
                        <td className="fw-semibold">{prod.title}</td>
                        <td>{prod.categoryId && typeof prod.categoryId === 'object' ? (prod.categoryId as any).title : prod.categoryId || 'Uncategorized'}</td>
                        <td>₹{prod.rentalPrice}</td>
                        <td>{prod.rentalDuration}</td>
                        <td>₹{prod.securityDeposit}</td>
                        <td><span className="badge bg-warning text-dark"><i className="fa-solid fa-coins me-1"></i> {prod.rewardCoins || 0}</span></td>
                        <td>
                          <span className={`badge bg-${prod.isActive ? 'success' : 'secondary'}`}>
                            {prod.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="text-end">
                          <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShow(prod)}>
                            Edit
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(prod._id)}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
              {totalPages >= 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div className="text-muted small">
                    Showing page {page} of {totalPages}
                  </div>
                  <nav>
                    <ul className="pagination m-0">
                      <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setPage(page - 1)}>Previous</button>
                      </li>
                      {[...Array(totalPages)].map((_, idx) => (
                        <li key={idx} className={`page-item ${page === idx + 1 ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setPage(idx + 1)}>
                            {idx + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setPage(page + 1)}>Next</button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Product' : 'Add New Product'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select required value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}>
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.title}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control as="textarea" rows={3} required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Rental Price (₹) *</Form.Label>
                  <Form.Control type="number" required value={formData.rentalPrice} onChange={(e) => setFormData({ ...formData, rentalPrice: Number(e.target.value) })} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Rental Duration *</Form.Label>
                  <Form.Control type="text" required placeholder="e.g. 3 Days" value={formData.rentalDuration} onChange={(e) => setFormData({ ...formData, rentalDuration: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Security Deposit (₹) *</Form.Label>
                  <Form.Control type="number" required value={formData.securityDeposit} onChange={(e) => setFormData({ ...formData, securityDeposit: Number(e.target.value) })} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Sizes (Comma separated)</Form.Label>
                  <Form.Control type="text" placeholder="S, M, L, XL" value={formData.sizes} onChange={(e) => setFormData({ ...formData, sizes: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Image URL</Form.Label>
                  <Form.Control type="text" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check type="switch" id="productIsActiveSwitch" label="Is Active" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="success" type="submit">Save Product</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
