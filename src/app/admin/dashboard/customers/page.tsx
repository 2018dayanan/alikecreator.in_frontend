'use client';
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Spinner, Alert, Modal, Form, Pagination, Badge, Tabs, Tab, Dropdown } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/adminService';
import { toast } from 'react-toastify';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Add / Edit Modal
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCustomerId, setCurrentCustomerId] = useState<string | null>(null);
  const [customerFormData, setCustomerFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    gender: 'male',
    status: 'active',
  });

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<{ id: string; name: string } | null>(null);

  // Customer Details & Order History Modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [detailsTab, setDetailsTab] = useState<'orders' | 'profile'>('orders');

  const router = useRouter();

  const fetchCustomers = async (page = 1, search = searchTerm, status = statusFilter) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const data = await adminService.getAdminUsers(page, 10, search, status);

      if (data.success || data.status) {
        setCustomers(data.data || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setCurrentPage(data.pagination.currentPage || 1);
        }
      } else {
        setError(data.message || 'Failed to fetch customers');
        toast.error(data.message || 'Failed to fetch customers');
      }
    } catch (err) {
      setError('An error occurred while fetching customers.');
      toast.error('An error occurred while fetching customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(currentPage, searchTerm, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCustomers(1, searchTerm, statusFilter);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCurrentPage(1);
    fetchCustomers(1, '', '');
  };

  // Add / Edit Customer
  const handleOpenAddModal = () => {
    setCustomerFormData({
      name: '',
      email: '',
      mobile: '',
      password: '',
      gender: 'male',
      status: 'active',
    });
    setIsEditing(false);
    setCurrentCustomerId(null);
    setShowCustomerModal(true);
  };

  const handleOpenEditModal = (user: any) => {
    setCustomerFormData({
      name: user.name || '',
      email: user.email || '',
      mobile: user.mobile || '',
      password: '',
      gender: user.gender || 'male',
      status: user.status || 'active',
    });
    setIsEditing(true);
    setCurrentCustomerId(user._id);
    setShowCustomerModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveCustomer = async () => {
    if (!customerFormData.name || !customerFormData.email) {
      toast.warning('Name and Email are required.');
      return;
    }

    if (!isEditing && !customerFormData.password) {
      toast.warning('Password is required for new customers.');
      return;
    }

    try {
      let data;
      if (isEditing && currentCustomerId) {
        data = await adminService.updateUser(currentCustomerId, customerFormData);
      } else {
        data = await adminService.createUser(customerFormData);
      }

      if (data.success || data.status) {
        toast.success(isEditing ? 'Customer updated successfully' : 'Customer created successfully');
        setShowCustomerModal(false);
        fetchCustomers(currentPage, searchTerm, statusFilter);
      } else {
        toast.error(data.message || 'Failed to save customer');
      }
    } catch (err) {
      toast.error('An error occurred while saving.');
    }
  };

  // Delete Customer
  const handlePromptDelete = (user: any) => {
    setCustomerToDelete({ id: user._id, name: user.name });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      const data = await adminService.deleteUser(customerToDelete.id);
      if (data.success || data.status) {
        toast.success('Customer deleted successfully');
        setShowDeleteModal(false);
        setCustomerToDelete(null);
        fetchCustomers(currentPage, searchTerm, statusFilter);
      } else {
        toast.error(data.message || 'Failed to delete customer');
      }
    } catch (err) {
      toast.error('Error deleting customer');
    }
  };

  // Toggle User Status
  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const data = await adminService.updateUserStatus(user._id, newStatus);
      if (data.success || data.status) {
        toast.success(`Customer status changed to ${newStatus}`);
        fetchCustomers(currentPage, searchTerm, statusFilter);
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (err) {
      toast.error('Error updating customer status');
    }
  };

  // View Customer Details & Orders
  const handleViewCustomerDetails = async (user: any) => {
    setSelectedCustomer(user);
    setShowDetailsModal(true);
    setDetailsTab('orders');
    setCustomerOrders([]);

    try {
      setOrdersLoading(true);
      const data = await adminService.getUserOrders(user._id);
      if (data.success || data.status) {
        setCustomerOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching customer orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="text-dark fw-bold mb-0">Customers</h2>
          <small className="text-muted">Manage customer accounts, status, and order histories</small>
        </div>
        <Button variant="primary" onClick={handleOpenAddModal}>
          + Add Customer
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Main Customers Table Card */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white py-3 border-bottom d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <h5 className="mb-0 fw-bold text-dark">All Customers</h5>

          {/* Search & Filter Toolbar */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            <Form onSubmit={handleSearchSubmit} className="d-flex gap-2">
              <Form.Control
                size="sm"
                type="text"
                placeholder="Search name, email, mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '220px' }}
              />
              <Button type="submit" variant="secondary" size="sm">
                Search
              </Button>
            </Form>

            <Form.Select
              size="sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '130px' }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Form.Select>

            {(searchTerm || statusFilter) && (
              <Button variant="outline-secondary" size="sm" onClick={handleClearFilters}>
                ✕ Reset
              </Button>
            )}
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted small">Loading customers...</p>
            </div>
          ) : (
            <>
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Customer</th>
                    <th>Email Address</th>
                    <th>Mobile</th>
                    <th>Gender</th>
                    <th>Status</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-5 text-muted">
                        No customers found {searchTerm || statusFilter ? 'matching your filters' : ''}.
                      </td>
                    </tr>
                  ) : (
                    customers.map((user) => (
                      <tr key={user._id} className="align-middle">
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {user.profile_picture ? (
                              <img
                                src={user.profile_picture}
                                alt={user.name}
                                style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '50%' }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '38px',
                                  height: '38px',
                                  backgroundColor: '#e9ecef',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                👤
                              </div>
                            )}
                            <div>
                              <strong className="text-dark d-block">{user.name}</strong>
                              {user.unique_id && <small className="text-muted">UID: {user.unique_id}</small>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <a href={`mailto:${user.email}`} className="text-primary">
                            {user.email}
                          </a>
                        </td>
                        <td>{user.mobile || '—'}</td>
                        <td className="text-capitalize">{user.gender || '—'}</td>
                        <td>
                          <Badge bg={user.status === 'active' ? 'success' : 'secondary'}>
                            {user.status || 'inactive'}
                          </Badge>
                        </td>
                        <td className="text-muted small">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td>
                          <Dropdown align="end">
                            <Dropdown.Toggle
                              variant="light"
                              size="sm"
                              className="rounded-circle border border-secondary border-opacity-25 shadow-none d-inline-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px', fontSize: '18px', lineHeight: '1', padding: 0 }}
                              id={`dropdown-customer-${user._id}`}
                            >
                              ⋮
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="shadow border-0 py-2">
                              <Dropdown.Item onClick={() => handleViewCustomerDetails(user)}>
                                📦 View Orders & Info
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleOpenEditModal(user)}>
                                ✏️ Edit Customer
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleToggleStatus(user)}>
                                {user.status === 'active' ? '⏸️ Deactivate Account' : '▶️ Activate Account'}
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item
                                className="text-danger"
                                onClick={() => handlePromptDelete(user)}
                              >
                                🗑️ Delete Customer
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>

              {/* Pagination */}
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

      {/* Add / Edit Customer Modal */}
      <Modal show={showCustomerModal} onHide={() => setShowCustomerModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Customer' : 'Add New Customer'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Customer Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={customerFormData.name}
                onChange={handleFormChange}
                placeholder="e.g. Rahul Sharma"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email Address *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={customerFormData.email}
                onChange={handleFormChange}
                placeholder="rahul@example.com"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mobile / Phone</Form.Label>
              <Form.Control
                type="tel"
                name="mobile"
                value={customerFormData.mobile}
                onChange={handleFormChange}
                placeholder="+91 9876543210"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{isEditing ? 'New Password (leave blank to keep current)' : 'Password *'}</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={customerFormData.password}
                onChange={handleFormChange}
                placeholder="Min 6 characters"
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select name="gender" value={customerFormData.gender} onChange={handleFormChange}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select name="status" value={customerFormData.status} onChange={handleFormChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCustomerModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveCustomer}>
            {isEditing ? 'Save Changes' : 'Create Customer'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete customer <strong>{customerToDelete?.name}</strong>? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete Customer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Customer Details & Order History Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="xl" centered>
        <Modal.Header closeButton className="bg-light">
          <div className="d-flex align-items-center gap-3">
            <h5 className="fw-bold text-dark mb-0">👤 {selectedCustomer?.name}&apos;s Details & Orders</h5>
            <Badge bg={selectedCustomer?.status === 'active' ? 'success' : 'secondary'}>
              {selectedCustomer?.status || 'inactive'}
            </Badge>
          </div>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Tabs activeKey={detailsTab} onSelect={(k) => setDetailsTab((k as any) || 'orders')} className="mb-4 nav-pills">
            {/* Tab 1: Orders */}
            <Tab eventKey="orders" title={`📦 Orders History (${customerOrders.length})`}>
              {ordersLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted">Loading customer orders...</p>
                </div>
              ) : customerOrders.length === 0 ? (
                <div className="text-center py-5 border rounded bg-light">
                  <p className="text-muted mb-0">No orders placed by this customer yet.</p>
                </div>
              ) : (
                <Table responsive hover className="border">
                  <thead className="table-light">
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total Amount</th>
                      <th>Payment Status</th>
                      <th>Order Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerOrders.map((order) => (
                      <tr key={order._id} className="align-middle">
                        <td>
                          <code>#{order._id.substring(order._id.length - 8).toUpperCase()}</code>
                        </td>
                        <td className="small text-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div>
                            {order.items?.map((item: any, idx: number) => (
                              <div key={idx} className="small">
                                • {item.title} (x{item.quantity})
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="fw-bold text-success">₹{order.totalAmount}</td>
                        <td>
                          <Badge bg={order.paymentStatus === 'paid' ? 'success' : 'warning'} text={order.paymentStatus === 'paid' ? 'white' : 'dark'}>
                            {order.paymentStatus || 'pending'}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={order.orderStatus === 'delivered' ? 'success' : order.orderStatus === 'shipped' ? 'info' : 'secondary'}>
                            {order.orderStatus || 'pending'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab>

            {/* Tab 2: Profile */}
            <Tab eventKey="profile" title="👤 Customer Profile">
              {selectedCustomer && (
                <div className="card bg-primary text-white border-0 p-4 rounded-3 shadow-sm">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <span className="text-white-50 d-block small">Full Name</span>
                      <strong className="fs-5 text-white">{selectedCustomer.name}</strong>
                    </div>
                    <div className="col-md-4">
                      <span className="text-white-50 d-block small">Email Address</span>
                      <a href={`mailto:${selectedCustomer.email}`} className="text-white text-decoration-underline">
                        {selectedCustomer.email}
                      </a>
                    </div>
                    <div className="col-md-4">
                      <span className="text-white-50 d-block small">Mobile / Phone</span>
                      <span className="text-white">{selectedCustomer.mobile || 'N/A'}</span>
                    </div>
                    <div className="col-md-4">
                      <span className="text-white-50 d-block small">Gender</span>
                      <span className="text-white text-capitalize">{selectedCustomer.gender || 'N/A'}</span>
                    </div>
                    <div className="col-md-4">
                      <span className="text-white-50 d-block small">Account Status</span>
                      <span className="badge bg-light text-dark">{selectedCustomer.status}</span>
                    </div>
                    <div className="col-md-4">
                      <span className="text-white-50 d-block small">Joined On</span>
                      <span className="text-white">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
