'use client';
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Spinner, Alert, Modal, Form, Pagination, Badge } from 'react-bootstrap';
import { adminService } from '@/services/adminService';
import { toast } from 'react-toastify';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering & Pagination
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [merchants, setMerchants] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Order Details Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Status Update State
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch list of merchants for the filter
  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const data = await adminService.getAdminMerchants(1, 100);
        if (data.success && Array.isArray(data.data)) {
          setMerchants(data.data);
        }
      } catch (err) {
        console.error('Failed to load merchants for orders filter:', err);
      }
    };
    fetchMerchants();
  }, []);

  const fetchOrders = async (page = 1, status = selectedStatus, merchantId = selectedMerchant) => {
    try {
      setLoading(true);
      const data = await adminService.getAdminOrders(page, 10, status, merchantId);
      if (data.status) {
        setOrders(data.orders || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setCurrentPage(data.pagination.currentPage || 1);
        }
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, selectedStatus, selectedMerchant);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedStatus, selectedMerchant]);

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleMerchantFilterChange = (merchantId: string) => {
    setSelectedMerchant(merchantId);
    setCurrentPage(1);
  };

  const handleOpenDetailModal = async (orderId: string) => {
    try {
      setDetailLoading(true);
      setShowDetailModal(true);
      setSelectedOrder(null);
      const data = await adminService.getAdminOrderById(orderId);
      if (data.status) {
        setSelectedOrder(data.order);
        setNewStatus(data.order.orderStatus || 'pending');
        setTrackingNumber(data.order.trackingNumber || '');
      } else {
        toast.error(data.message || 'Failed to load order details');
      }
    } catch (err) {
      toast.error('Error loading order details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      setUpdatingStatus(true);
      const data = await adminService.updateAdminOrderStatus(selectedOrder._id, newStatus, trackingNumber);
      if (data.status) {
        toast.success('Order status updated successfully');
        setShowDetailModal(false);
        fetchOrders(currentPage);
      } else {
        toast.error(data.message || 'Failed to update order status');
      }
    } catch (err) {
      toast.error('Error updating status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <Badge bg="success">Delivered</Badge>;
      case 'processing':
        return <Badge bg="primary">Processing</Badge>;
      case 'shipped':
        return <Badge bg="info">Shipped</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="warning" text="dark">Pending</Badge>;
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="text-dark fw-bold mb-1">Orders Management</h3>
          <p className="text-muted mb-0 small">Track and manage customer orders containing your products</p>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm border-0 rounded-3">
        <Card.Header className="bg-white py-3 border-bottom d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <h5 className="mb-0 fw-bold text-dark">Order History</h5>
            {selectedMerchant && (
              <Badge bg="primary" className="fw-normal d-flex align-items-center gap-1">
                <span>🏪</span> {merchants.find(m => m._id === selectedMerchant)?.business_name || 'Selected Merchant'}
                <button
                  type="button"
                  className="btn-close btn-close-white ms-1"
                  style={{ fontSize: '8px' }}
                  onClick={() => handleMerchantFilterChange('')}
                  aria-label="Clear merchant filter"
                />
              </Badge>
            )}
            {selectedStatus && (
              <Badge bg="secondary" className="fw-normal d-flex align-items-center gap-1">
                Status: {selectedStatus}
                <button
                  type="button"
                  className="btn-close btn-close-white ms-1"
                  style={{ fontSize: '8px' }}
                  onClick={() => { setSelectedStatus(''); setCurrentPage(1); }}
                  aria-label="Clear status filter"
                />
              </Badge>
            )}
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Merchant Dropdown Filter */}
            <div className="d-flex align-items-center gap-1">
              <span className="text-muted small fw-medium">Merchant:</span>
              <Form.Select
                size="sm"
                value={selectedMerchant}
                onChange={(e) => handleMerchantFilterChange(e.target.value)}
                style={{ minWidth: '180px' }}
              >
                <option value="">All Merchants</option>
                {merchants.map((m) => (
                  <option key={m._id} value={m._id}>
                    🏪 {m.business_name || m.name}
                  </option>
                ))}
              </Form.Select>
            </div>

            {/* Status Dropdown Filter */}
            <div className="d-flex align-items-center gap-1">
              <span className="text-muted small fw-medium">Status:</span>
              <Form.Select
                size="sm"
                value={selectedStatus}
                onChange={handleStatusFilterChange}
                style={{ minWidth: '150px' }}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </div>

            {(selectedMerchant || selectedStatus) && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setSelectedMerchant('');
                  setSelectedStatus('');
                  setCurrentPage(1);
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </Card.Header>

        {/* Quick Merchant Filter Pills Bar */}
        {merchants.length > 0 && (
          <div className="bg-light px-3 py-2 border-bottom d-flex align-items-center gap-2 overflow-auto" style={{ whiteSpace: 'nowrap' }}>
            <span className="small fw-semibold text-secondary me-1">🏪 Merchants:</span>
            <button
              type="button"
              onClick={() => handleMerchantFilterChange('')}
              className={`btn btn-sm rounded-pill py-1 px-3 ${selectedMerchant === '' ? 'btn-primary' : 'btn-outline-secondary bg-white'}`}
              style={{ fontSize: '12px' }}
            >
              All Merchants
            </button>
            {merchants.map((m) => (
              <button
                key={m._id}
                type="button"
                onClick={() => handleMerchantFilterChange(m._id)}
                className={`btn btn-sm rounded-pill py-1 px-3 ${selectedMerchant === m._id ? 'btn-primary' : 'btn-outline-secondary bg-white'}`}
                style={{ fontSize: '12px' }}
              >
                🏪 {m.business_name || m.name}
              </button>
            ))}
          </div>
        )}

        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted small">Loading orders...</p>
            </div>
          ) : (
            <>
              <Table responsive hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Merchant / Store</th>
                    <th>Date</th>
                    <th>Total Amount</th>
                    <th>Payment</th>
                    <th>Order Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-5 text-muted">
                        No orders found {selectedStatus ? `with status "${selectedStatus}"` : ''} {selectedMerchant ? `for the selected merchant` : ''}.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id} className="align-middle">
                        <td className="fw-semibold text-primary">
                          #{order._id.slice(-6).toUpperCase()}
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium text-dark">{order.userId?.name || 'Customer'}</div>
                            <div className="text-muted small" style={{ fontSize: '11px' }}>{order.userId?.email}</div>
                          </div>
                        </td>
                        <td>
                          {(() => {
                            const merchantMap = new Map();
                            (order.items || []).forEach((item: any) => {
                              if (item.merchantId) {
                                const id = item.merchantId._id || item.merchantId;
                                const name = item.merchantId.business_name || item.merchantId.name || 'Merchant';
                                merchantMap.set(String(id), name);
                              }
                            });

                            if (merchantMap.size === 0) {
                              return (
                                <span className="badge bg-secondary-subtle text-secondary border px-2 py-1">
                                  Platform Direct
                                </span>
                              );
                            }

                            return (
                              <div className="d-flex flex-wrap gap-1">
                                {Array.from(merchantMap.entries()).map(([id, name]) => (
                                  <span
                                    key={id}
                                    className="badge bg-info-subtle text-info-emphasis border px-2 py-1"
                                    style={{ cursor: 'pointer' }}
                                    title="Click to filter by this merchant"
                                    onClick={() => handleMerchantFilterChange(id)}
                                  >
                                    🏪 {name}
                                  </span>
                                ))}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="small text-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="fw-bold text-success">₹{order.totalAmount}</td>
                        <td>
                          <Badge bg={order.paymentStatus === 'paid' ? 'success' : 'warning'} text={order.paymentStatus === 'paid' ? 'white' : 'dark'}>
                            {order.paymentStatus || 'pending'} ({order.paymentMethod || 'COD'})
                          </Badge>
                        </td>
                        <td>{getStatusBadge(order.orderStatus)}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleOpenDetailModal(order._id)}
                          >
                            Manage Order
                          </Button>
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

      {/* Order Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            Order Details #{selectedOrder?._id ? selectedOrder._id.slice(-6).toUpperCase() : ''}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : selectedOrder ? (
            <div>
              {/* Customer & Shipping Section */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <h6 className="fw-bold text-secondary mb-2 small text-uppercase">Customer Information</h6>
                    <p className="mb-1 fw-bold text-dark">{selectedOrder.userId?.name || 'Customer'}</p>
                    <p className="mb-1 text-muted small">📧 {selectedOrder.userId?.email || 'N/A'}</p>
                    <p className="mb-0 text-muted small">📱 {selectedOrder.userId?.mobile || 'N/A'}</p>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <h6 className="fw-bold text-secondary mb-2 small text-uppercase">Shipping Address</h6>
                    {selectedOrder.shippingAddress ? (
                      <p className="mb-0 text-dark small">
                        {selectedOrder.shippingAddress.street}<br />
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}<br />
                        {selectedOrder.shippingAddress.country}
                      </p>
                    ) : (
                      <p className="text-muted small mb-0">No shipping address recorded</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <h6 className="fw-bold text-dark mb-2">Order Items</h6>
              <div className="border rounded-3 overflow-hidden mb-4">
                <Table responsive hover className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th>Merchant</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                              )}
                              <span className="fw-medium text-dark">{item.title}</span>
                            </div>
                          </td>
                          <td>
                            <div className="text-muted small">
                              {item.merchantId?.business_name || item.merchantId?.name || 'Platform'}
                            </div>
                          </td>
                          <td>₹{item.price}</td>
                          <td>x {item.quantity}</td>
                          <td className="fw-bold text-dark">₹{item.price * item.quantity}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-muted text-center py-3">No items found</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <td colSpan={4} className="text-end fw-bold">Total Amount:</td>
                      <td className="fw-bold text-success fs-6">₹{selectedOrder.totalAmount}</td>
                    </tr>
                  </tfoot>
                </Table>
              </div>

              {/* Update Order Status */}
              <div className="card border-primary-subtle p-3 rounded-3 bg-white">
                <h6 className="fw-bold text-primary mb-3">Update Order & Tracking</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <Form.Group controlId="updateOrderStatus">
                      <Form.Label className="small fw-semibold">Fulfillment Status</Form.Label>
                      <Form.Select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </Form.Select>
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group controlId="updateTracking">
                      <Form.Label className="small fw-semibold">Tracking Number / Courier</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g. DTDC-987654"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                      />
                    </Form.Group>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted">No order details found</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateStatus} disabled={updatingStatus}>
            {updatingStatus ? <Spinner as="span" animation="border" size="sm" className="me-1" /> : null}
            Save Status Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
