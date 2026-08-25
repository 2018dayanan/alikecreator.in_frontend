'use client';
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Spinner, Alert, Modal, Form, Pagination, Badge } from 'react-bootstrap';
import { merchantService } from '@/services/merchantService';
import { toast } from 'react-toastify';

export default function MerchantCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    image: '',
    status: 'active'
  });
  const [selectedIconFile, setSelectedIconFile] = useState<File | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const fetchCategories = async (page = 1, search = searchQuery) => {
    try {
      setLoading(true);
      const data = await merchantService.getCategories(page, 10, search);
      if (data.status) {
        setCategories(data.categories || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setCurrentPage(data.pagination.currentPage || 1);
        }
      } else {
        setError(data.message || 'Failed to fetch categories');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(currentPage, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCategories(1, searchQuery);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCurrentPage(1);
    fetchCategories(1, '');
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      description: '',
      icon: '',
      image: '',
      status: 'active'
    });
    setIsEditing(false);
    setCurrentCategoryId(null);
    setSelectedIconFile(null);
    setSelectedImageFile(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (category: any) => {
    setFormData({
      name: category.name || '',
      description: category.description || '',
      icon: category.icon || '',
      image: category.image || '',
      status: category.status || 'active'
    });
    setIsEditing(true);
    setCurrentCategoryId(category._id);
    setSelectedIconFile(null);
    setSelectedImageFile(null);
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning('Category name is required');
      return;
    }

    try {
      setSaving(true);
      const uploadData = new FormData();
      uploadData.append('name', formData.name);
      if (formData.description) uploadData.append('description', formData.description);
      uploadData.append('status', formData.status);
      if (formData.icon) uploadData.append('icon', formData.icon);
      if (formData.image) uploadData.append('image', formData.image);

      if (selectedIconFile) uploadData.append('icon', selectedIconFile);
      if (selectedImageFile) uploadData.append('image', selectedImageFile);

      let res;
      if (isEditing && currentCategoryId) {
        res = await merchantService.updateCategory(currentCategoryId, uploadData as any);
      } else {
        res = await merchantService.createCategory(uploadData as any);
      }

      if (res.status) {
        toast.success(isEditing ? 'Category updated successfully!' : 'Category created successfully!');
        setShowModal(false);
        fetchCategories(currentPage);
      } else {
        toast.error(res.message || 'Failed to save category');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while saving category');
    } finally {
      setSaving(false);
    }
  };

  const handlePromptDelete = (cat: any) => {
    setCategoryToDelete(cat);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      const res = await merchantService.deleteCategory(categoryToDelete._id);
      if (res.status) {
        toast.success('Category deleted successfully');
        setShowDeleteModal(false);
        setCategoryToDelete(null);
        fetchCategories(currentPage);
      } else {
        toast.error(res.message || 'Failed to delete category');
      }
    } catch (err) {
      toast.error('Error deleting category');
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="text-dark fw-bold mb-1">My Categories</h3>
          <p className="text-muted mb-0 small">Manage custom categories specific to your merchant catalog</p>
        </div>
        <Button variant="primary" onClick={handleOpenAddModal} className="fw-semibold shadow-sm">
          + Add Category
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm border-0 rounded-3">
        <Card.Header className="bg-white py-3 border-bottom d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
          <h5 className="mb-0 fw-bold text-dark">Store Categories</h5>

          <Form onSubmit={handleSearchSubmit} className="d-flex gap-2">
            <Form.Control
              type="search"
              size="sm"
              placeholder="Search category name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '200px' }}
            />
            <Button size="sm" variant="outline-primary" type="submit">
              Search
            </Button>
            {searchQuery && (
              <Button variant="outline-secondary" size="sm" onClick={handleResetFilters}>
                ✕
              </Button>
            )}
          </Form>
        </Card.Header>

        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted small">Loading your categories...</p>
            </div>
          ) : (
            <>
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Image</th>
                    <th>Category Name</th>
                    <th>Slug</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-5 text-muted">
                        No custom categories created yet. Click <strong>+ Add Category</strong> to create one!
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat._id} className="align-middle">
                        <td>
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              🏷️
                            </div>
                          )}
                        </td>
                        <td className="fw-semibold text-dark">{cat.name}</td>
                        <td className="text-muted small"><code>{cat.slug || '-'}</code></td>
                        <td className="text-muted small" style={{ maxWidth: '250px' }}>
                          {cat.description ? (
                            cat.description.length > 60 ? `${cat.description.slice(0, 60)}...` : cat.description
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          <Badge bg={cat.status === 'active' ? 'success' : 'secondary'}>
                            {cat.status || 'active'}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button variant="outline-primary" size="sm" onClick={() => handleOpenEditModal(cat)}>
                              Edit
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handlePromptDelete(cat)}>
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
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

      {/* Add / Edit Category Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">{isEditing ? 'Edit Category' : 'Add Category'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="catName">
              <Form.Label className="small fw-semibold">Category Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="e.g. Smart Watches"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="catDesc">
              <Form.Label className="small fw-semibold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Short overview of items in this category"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">Upload Icon (File)</Form.Label>
              <Form.Control
                type="file"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedIconFile(e.target.files[0]);
                  }
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="catIcon">
              <Form.Label className="small fw-semibold">Or Icon URL</Form.Label>
              <Form.Control
                type="url"
                name="icon"
                value={formData.icon}
                onChange={handleFormChange}
                placeholder="https://example.com/icon.png"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">Upload Banner Image (File)</Form.Label>
              <Form.Control
                type="file"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedImageFile(e.target.files[0]);
                  }
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="catImage">
              <Form.Label className="small fw-semibold">Or Banner URL</Form.Label>
              <Form.Control
                type="url"
                name="image"
                value={formData.image}
                onChange={handleFormChange}
                placeholder="https://example.com/category-image.jpg"
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="catStatus">
              <Form.Label className="small fw-semibold">Status</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleFormChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? <Spinner as="span" animation="border" size="sm" className="me-1" /> : null}
                {isEditing ? 'Save Changes' : 'Create Category'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger fw-bold">Delete Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete category <strong>{categoryToDelete?.name}</strong>?
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
    </div>
  );
}
