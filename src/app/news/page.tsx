'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import CommanLayout from '@/components/CommanLayout';
import CommanBanner from '@/components/CommanBanner';
import IMAGES from '@/constant/theme';
import { ProductService } from '@/services/productService';
import { Spinner, Row, Col, Card, Form, Button, Pagination } from 'react-bootstrap';

export default function NewsListingPage() {
    const [newsList, setNewsList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalNews, setTotalNews] = useState(0);

    const loadNews = async () => {
        setLoading(true);
        try {
            const res = await ProductService.getPublicNews(undefined, page, 6, searchTerm);
            if (res.success && res.data) {
                setNewsList(res.data);
                setTotalPages(res.totalPages || 1);
                setTotalNews(res.total || res.data.length);
            }
        } catch (err) {
            console.error("Failed to load news listing:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNews();
    }, [page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        loadNews();
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Recent';
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? 'Recent' : d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <CommanLayout>
            <div className="page-content bg-light">
                <CommanBanner
                    parentText="Home"
                    currentText="News & Articles"
                    mainText="Latest News & Stories"
                    image={IMAGES.BackBg1.src}
                />

                <section className="content-inner py-5">
                    <div className="container">
                        {/* Search Bar */}
                        <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <div>
                                <h3 className="fw-bold mb-1 text-dark">All News Articles</h3>
                                <p className="text-muted small mb-0">Stay informed with the latest trends, announcements, and guides.</p>
                            </div>

                            <Form onSubmit={handleSearch} className="d-flex gap-2" style={{ maxWidth: '350px', width: '100%' }}>
                                <Form.Control
                                    type="text"
                                    placeholder="Search news..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="rounded-pill"
                                />
                                <Button type="submit" variant="primary" className="rounded-pill px-4">
                                    Search
                                </Button>
                            </Form>
                        </div>

                        {/* News Grid */}
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-3 text-muted">Loading news articles...</p>
                            </div>
                        ) : newsList.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <div style={{ fontSize: '48px' }}>📰</div>
                                <h5 className="fw-bold mt-3">No news articles found</h5>
                                <p className="small text-muted">Check back soon for the latest updates and stories.</p>
                            </div>
                        ) : (
                            <Row className="g-4">
                                {newsList.map((item) => (
                                    <Col key={item._id} lg={4} md={6}>
                                        <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden d-flex flex-column">
                                            {item.image ? (
                                                <div style={{ height: '220px', overflow: 'hidden', backgroundColor: '#f0f0f0' }}>
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        className="w-100 h-100 object-fit-cover"
                                                        onError={(e: any) => { e.target.src = IMAGES.BlogPost3Pic1.src; }}
                                                    />
                                                </div>
                                            ) : (
                                                <div style={{ height: '220px', backgroundColor: '#f0f0f0' }} className="d-flex align-items-center justify-content-center text-muted">
                                                    <span style={{ fontSize: '32px' }}>📰</span>
                                                </div>
                                            )}

                                            <Card.Body className="p-4 d-flex flex-column flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="small text-primary fw-bold">
                                                        📅 {formatDate(item.date || item.createdAt)}
                                                    </span>
                                                    {item.merchantId && (
                                                        <span className="badge bg-light text-dark border small">
                                                            {item.merchantId.business_name || item.merchantId.name}
                                                        </span>
                                                    )}
                                                </div>

                                                <h5 className="fw-bold mb-2">
                                                    <Link href={`/news/${item._id}`} className="text-dark text-decoration-none">
                                                        {item.title}
                                                    </Link>
                                                </h5>

                                                <p className="text-muted small mb-4 flex-grow-1 text-truncate-3" style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {item.description}
                                                </p>

                                                <Link href={`/news/${item._id}`} className="btn btn-outline-primary btn-sm rounded-pill mt-auto fw-semibold">
                                                    Read Full Article →
                                                </Link>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        )}

                        {/* Pagination */}
                        {!loading && totalPages > 1 && (
                            <div className="d-flex justify-content-center mt-5">
                                <Pagination>
                                    <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)} />
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <Pagination.Item key={p} active={p === page} onClick={() => setPage(p)}>
                                            {p}
                                        </Pagination.Item>
                                    ))}
                                    <Pagination.Next disabled={page === totalPages} onClick={() => setPage(page + 1)} />
                                </Pagination>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </CommanLayout>
    );
}
