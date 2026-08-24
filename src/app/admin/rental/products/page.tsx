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

export default function RentalProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState('');
  
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
      
      // Fetch Products
      const prodRes = await fetch('/api/v1/admin/rental/product', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const prodData = await prodRes.json();
      if (prodData.status) {
        setProducts(prodData.data);
      }

      // Fetch Categories for the dropdown
      const catRes = await fetch('/api/v1/admin/rental/category', {
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
  }, []);

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
      const url = editMode ? `/api/v1/admin/rental/product/${currentId}` : '/api/v1/admin/rental/product';
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
      const res = await fetch(`/api/v1/admin/rental/product/${id}`, {
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

      <Card className="shadow-sm border-0">
        <Card.Body>
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="success" />
            </div>
          ) : (
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
                      <td>{typeof prod.categoryId === 'object' ? prod.categoryId.title : prod.categoryId}</td>
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
                  <Form.Control type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select required value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})}>
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
              <Form.Control as="textarea" rows={3} required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Rental Price (₹) *</Form.Label>
                  <Form.Control type="number" required value={formData.rentalPrice} onChange={(e) => setFormData({...formData, rentalPrice: Number(e.target.value)})} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Rental Duration *</Form.Label>
                  <Form.Control type="text" required placeholder="e.g. 3 Days" value={formData.rentalDuration} onChange={(e) => setFormData({...formData, rentalDuration: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Security Deposit (₹) *</Form.Label>
                  <Form.Control type="number" required value={formData.securityDeposit} onChange={(e) => setFormData({...formData, securityDeposit: Number(e.target.value)})} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Sizes (Comma separated)</Form.Label>
                  <Form.Control type="text" placeholder="S, M, L, XL" value={formData.sizes} onChange={(e) => setFormData({...formData, sizes: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Image URL</Form.Label>
                  <Form.Control type="text" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check type="switch" id="productIsActiveSwitch" label="Is Active" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} />
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
