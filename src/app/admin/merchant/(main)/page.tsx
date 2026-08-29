'use client';
import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import Link from 'next/link';
import { merchantService } from '@/services/merchantService';

export default function MerchantDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await merchantService.getDashboardStats();
      if (data.status) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setLowStockProducts(data.lowStockProducts || []);
      } else {
        setError(data.message || 'Failed to load dashboard metrics');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching dashboard statistics.');
    } finally {
      setLoading(false);
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
      {/* Top Welcome Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-3 shadow-sm border">
        <div>
          <h3 className="text-dark fw-bold mb-1">Merchant Dashboard</h3>
          <p className="text-muted mb-0 small">Welcome back! Here is a summary of your store performance.</p>
        </div>
        <div className="d-flex gap-2">
          <Link href="/merchant/dashboard/products" className="btn btn-primary fw-semibold shadow-sm">
            + Add Product
          </Link>
          <Link href="/merchant/dashboard/categories" className="btn btn-outline-secondary fw-semibold">
            + Add Category
          </Link>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted small">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <Row className="mb-4 g-3">
            <Col sm={6} lg={3}>
              <Card className="bg-primary text-white shadow-sm border-0 h-100 rounded-3">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-white-50 small fw-semibold text-uppercase">Total Sales</span>
                    <span className="fs-4">💰</span>
                  </div>
                  <h3 className="mb-0 fw-bold">₹{stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : 0}</h3>
                  <small className="text-white-50">Earnings from fulfilled orders</small>
                </Card.Body>
              </Card>
            </Col>

            <Col sm={6} lg={3}>
              <Card className="bg-success text-white shadow-sm border-0 h-100 rounded-3">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-white-50 small fw-semibold text-uppercase">Total Orders</span>
                    <span className="fs-4">🛒</span>
                  </div>
                  <h3 className="mb-0 fw-bold">{stats?.totalOrders || 0}</h3>
                  <small className="text-white-50">{stats?.pendingOrders || 0} orders pending</small>
                </Card.Body>
              </Card>
            </Col>

            <Col sm={6} lg={3}>
              <Card className="bg-dark text-white shadow-sm border-0 h-100 rounded-3">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-white-50 small fw-semibold text-uppercase">My Products</span>
                    <span className="fs-4">📦</span>
                  </div>
                  <h3 className="mb-0 fw-bold">{stats?.totalProducts || 0}</h3>
                  <small className="text-white-50">Active in catalog</small>
                </Card.Body>
              </Card>
            </Col>

            <Col sm={6} lg={3}>
              <Card className="bg-warning text-dark shadow-sm border-0 h-100 rounded-3">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-dark small fw-semibold text-uppercase">Low Stock Alert</span>
                    <span className="fs-4">⚠️</span>
                  </div>
                  <h3 className="mb-0 fw-bold">{stats?.lowStockCount || 0}</h3>
                  <small className="text-dark">Products with ≤ 5 units</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4">
            {/* Recent Orders Section */}
            <Col lg={8}>
              <Card className="shadow-sm border-0 rounded-3 h-100">
                <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold text-dark">Recent Orders</h5>
                  <Link href="/merchant/dashboard/orders" className="small text-primary text-decoration-none fw-semibold">
                    View All Orders →
                  </Link>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table responsive hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Status</th>
                        <th>Store Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-5 text-muted">
                            No orders found yet. Once customers purchase your items, they will show up here.
                          </td>
                        </tr>
                      ) : (
                        recentOrders.map((order) => (
                          <tr key={order._id} className="align-middle">
                            <td className="fw-medium text-primary">
                              <Link href={`/merchant/dashboard/orders`} className="text-decoration-none">
                                #{order._id.slice(-6).toUpperCase()}
                              </Link>
                            </td>
                            <td>{order.userId?.name || 'Customer'}</td>
                            <td className="small text-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>{order.itemCount} items</td>
                            <td>{getStatusBadge(order.orderStatus)}</td>
                            <td className="fw-bold text-dark">₹{order.merchantSubtotal}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            {/* Low Stock / Quick Actions Section */}
            <Col lg={4}>
              <Card className="shadow-sm border-0 rounded-3 mb-4">
                <Card.Header className="bg-white py-3 border-bottom">
                  <h5 className="mb-0 fw-bold text-dark">Low Stock Products</h5>
                </Card.Header>
                <Card.Body className="p-3">
                  {lowStockProducts.length === 0 ? (
                    <p className="text-muted small mb-0 text-center py-3">All products are adequately stocked! 👍</p>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {lowStockProducts.map((p) => (
                        <div key={p._id} className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                          <div>
                            <p className="mb-0 fw-semibold small text-dark">{p.title}</p>
                            <span className="badge bg-danger rounded-pill">{p.quantity} left</span>
                          </div>
                          <Link href="/merchant/dashboard/products" className="btn btn-outline-primary btn-sm py-0 px-2" style={{ fontSize: '11px' }}>
                            Restock
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>

              <Card className="shadow-sm border-0 rounded-3 bg-dark text-white">
                <Card.Body className="p-4">
                  <h6 className="fw-bold mb-2">Merchant Store Tools</h6>
                  <p className="small text-white-50 mb-3">Keep your store profile updated with banking details for quick payouts.</p>
                  <Link href="/merchant/dashboard/profile" className="btn btn-light btn-sm fw-semibold w-100">
                    Manage Store Settings
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
