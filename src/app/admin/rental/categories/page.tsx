'use client';
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Spinner } from 'react-bootstrap';

interface Category {
  _id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  isActive: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RentalCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '',
    image: '',
    isActive: true
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/admin/rental/category`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleShow = (category?: Category) => {
    if (category) {
      setEditMode(true);
      setCurrentId(category._id);
      setFormData({
        title: category.title,
        description: category.description || '',
        icon: category.icon || '',
        image: category.image || '',
        isActive: category.isActive
      });
    } else {
      setEditMode(false);
      setFormData({ title: '', description: '', icon: '', image: '', isActive: true });
    }
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const url = editMode ? `${API_URL}/admin/rental/category/${currentId}` : `${API_URL}/admin/rental/category`;
      const method = editMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (data.status) {
        fetchCategories();
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
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/admin/rental/category/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status) {
        fetchCategories();
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
        <h3 className="fw-bold m-0">Rental Categories</h3>
        <Button variant="primary" onClick={() => handleShow()}>
          <i className="fa-solid fa-plus me-1"></i> Add Category
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body>
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Table responsive hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted">No rental categories found.</td>
                  </tr>
                ) : (
                  categories.map(cat => (
                    <tr key={cat._id}>
                      <td className="fw-semibold">{cat.title}</td>
                      <td>{cat.description || '-'}</td>
                      <td>
                        <span className={`badge bg-${cat.isActive ? 'success' : 'secondary'}`}>
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-end">
                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShow(cat)}>
                          Edit
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(cat._id)}>
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

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Category' : 'Add New Category'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title *</Form.Label>
              <Form.Control 
                type="text" 
                required 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Icon URL</Form.Label>
              <Form.Control 
                type="text" 
                value={formData.icon} 
                onChange={(e) => setFormData({...formData, icon: e.target.value})} 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control 
                type="text" 
                value={formData.image} 
                onChange={(e) => setFormData({...formData, image: e.target.value})} 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check 
                type="switch" 
                id="isActiveSwitch"
                label="Is Active"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" type="submit">Save Changes</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
