import React, { useEffect, useState } from 'react';
import { Modal, Button, Tabs, Tab, Table, Spinner, Badge, Card, Row, Col } from 'react-bootstrap';
import { adminService } from '@/services/adminService';
import { toast } from 'react-toastify';

interface UserWalletDetailsModalProps {
  show: boolean;
  onHide: () => void;
  userId: string | null;
}

export default function UserWalletDetailsModal({ show, onHide, userId }: UserWalletDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<'balance' | 'coin'>('balance');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  useEffect(() => {
    if (show && userId) {
      fetchWalletDetails(userId);
    } else {
      // Reset state on close
      setWallet(null);
      setTransactions([]);
      setActiveTab('balance');
    }
  }, [show, userId]);

  useEffect(() => {
    if (show && userId) {
      fetchTransactions(userId, activeTab);
    }
  }, [activeTab, show, userId]);

  const fetchWalletDetails = async (id: string) => {
    try {
      setLoading(true);
      const data = await adminService.getUserWallet(id);
      if (data.status) {
        setWallet(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch wallet details');
      }
    } catch (err) {
      toast.error('Error fetching wallet details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (id: string, type: string) => {
    try {
      setTxLoading(true);
      const data = await adminService.getWalletTransactions(id, type, 1, 50); // Get recent 50
      if (data.status) {
        setTransactions(data.data || []);
      } else {
        toast.error(data.message || 'Failed to fetch transactions');
      }
    } catch (err) {
      toast.error('Error fetching transactions');
    } finally {
      setTxLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="fw-bold">
          💼 Wallet & Coin Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 bg-light">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading user wallet...</p>
          </div>
        ) : !wallet ? (
          <div className="text-center py-5">
            <h5 className="text-muted">No wallet found for this user.</h5>
            <p className="small text-muted">The user may not have activated their wallet yet.</p>
          </div>
        ) : (
          <>
            {/* User Info & Balances */}
            <Row className="mb-4 g-3">
              <Col md={4}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <h6 className="text-muted text-uppercase small fw-bold mb-3">User Profile</h6>
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div
                        style={{
                          width: '50px',
                          height: '50px',
                          backgroundColor: '#e9ecef',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px'
                        }}
                      >
                        {wallet.userId?.profile_picture ? (
                          <img src={wallet.userId.profile_picture} alt="profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : '👤'}
                      </div>
                      <div>
                        <h5 className="mb-0 fw-bold">{wallet.userId?.name}</h5>
                        <small className="text-muted">{wallet.userId?.email}</small>
                      </div>
                    </div>
                    <div className="small">
                      <div className="mb-1"><strong>Mobile:</strong> {wallet.userId?.mobile || 'N/A'}</div>
                      <div><strong>Status:</strong> <Badge bg={wallet.status === 'active' ? 'success' : 'danger'}>{wallet.status}</Badge></div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm h-100" style={{ borderTop: '4px solid var(--primary)' }}>
                  <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center">
                    <h6 className="text-muted text-uppercase small fw-bold mb-2">Main Balance</h6>
                    <h2 className="text-primary fw-bold mb-0">
                      {wallet.currency} {wallet.walletBalance?.toFixed(2) || '0.00'}
                    </h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm h-100" style={{ borderTop: '4px solid #fbc02d' }}>
                  <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center">
                    <h6 className="text-muted text-uppercase small fw-bold mb-2">Reward Coins</h6>
                    <h2 className="text-warning fw-bold mb-0">
                      🪙 {wallet.walletCoin || 0}
                    </h2>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Tabs for Transactions */}
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-0">
                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab((k as any) || 'balance')}
                  className="nav-pills p-3 border-bottom"
                >
                  <Tab eventKey="balance" title="💵 Main Balance History">
                    {/* Render Balance Transactions */}
                  </Tab>
                  <Tab eventKey="coin" title="🪙 Reward Coin History">
                    {/* Render Coin Transactions */}
                  </Tab>
                </Tabs>

                <div className="p-0">
                  {txLoading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="secondary" size="sm" />
                      <span className="ms-2 text-muted small">Loading history...</span>
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted mb-0">No history found.</p>
                    </div>
                  ) : (
                    <Table responsive hover className="mb-0 border-0">
                      <thead className="bg-light text-muted small">
                        <tr>
                          <th className="ps-4">Date</th>
                          <th>Transaction ID / Ref</th>
                          <th>Description</th>
                          <th>Source</th>
                          <th>Type</th>
                          <th className="pe-4 text-end">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((tx) => (
                          <tr key={tx._id} className="align-middle">
                            <td className="ps-4 small text-muted">
                              {new Date(tx.createdAt).toLocaleString()}
                            </td>
                            <td>
                              <code className="text-dark bg-light px-2 py-1 rounded">
                                {tx._id.substring(tx._id.length - 8).toUpperCase()}
                              </code>
                            </td>
                            <td>
                              <span className="d-block text-truncate" style={{ maxWidth: '250px' }} title={tx.description}>
                                {tx.description || '—'}
                              </span>
                            </td>
                            <td>
                              <Badge bg="secondary" className="text-capitalize bg-opacity-75">
                                {tx.source || 'N/A'}
                              </Badge>
                            </td>
                            <td>
                              <Badge bg={tx.transactionType === 'credit' ? 'success' : 'danger'}>
                                {tx.transactionType === 'credit' ? '+ Credit' : '- Debit'}
                              </Badge>
                            </td>
                            <td className="pe-4 text-end fw-bold">
                              {tx.transactionType === 'credit' ? (
                                <span className="text-success">
                                  + {activeTab === 'balance' ? wallet.currency : '🪙'} {tx.amount}
                                </span>
                              ) : (
                                <span className="text-danger">
                                  - {activeTab === 'balance' ? wallet.currency : '🪙'} {tx.amount}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              </Card.Body>
            </Card>
          </>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
