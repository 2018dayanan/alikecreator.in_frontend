'use client';
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Spinner, Alert, Modal, Form, Pagination } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/adminService';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const data = await adminService.getProducts(page, 10);

      if (data.status) {
        setProducts(data.products);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setCurrentPage(data.pagination.currentPage);
        }
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError('An error occurred while fetching products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const data = await adminService.deleteProduct(id);
      
      if (data.status) {
        fetchProducts(currentPage); // Refresh list
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch (err) {
      alert('Error deleting product');
    }
  };

  // Helper to safely get image source
  const getImageUrl = (images: any) => {
    if (!images) return null;
    if (typeof images === 'string') return images;
    if (Array.isArray(images) && images.length > 0) return images[0];
    return null;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark fw-bold mb-0">Products</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>Add Product</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white py-3 border-bottom">
          <h5 className="mb-0 fw-bold text-dark">All Products</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
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
                      <td colSpan={6} className="text-center p-4">No products found.</td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const imageSrc = getImageUrl(product.images);
                      return (
                        <tr key={product._id} className="align-middle">
                          <td>
                            {imageSrc ? (
                              <img src={imageSrc} alt={product.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                            ) : (
                              <div style={{ width: '50px', height: '50px', backgroundColor: '#e9ecef', borderRadius: '4px' }}></div>
                            )}
                          </td>
                          <td className="fw-medium">{product.title}</td>
                          <td>₹{product.price}</td>
                          <td>{product.categoryId?.name || 'N/A'}</td>
                          <td>{product.merchantId?.name || 'N/A'}</td>
                          <td>
                            <Button variant="outline-primary" size="sm" className="me-2" onClick={() => alert('Edit functionality to be implemented')}>Edit</Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(product._id)}>Delete</Button>
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
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
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
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                      disabled={currentPage === totalPages} 
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Add Product Modal (Placeholder) */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            Full product creation requires selecting a Category and Merchant. 
            This form would typically contain fields for Title, Description, Images, Price, etc.
          </Alert>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Product Title</Form.Label>
              <Form.Control type="text" placeholder="Enter product title" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price (₹)</Form.Label>
              <Form.Control type="number" placeholder="Enter price in INR" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => {
            alert('Save functionality to be implemented');
            setShowModal(false);
          }}>
            Save Product
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
