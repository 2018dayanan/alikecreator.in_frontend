'use client';
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Spinner, Alert, Modal, Form, Pagination, Badge } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/adminService';
import { toast } from 'react-toastify';
import UserWalletDetailsModal from '../_components/UserWalletDetailsModal';

export default function AdminCoinsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Add Coin Modal
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [coinFormData, setCoinFormData] = useState({
    amount: '',
    description: '',
  });

  const router = useRouter();

  const fetchUsers = async (page = 1, search = searchTerm) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const data = await adminService.getAdminUsers(page, 10, search, ''); // status is empty for all users

      if (data.success || data.status) {
        setUsers(data.data || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setCurrentPage(data.pagination.currentPage || 1);
        }
      } else {
        setError(data.message || 'Failed to fetch users');
        toast.error(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('An error occurred while fetching users.');
      toast.error('An error occurred while fetching users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, searchTerm);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchUsers(1, '');
  };

  const handleOpenCoinModal = (user: any) => {
    setSelectedUser(user);
    setCoinFormData({
      amount: '',
      description: '',
    });
    setShowCoinModal(true);
  };

  const handleOpenWalletModal = (user: any) => {
    setSelectedUser(user);
    setShowWalletModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCoinFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveCoin = async () => {
    if (!coinFormData.amount || Number(coinFormData.amount) <= 0) {
      toast.warning('Please enter a valid coin amount greater than 0.');
      return;
    }

    if (!selectedUser) return;

    try {
      const data = await adminService.addCoinToUser(
        selectedUser._id,
        Number(coinFormData.amount),
        coinFormData.description
      );

      if (data.status) {
        toast.success(data.message || `Added ${coinFormData.amount} coins successfully`);
        setShowCoinModal(false);
        // We could refetch users, but users endpoint doesn't return wallet coins directly, so no need unless we change it.
      } else {
        toast.error(data.message || 'Failed to add coins');
      }
    } catch (err) {
      toast.error('An error occurred while adding coins.');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="text-dark fw-bold mb-0">Reward Coins Management</h2>
          <small className="text-muted">Manually adjust user coin balances</small>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Main Users Table Card */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white py-3 border-bottom d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <h5 className="mb-0 fw-bold text-dark">All Users</h5>

          {/* Search & Filter Toolbar */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            <Form onSubmit={handleSearchSubmit} className="d-flex gap-2">
              <Form.Control
                size="sm"
                type="text"
                placeholder="Search name, email, mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '250px' }}
              />
              <Button type="submit" variant="secondary" size="sm">
                Search
              </Button>
            </Form>

            {searchTerm && (
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
              <p className="mt-2 text-muted small">Loading users...</p>
            </div>
          ) : (
            <>
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>User</th>
                    <th>Email Address</th>
                    <th>Mobile</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-5 text-muted">
                        No users found {searchTerm ? 'matching your search' : ''}.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
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
                        <td>
                          <Badge bg={user.status === 'active' ? 'success' : 'secondary'}>
                            {user.status || 'inactive'}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <Button 
                            variant="info" 
                            size="sm" 
                            className="text-white fw-bold me-2"
                            onClick={() => handleOpenWalletModal(user)}
                          >
                            💼 View Wallet
                          </Button>
                          <Button 
                            variant="warning" 
                            size="sm" 
                            className="text-dark fw-bold"
                            onClick={() => handleOpenCoinModal(user)}
                          >
                            🪙 Add Coin
                          </Button>
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

      {/* Add Coin Modal */}
      <Modal show={showCoinModal} onHide={() => setShowCoinModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            🪙 Add Coins to {selectedUser?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Coin Amount *</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={coinFormData.amount}
                onChange={handleFormChange}
                placeholder="Enter amount (e.g. 50)"
                min="1"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Reason / Note (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={coinFormData.description}
                onChange={handleFormChange}
                placeholder="e.g. Promotional reward, loyalty bonus"
              />
              <Form.Text className="text-muted">
                This note will be visible in the user's transaction history.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCoinModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" className="fw-bold" onClick={handleSaveCoin}>
            Add Coins
          </Button>
        </Modal.Footer>
      </Modal>

      {/* User Wallet Details Modal */}
      <UserWalletDetailsModal
        show={showWalletModal}
        onHide={() => setShowWalletModal(false)}
        userId={selectedUser?._id || null}
      />
    </div>
  );
}
