'use client';
import React from 'react';
import { Card, Table, Button } from 'react-bootstrap';

export default function MerchantsPage() {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark fw-bold mb-0">Merchants</h2>
        <Button variant="primary">Add Merchant</Button>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white py-3 border-bottom">
          <h5 className="mb-0 fw-bold text-dark">All Merchants</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Store Name</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#MER-101</td>
                <td>Tech Haven</td>
                <td>Alex Johnson</td>
                <td><span className="badge bg-success rounded-pill px-3">Active</span></td>
                <td>Aug 10, 2026</td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-2">Edit</Button>
                  <Button variant="outline-danger" size="sm">Suspend</Button>
                </td>
              </tr>
              <tr>
                <td>#MER-102</td>
                <td>Style Boutique</td>
                <td>Sarah Williams</td>
                <td><span className="badge bg-success rounded-pill px-3">Active</span></td>
                <td>Aug 12, 2026</td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-2">Edit</Button>
                  <Button variant="outline-danger" size="sm">Suspend</Button>
                </td>
              </tr>
              <tr>
                <td>#MER-103</td>
                <td>Gadget World</td>
                <td>David Chen</td>
                <td><span className="badge bg-warning rounded-pill px-3 text-dark">Pending Review</span></td>
                <td>Aug 15, 2026</td>
                <td>
                  <Button variant="outline-success" size="sm" className="me-2">Approve</Button>
                  <Button variant="outline-danger" size="sm">Reject</Button>
                </td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}
