'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import CommanLayout from '@/components/CommanLayout';
import CommanBanner from '@/components/CommanBanner';
import IMAGES from '@/constant/theme';
import { Spinner, Alert, Container, Row, Col, Card, Form, Button } from 'react-bootstrap';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface RentalProduct {
    _id: string;
    title: string;
    description: string;
    image: string;
    rentalPrice: number;
    rentalDuration: string;
    securityDeposit: number;
    rewardCoins: number;
}

export default function RentalCheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.productId as string;

    const [isAuthorized, setIsAuthorized] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    const [product, setProduct] = useState<RentalProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [rentalStartDate, setRentalStartDate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [shippingAddress, setShippingAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: ''
    });
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // 1. Auth check
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            router.push('/login');
        } else {
            setToken(storedToken);
            setIsAuthorized(true);
        }
    }, [router]);

    // 2. Fetch product details
    useEffect(() => {
        if (!isAuthorized) return;

        const fetchProduct = async () => {
            try {
                const res = await fetch(`${API_URL}/public/rental/products/${productId}`);
                const data = await res.json();
                if (data.status && data.data) {
                    setProduct(data.data);
                } else {
                    setError(data.message || 'Product not found');
                }
            } catch (err) {
                setError('Network error while fetching product');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [isAuthorized, productId]);

    // Handle form submit
    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!rentalStartDate) {
            alert("Please select a rental start date");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/user/rental/order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId,
                    rentalStartDate,
                    paymentMethod,
                    shippingAddress,
                    notes
                })
            });

            const data = await res.json();

            if (data.status) {
                setSuccessMessage("Your rental order has been placed successfully!");
                // Clear form
                setRentalStartDate('');
                setNotes('');
                // Redirect to dashboard after 3 seconds
                setTimeout(() => {
                    router.push('/account-rental-orders');
                }, 3000);
            } else {
                setError(data.message || "Failed to place order");
            }
        } catch (err) {
            setError("A network error occurred. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isAuthorized) {
        return null; // Will redirect to login
    }

    if (loading) {
        return (
            <CommanLayout>
                <CommanBanner image={IMAGES.BackBg1.src} mainText="Checkout" parentText="Home" currentText="Checkout" />
                <div className="text-center py-5 my-5">
                    <Spinner animation="border" variant="dark" />
                </div>
            </CommanLayout>
        );
    }

    if (error && !product) {
        return (
            <CommanLayout>
                <CommanBanner image={IMAGES.BackBg1.src} mainText="Checkout" parentText="Home" currentText="Checkout" />
                <Container className="py-5">
                    <Alert variant="danger" className="text-center">{error}</Alert>
                    <div className="text-center">
                        <Link href="/rental/product">
                            <Button variant="dark">Back to Rentals</Button>
                        </Link>
                    </div>
                </Container>
            </CommanLayout>
        );
    }

    const totalAmount = product ? product.rentalPrice + product.securityDeposit : 0;

    // Calculate min date (today)
    const today = new Date().toISOString().split('T')[0];

    return (
        <CommanLayout>
            <CommanBanner image={IMAGES.BackBg1.src} mainText="Rental Checkout" parentText="Home" currentText="Rental Checkout" />

            <div className="section-padding py-5 bg-light">
                <Container>
                    {successMessage ? (
                        <Card className="border-0 shadow-sm rounded-4 text-center py-5">
                            <Card.Body>
                                <i className="fa-solid fa-circle-check text-success fa-4x mb-3"></i>
                                <h2 className="fw-bold mb-3">Order Confirmed!</h2>
                                <p className="text-muted mb-4">{successMessage}</p>
                                <Spinner animation="border" size="sm" className="me-2" /> Redirecting to your dashboard...
                            </Card.Body>
                        </Card>
                    ) : (
                        <Form onSubmit={handlePlaceOrder}>
                            <Row className="g-4">
                                {/* Left Column: Shipping & Details */}
                                <Col lg={8}>
                                    {error && <Alert variant="danger">{error}</Alert>}

                                    <Card className="border-0 shadow-sm rounded-4 mb-4">
                                        <Card.Header className="bg-white border-bottom p-4">
                                            <h4 className="fw-bold m-0"><i className="fa-regular fa-calendar me-2"></i> Rental Details</h4>
                                        </Card.Header>
                                        <Card.Body className="p-4">
                                            <Form.Group className="mb-0">
                                                <Form.Label className="fw-semibold">When do you want to start renting this item?</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    min={today}
                                                    value={rentalStartDate}
                                                    onChange={(e) => setRentalStartDate(e.target.value)}
                                                    required
                                                    className="py-2"
                                                />
                                                <Form.Text className="text-muted">
                                                    Duration is fixed at <strong>{product?.rentalDuration}</strong>.
                                                    Your return date will be calculated automatically from this start date.
                                                </Form.Text>
                                            </Form.Group>
                                        </Card.Body>
                                    </Card>

                                    <Card className="border-0 shadow-sm rounded-4 mb-4">
                                        <Card.Header className="bg-white border-bottom p-4">
                                            <h4 className="fw-bold m-0"><i className="fa-solid fa-truck-fast me-2"></i> Shipping Address</h4>
                                        </Card.Header>
                                        <Card.Body className="p-4">
                                            <Row className="g-3">
                                                <Col md={12}>
                                                    <Form.Group>
                                                        <Form.Label className="fw-semibold">Street Address</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            required
                                                            value={shippingAddress.street}
                                                            onChange={e => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="fw-semibold">City</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            required
                                                            value={shippingAddress.city}
                                                            onChange={e => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="fw-semibold">State</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            required
                                                            value={shippingAddress.state}
                                                            onChange={e => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="fw-semibold">Zip / Postal Code</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            required
                                                            value={shippingAddress.zipCode}
                                                            onChange={e => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="fw-semibold">Country</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            required
                                                            value={shippingAddress.country}
                                                            onChange={e => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={12}>
                                                    <Form.Group>
                                                        <Form.Label className="fw-semibold">Phone Number</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            required
                                                            value={shippingAddress.phone}
                                                            onChange={e => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>

                                    <Card className="border-0 shadow-sm rounded-4">
                                        <Card.Header className="bg-white border-bottom p-4">
                                            <h4 className="fw-bold m-0"><i className="fa-regular fa-credit-card me-2"></i> Payment Method</h4>
                                        </Card.Header>
                                        <Card.Body className="p-4">
                                            <Form.Select
                                                value={paymentMethod}
                                                onChange={e => setPaymentMethod(e.target.value)}
                                                className="py-2"
                                            >
                                                <option value="COD">Cash on Delivery (COD)</option>
                                                <option value="Card">Credit/Debit Card (Coming Soon)</option>
                                                <option value="UPI">UPI (Coming Soon)</option>
                                                <option value="Wallet">Wallet Balance</option>
                                            </Form.Select>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Right Column: Order Summary */}
                                <Col lg={4}>
                                    <Card className="border-0 shadow-sm rounded-4 position-sticky top-0 mt-0" style={{ zIndex: 1 }}>
                                        <Card.Header className="bg-dark text-white border-bottom p-4 rounded-top-4">
                                            <h4 className="fw-bold m-0 text-white">Order Summary</h4>
                                        </Card.Header>
                                        <Card.Body className="p-4">
                                            {/* Product Preview */}
                                            <div className="d-flex gap-3 mb-4 pb-4 border-bottom">
                                                <div style={{ width: '80px', height: '80px' }} className="bg-light rounded overflow-hidden position-relative flex-shrink-0">
                                                    {product?.image ? (
                                                        <Image src={product.image} alt={product.title} fill style={{ objectFit: 'cover' }} />
                                                    ) : (
                                                        <div className="d-flex h-100 align-items-center justify-content-center text-muted"><i className="fa-solid fa-image"></i></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h6 className="fw-bold mb-1">{product?.title}</h6>
                                                    <span className="badge bg-secondary mb-2">{product?.rentalDuration}</span>
                                                </div>
                                            </div>

                                            {/* Price Breakdown */}
                                            <div className="d-flex justify-content-between mb-3">
                                                <span className="text-muted">Rental Price</span>
                                                <span className="fw-semibold">₹{product?.rentalPrice}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-3">
                                                <span className="text-muted">Security Deposit <i className="fa-solid fa-circle-info text-primary ms-1" title="Refundable upon safe return"></i></span>
                                                <span className="fw-semibold">₹{product?.securityDeposit}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-4 pb-4 border-bottom">
                                                <span className="text-muted">Shipping</span>
                                                <span className="text-success fw-semibold">Free</span>
                                            </div>

                                            {/* Total */}
                                            <div className="d-flex justify-content-between align-items-center mb-4">
                                                <span className="fw-bold fs-5">Total To Pay</span>
                                                <span className="fw-bold fs-4 text-primary">₹{totalAmount}</span>
                                            </div>

                                            {/* Rewards */}
                                            {product && product.rewardCoins > 0 && (
                                                <Alert variant="warning" className="border-0 mb-4 py-2 d-flex align-items-center justify-content-center">
                                                    <i className="fa-solid fa-coins me-2 text-dark"></i>
                                                    <span className="small text-dark fw-semibold">You will earn {product.rewardCoins} reward coins!</span>
                                                </Alert>
                                            )}

                                            <Button
                                                variant="dark"
                                                type="submit"
                                                className="w-100 rounded-pill py-3 fw-bold fs-5"
                                                disabled={submitting}
                                            >
                                                {submitting ? (
                                                    <><Spinner animation="border" size="sm" className="me-2" /> Processing...</>
                                                ) : (
                                                    `Place Order (₹${totalAmount})`
                                                )}
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Form>
                    )}
                </Container>
            </div>
        </CommanLayout>
    );
}
