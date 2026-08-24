'use client';
import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import CommanLayout from '@/components/CommanLayout';
import CommanBanner from '@/components/CommanBanner';
import { Spinner, Alert, Container, Row, Col, Card, Form, Button, Pagination, Badge } from 'react-bootstrap';

interface RentalProduct {
    _id: string;
    title: string;
    description: string;
    image: string;
    rentalPrice: number;
    rentalDuration: string;
    securityDeposit: number;
    rewardCoins: number;
    categoryId: {
        _id: string;
        title: string;
        icon?: string;
    };
}

interface Category {
    _id: string;
    title: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function RentalProductsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Initial category ID from URL if provided (from Category Page)
    const initialCategoryId = searchParams.get('categoryId') || '';

    const [products, setProducts] = useState<RentalProduct[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters and Pagination
    const [page, setPage] = useState(1);
    const [limit] = useState(12);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [filterCategoryId, setFilterCategoryId] = useState(initialCategoryId);

    // Fetch categories for the filter dropdown
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_URL}/public/rental/categories`);
                const data = await res.json();
                if (data.status) {
                    setCategories(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchCategories();
    }, []);

    // Fetch products based on filters and pagination
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search,
                categoryId: filterCategoryId
            });

            const res = await fetch(`${API_URL}/public/rental/products?${queryParams.toString()}`);
            const data = await res.json();
            
            if (data.status) {
                setProducts(data.data);
                if (data.pagination) {
                    setTotalPages(data.pagination.totalPages);
                }
            } else {
                setError(data.message || 'Failed to fetch rental products');
            }
        } catch (err) {
            console.error(err);
            setError('A network error occurred while fetching products.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [page, filterCategoryId]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to first page on new search
        fetchProducts();
    };

    return (
        <>
            <div className="section-padding py-5 bg-light">
                <Container>
                    {/* Filters Section */}
                    <Card className="shadow-sm border-0 mb-5 rounded-4 overflow-hidden">
                        <Card.Body className="p-4">
                            <Form onSubmit={handleSearchSubmit} className="row g-3 align-items-end">
                                <Col md={5}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold text-muted small text-uppercase">Search</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Search rental products..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="border-0 bg-light py-2 px-3"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold text-muted small text-uppercase">Category</Form.Label>
                                        <Form.Select
                                            value={filterCategoryId}
                                            onChange={(e) => {
                                                setFilterCategoryId(e.target.value);
                                                setPage(1);
                                            }}
                                            className="border-0 bg-light py-2 px-3"
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.title}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <div className="d-flex gap-2">
                                        <Button variant="dark" type="submit" className="w-100 py-2">
                                            <i className="fa-solid fa-magnifying-glass me-2"></i> Search
                                        </Button>
                                        {(search || filterCategoryId) && (
                                            <Button 
                                                variant="outline-secondary" 
                                                className="py-2 px-3"
                                                onClick={() => {
                                                    setSearch('');
                                                    setFilterCategoryId('');
                                                    setPage(1);
                                                    if (initialCategoryId) {
                                                        router.replace('/rental/product'); // clear URL param
                                                    }
                                                }}
                                                title="Clear Filters"
                                            >
                                                <i className="fa-solid fa-xmark"></i>
                                            </Button>
                                        )}
                                    </div>
                                </Col>
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="text-center py-5 my-5">
                            <Spinner animation="border" variant="dark" style={{ width: '3rem', height: '3rem' }} />
                        </div>
                    ) : error ? (
                        <Alert variant="danger" className="text-center rounded-4">{error}</Alert>
                    ) : products.length === 0 ? (
                        <div className="text-center py-5 my-5 bg-white rounded-4 shadow-sm">
                            <i className="fa-solid fa-box-open fa-3x text-muted mb-3"></i>
                            <h4 className="text-muted fw-bold">No rental products found.</h4>
                            <p className="text-muted">Try adjusting your search or category filters.</p>
                        </div>
                    ) : (
                        <>
                            <Row className="g-4">
                                {products.map((product) => (
                                    <Col lg={3} md={4} sm={6} xs={12} key={product._id}>
                                        <Card className="h-100 shadow-sm border-0 product-card rounded-4 overflow-hidden">
                                            {/* Image Section */}
                                            <div className="position-relative bg-light" style={{ height: '240px' }}>
                                                {product.image ? (
                                                    <Image 
                                                        src={product.image} 
                                                        alt={product.title}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                        className="product-img transition-transform"
                                                    />
                                                ) : (
                                                    <div className="d-flex align-items-center justify-content-center h-100">
                                                        <i className="fa-solid fa-image fa-3x text-muted"></i>
                                                    </div>
                                                )}
                                                
                                                {/* Category Badge */}
                                                {product.categoryId && (
                                                    <Badge 
                                                        bg="light" 
                                                        text="dark" 
                                                        className="position-absolute top-0 start-0 m-3 shadow-sm rounded-pill px-3 py-2 fw-semibold border"
                                                    >
                                                        {product.categoryId.title}
                                                    </Badge>
                                                )}

                                                {/* Reward Badge */}
                                                {product.rewardCoins > 0 && (
                                                    <div className="position-absolute top-0 end-0 m-3 shadow-sm rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center fw-bold border border-white" style={{ width: '45px', height: '45px', lineHeight: '1', fontSize: '14px', flexDirection: 'column' }}>
                                                        <i className="fa-solid fa-coins mb-1" style={{ fontSize: '12px' }}></i>
                                                        +{product.rewardCoins}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Content Section */}
                                            <Card.Body className="d-flex flex-column p-4">
                                                <h5 className="fw-bold mb-2 line-clamp-2">{product.title}</h5>
                                                
                                                <div className="mt-auto pt-3 border-top">
                                                    <div className="d-flex justify-content-between align-items-end mb-3">
                                                        <div>
                                                            <span className="text-muted small d-block mb-1">Rental Price</span>
                                                            <span className="fw-bold fs-5 text-primary">₹{product.rentalPrice}</span>
                                                            <span className="text-muted small"> / {product.rentalDuration}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="d-flex justify-content-between align-items-center bg-light rounded px-3 py-2 mb-3">
                                                        <span className="text-muted small">Security Deposit:</span>
                                                        <span className="fw-semibold small">₹{product.securityDeposit}</span>
                                                    </div>

                                                    <Button variant="dark" className="w-100 rounded-pill fw-semibold py-2">
                                                        <i className="fa-regular fa-calendar-check me-2"></i> Rent Now
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>

                            {/* Pagination */}
                            {totalPages >= 1 && (
                                <div className="d-flex justify-content-center mt-5 pt-3">
                                    <Pagination>
                                        <Pagination.Prev 
                                            disabled={page === 1} 
                                            onClick={() => setPage(page - 1)} 
                                        />
                                        {[...Array(totalPages)].map((_, idx) => (
                                            <Pagination.Item 
                                                key={idx + 1} 
                                                active={page === idx + 1}
                                                onClick={() => setPage(idx + 1)}
                                            >
                                                {idx + 1}
                                            </Pagination.Item>
                                        ))}
                                        <Pagination.Next 
                                            disabled={page === totalPages} 
                                            onClick={() => setPage(page + 1)} 
                                        />
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </Container>
            </div>
            
            <style jsx global>{`
                .product-card {
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .product-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
                }
                .product-img {
                    transition: transform 0.5s ease;
                }
                .product-card:hover .product-img {
                    transform: scale(1.08);
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    height: 2.5em; /* Fallback */
                }
            `}</style>
        </>
    );
}

export default function RentalProductsPublicPage() {
    return (
        <CommanLayout>
            <CommanBanner title="Rental Collection" />
            
            {/* Suspense is required because we are using useSearchParams() */}
            <Suspense fallback={
                <div className="text-center py-5 my-5">
                    <Spinner animation="border" variant="dark" />
                </div>
            }>
                <RentalProductsContent />
            </Suspense>
        </CommanLayout>
    );
}
