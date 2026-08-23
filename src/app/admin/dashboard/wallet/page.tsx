'use client';
import React, { useEffect, useState } from 'react';
import { Card, Table, Badge, Button, Spinner, Modal, Form } from 'react-bootstrap';
import { adminService } from '@/services/adminService';
import toast from 'react-hot-toast';

export default function AdminWalletRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await adminService.getRechargeRequests();
      if (res.status) {
        setRequests(res.data);
      } else {
        toast.error(res.message || 'Failed to load requests');
      }
    } catch (error) {
      toast.error('An error occurred while fetching requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = (id: string) => {
    toast((t) => (
      <div>
        <p className="mb-3 fw-bold">Approve Request?</p>
        <p className="mb-3 text-muted small">Are you sure you want to approve this recharge request? The amount will be credited to the user's wallet.</p>
        <div className="d-flex justify-content-end gap-2">
          <Button variant="light" size="sm" onClick={() => toast.dismiss(t.id)}>
            Cancel
          </Button>
          <Button variant="success" size="sm" onClick={() => {
            toast.dismiss(t.id);
            executeApprove(id);
          }}>
            Approve
          </Button>
        </div>
      </div>
    ), { duration: 8000, position: 'top-center' });
  };

  const executeApprove = async (id: string) => {

    try {
      const res = await adminService.updateRechargeStatus(id, 'approved', '');
      if (res.status) {
        toast.success('Recharge request approved successfully');
        fetchRequests();
      } else {
        toast.error(res.message || 'Failed to approve request');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleRejectClick = (id: string) => {
    setSelectedRequestId(id);
    setAdminRemarks('');
    setShowRejectModal(true);
  };

  const handleViewDetails = (req: any) => {
    setSelectedRequest(req);
    setShowViewModal(true);
  };

  const submitReject = async () => {
    if (!selectedRequestId) return;
    if (!adminRemarks.trim()) {
      toast.error('Please enter a reason for rejection');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await adminService.updateRechargeStatus(selectedRequestId, 'rejected', adminRemarks);
      if (res.status) {
        toast.success('Recharge request rejected successfully');
        setShowRejectModal(false);
        fetchRequests();
      } else {
        toast.error(res.message || 'Failed to reject request');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Wallet Recharge Requests</h2>
        <Button variant="outline-primary" onClick={fetchRequests}>Refresh</Button>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Transaction ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      No recharge requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req._id}>
                      <td className="px-4 py-3">
                        {new Date(req.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {req.userId?.name} <br />
                        <small className="text-muted">{req.userId?.email}</small>
                      </td>
                      <td className="px-4 py-3 fw-bold text-success">
                        ₹{req.amount}
                      </td>
                      <td className="px-4 py-3">
                        {req.transactionId}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          bg={
                            req.status === 'approved' ? 'success' :
                              req.status === 'rejected' ? 'danger' :
                                'warning'
                          }
                          text={req.status === 'pending' ? 'dark' : 'white'}
                        >
                          {req.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <div className="d-flex justify-content-end gap-2 align-items-center">
                          <Button
                            variant="info"
                            size="sm"
                            className="text-white"
                            onClick={() => handleViewDetails(req)}
                          >
                            View
                          </Button>
                          {req.status === 'pending' ? (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleApprove(req._id)}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleRejectClick(req._id)}
                              >
                                Reject
                              </Button>
                            </>
                          ) : (
                            <div className="text-muted small d-flex flex-column align-items-end ms-2">
                              <span>Reviewed by {req.reviewedBy?.name || 'Admin'}</span>
                              {req.status === 'rejected' && req.adminRemarks && (
                                <span className="text-danger mt-1">
                                  Reason: {req.adminRemarks}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => !isSubmitting && setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Recharge Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Reason for Rejection <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
              placeholder="E.g., Transaction ID not found, Invalid screenshot..."
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={submitReject} disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="sm" animation="border" /> : 'Confirm Rejection'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Details Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Recharge Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div className="row">
              <div className="col-md-6">
                <h6 className="fw-bold mb-3">User Details</h6>
                <p className="mb-1"><strong>Name:</strong> {selectedRequest.userId?.name}</p>
                <p className="mb-1"><strong>Email:</strong> {selectedRequest.userId?.email}</p>
                <p className="mb-3"><strong>Mobile:</strong> {selectedRequest.userId?.mobile}</p>

                <h6 className="fw-bold mb-3 mt-4">Transaction Details</h6>
                <p className="mb-1"><strong>Amount:</strong> ₹{selectedRequest.amount}</p>
                <p className="mb-1"><strong>Transaction ID:</strong> {selectedRequest.transactionId}</p>
                <p className="mb-1">
                  <strong>Status:</strong>{' '}
                  <Badge
                    bg={
                      selectedRequest.status === 'approved' ? 'success' :
                        selectedRequest.status === 'rejected' ? 'danger' :
                          'warning'
                    }
                    text={selectedRequest.status === 'pending' ? 'dark' : 'white'}
                  >
                    {selectedRequest.status.toUpperCase()}
                  </Badge>
                </p>
                <p className="mb-1"><strong>Submitted On:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}</p>

                {selectedRequest.userNote && (
                  <p className="mb-1 mt-2"><strong>User Note:</strong> <br /> {selectedRequest.userNote}</p>
                )}

                {selectedRequest.status !== 'pending' && (
                  <>
                    <hr />
                    <p className="mb-1"><strong>Reviewed By:</strong> {selectedRequest.reviewedBy?.name || 'Admin'}</p>
                    <p className="mb-1"><strong>Reviewed At:</strong> {new Date(selectedRequest.reviewedAt).toLocaleString()}</p>
                    {selectedRequest.status === 'rejected' && selectedRequest.adminRemarks && (
                      <p className="mb-1 text-danger"><strong>Rejection Reason:</strong> {selectedRequest.adminRemarks}</p>
                    )}
                  </>
                )}
              </div>
              <div className="col-md-6">
                <h6 className="fw-bold mb-3">Transaction Screenshot</h6>
                {selectedRequest.transactionPhoto ? (
                  <a href={selectedRequest.transactionPhoto} target="_blank" rel="noreferrer">
                    <img
                      src={selectedRequest.transactionPhoto}
                      alt="Transaction Screenshot"
                      className="img-fluid rounded border shadow-sm"
                      style={{ maxHeight: '400px', width: '100%', objectFit: 'contain' }}
                    />
                  </a>
                ) : (
                  <div className="p-4 text-center bg-light rounded text-muted">
                    No screenshot provided
                  </div>
                )}
                <p className="text-muted small text-center mt-2">Click image to open in new tab</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          {selectedRequest?.status === 'pending' && (
            <>
              <Button variant="danger" onClick={() => {
                setShowViewModal(false);
                handleRejectClick(selectedRequest._id);
              }}>
                Reject
              </Button>
              <Button variant="success" onClick={() => {
                setShowViewModal(false);
                handleApprove(selectedRequest._id);
              }}>
                Approve
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
