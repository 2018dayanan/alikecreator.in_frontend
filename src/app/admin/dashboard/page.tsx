'use client';
import React from 'react';
import { Row, Col, Card, Table } from 'react-bootstrap';

export default function AdminDashboard() {
  return (
    <div>
      <h2 className="mb-4 text-dark fw-bold">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <Row className="mb-4 g-4">
        <Col md={3}>
          <Card className="bg-primary text-white shadow-sm border-0 h-100">
            <Card.Body>
              <h5 className="mb-2">Total Sales</h5>
              <h3 className="mb-0 fw-bold">₹24,500</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-success text-white shadow-sm border-0 h-100">
            <Card.Body>
              <h5 className="mb-2">New Orders</h5>
              <h3 className="mb-0 fw-bold">142</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-info text-white shadow-sm border-0 h-100">
            <Card.Body>
              <h5 className="mb-2">Total Products</h5>
              <h3 className="mb-0 fw-bold">1,024</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-warning text-dark shadow-sm border-0 h-100">
            <Card.Body>
              <h5 className="mb-2">Active Users</h5>
              <h3 className="mb-0 fw-bold">89</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders Table */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white py-3 border-bottom">
          <h5 className="mb-0 fw-bold text-dark">Recent Orders</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#ORD-7352</td>
                <td>John Doe</td>
                <td>Aug 18, 2026</td>
                <td><span className="badge bg-success rounded-pill px-3">Completed</span></td>
                <td>₹124.00</td>
              </tr>
              <tr>
                <td>#ORD-7351</td>
                <td>Jane Smith</td>
                <td>Aug 18, 2026</td>
                <td><span className="badge bg-warning rounded-pill px-3 text-dark">Pending</span></td>
                <td>₹85.50</td>
              </tr>
              <tr>
                <td>#ORD-7350</td>
                <td>Michael Johnson</td>
                <td>Aug 17, 2026</td>
                <td><span className="badge bg-primary rounded-pill px-3">Processing</span></td>
                <td>₹210.00</td>
              </tr>
              <tr>
                <td>#ORD-7349</td>
                <td>Emily Davis</td>
                <td>Aug 17, 2026</td>
                <td><span className="badge bg-danger rounded-pill px-3">Cancelled</span></td>
                <td>₹45.00</td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}
