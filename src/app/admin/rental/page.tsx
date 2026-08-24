'use client';
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import Link from 'next/link';

export default function RentalDashboardOverview() {
  return (
    <div>
      <h3 className="mb-4 fw-bold">Rental Dashboard Overview</h3>
      <Row className="g-4">
        <Col md={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center py-5">
              <i className="fa-solid fa-tags text-primary mb-3" style={{ fontSize: '3rem' }}></i>
              <Card.Title className="fw-bold">Rental Categories</Card.Title>
              <Card.Text className="text-muted text-center">
                Manage the categories for all your rental products.
              </Card.Text>
              <Link href="/admin/rental/categories" className="btn btn-primary mt-auto">
                Manage Categories
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center py-5">
              <i className="fa-solid fa-box-open text-success mb-3" style={{ fontSize: '3rem' }}></i>
              <Card.Title className="fw-bold">Rental Products</Card.Title>
              <Card.Text className="text-muted text-center">
                Add, edit, or remove products available for rent.
              </Card.Text>
              <Link href="/admin/rental/products" className="btn btn-success mt-auto">
                Manage Products
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
