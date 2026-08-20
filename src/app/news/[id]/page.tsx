'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CommanLayout from '@/components/CommanLayout';
import CommanBanner from '@/components/CommanBanner';
import IMAGES from '@/constant/theme';
import { ProductService } from '@/services/productService';
import { Spinner, Alert, Card, Row, Col, Badge, Button } from 'react-bootstrap';

export default function NewsDetailPage() {
    const params = useParams();
    const router = useRouter();
    const newsId = params?.id as string;

    const [news, setNews] = useState<any>(null);
    const [recentNews, setRecentNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!newsId) return;

        const loadNewsDetail = async () => {
            setLoading(true);
            setError('');
            try {
                // If it's a sample ID (fallback from homepage), load mock data
                if (newsId.startsWith('sample-')) {
                    const mockTitle = newsId === 'sample-1'
                        ? 'Trendsetter Chronicles: Unveiling the Latest in Fashion'
                        : newsId === 'sample-2'
                            ? 'Dress to Impress: Elevate Your Everyday Style'
                            : 'Chic & Unique: Personalized Fashion Finds';
                    
                    const mockImg = newsId === 'sample-1'
                        ? IMAGES.BlogPost3Pic1.src
                        : newsId === 'sample-2'
                            ? IMAGES.BlogPostPic2.src
                            : IMAGES.BlogPostPic3.src;

                    setNews({
                        _id: newsId,
                        title: mockTitle,
                        description: `Fashion is ever-evolving, and staying ahead of trends requires a keen eye for detail, quality craftsmanship, and versatile styling.\n\nIn this special feature, we explore upcoming color trends, statement accessories, and modern tailoring techniques that bring elegance to every outfit. Whether you are dressing for a casual day out or an evening celebration, investing in timeless wardrobe staples ensures effortless sophistication.\n\nDiscover how custom silhouettes and personalized styles can elevate your look while maintaining comfort and confidence.`,
                        image: mockImg,
                        date: new Date().toISOString(),
                        is_active: true
                    });
                } else {
                    const res = await ProductService.getPublicNewsById(newsId);
                    if (res.success && res.data) {
                        setNews(res.data);
                    } else {
                        setError('News article not found.');
                    }
                }

                // Load recent news for sidebar
                const listRes = await ProductService.getPublicNews(undefined, 1, 5);
                if (listRes.success && listRes.data) {
                    setRecentNews(listRes.data.filter((item: any) => item._id !== newsId));
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load news article');
            } finally {
                setLoading(false);
            }
        };

        loadNewsDetail();
    }, [newsId]);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Recent';
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? 'Recent' : d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleShare = () => {
        if (typeof window !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            alert('Article link copied to clipboard!');
        }
    };

    return (
        <CommanLayout>
            <div className="page-content bg-light">
                <CommanBanner
                    parentText="Home"
                    currentText="News & Stories"
                    mainText={news?.title || "News Article"}
                    image={IMAGES.BackBg1.src}
                />

                <section className="content-inner py-5">
                    <div className="container">
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-3 text-muted">Loading article...</p>
                            </div>
                        ) : error || !news ? (
                            <div className="text-center py-5">
                                <Alert variant="warning" className="d-inline-block px-5 py-4">
                                    <h4 className="alert-heading fw-bold">Article Unavailable</h4>
                                    <p className="mb-3">{error || 'This news article could not be found or has been removed.'}</p>
                                    <Link href="/news" className="btn btn-primary btn-sm">
                                        Back to All News
                                    </Link>
                                </Alert>
                            </div>
                        ) : (
                            <Row className="g-4">
                                {/* Main Article Body */}
                                <Col lg={8}>
                                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                                        {news.image && (
                                            <div style={{ maxHeight: '480px', overflow: 'hidden', backgroundColor: '#eee' }}>
                                                <img
                                                    src={news.image}
                                                    alt={news.title}
                                                    className="w-100 object-fit-cover"
                                                    style={{ maxHeight: '480px' }}
                                                    onError={(e: any) => { e.target.style.display = 'none'; }}
                                                />
                                            </div>
                                        )}

                                        <Card.Body className="p-4 p-md-5">
                                            {/* Meta Header */}
                                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pb-3 mb-4 border-bottom">
                                                <div className="d-flex align-items-center gap-2">
                                                    <Badge bg="primary" className="px-3 py-2 text-uppercase" style={{ fontSize: '11px' }}>
                                                        News & Update
                                                    </Badge>
                                                    <span className="text-muted small">
                                                        📅 {formatDate(news.date || news.createdAt)}
                                                    </span>
                                                </div>

                                                {news.merchantId && (
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="small text-muted">Published by:</span>
                                                        <strong className="text-dark">
                                                            {news.merchantId.business_name || news.merchantId.name}
                                                        </strong>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Headline */}
                                            <h1 className="fw-bold mb-4" style={{ fontSize: '28px', lineHeight: '1.35', color: '#151F37' }}>
                                                {news.title}
                                            </h1>

                                            {/* Content Paragraphs */}
                                            <div className="news-article-content" style={{ fontSize: '16px', lineHeight: '1.8', color: '#444' }}>
                                                {news.description.split('\n\n').map((paragraph: string, idx: number) => (
                                                    <p key={idx} className="mb-3">
                                                        {paragraph}
                                                    </p>
                                                ))}
                                            </div>

                                            {/* Social Sharing & Back Actions */}
                                            <div className="d-flex flex-wrap justify-content-between align-items-center pt-4 mt-4 border-top gap-3">
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="fw-bold small text-muted">Share:</span>
                                                    <Button variant="outline-primary" size="sm" onClick={handleShare} className="rounded-pill px-3">
                                                        🔗 Copy Link
                                                    </Button>
                                                </div>

                                                <Link href="/news" className="btn btn-outline-secondary rounded-pill px-4 btn-sm">
                                                    ← Back to All News
                                                </Link>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Sidebar */}
                                <Col lg={4}>
                                    {/* Merchant Store Box (if applicable) */}
                                    {news.merchantId && (
                                        <Card className="border-0 shadow-sm rounded-4 p-4 mb-4 text-center">
                                            <div
                                                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold shadow-sm"
                                                style={{ width: '64px', height: '64px', fontSize: '24px' }}
                                            >
                                                {(news.merchantId.business_name || news.merchantId.name || 'M').charAt(0).toUpperCase()}
                                            </div>
                                            <h5 className="fw-bold mb-1 text-dark">
                                                {news.merchantId.business_name || news.merchantId.name}
                                            </h5>
                                            {news.merchantId.subdomain && (
                                                <p className="text-muted small mb-3">
                                                    @{news.merchantId.subdomain}
                                                </p>
                                            )}
                                            <Link
                                                href={`/?subdomain=${news.merchantId.subdomain}`}
                                                className="btn btn-primary btn-sm rounded-pill w-100"
                                            >
                                                Visit Storefront
                                            </Link>
                                        </Card>
                                    )}

                                    {/* Recent News Widget */}
                                    <Card className="border-0 shadow-sm rounded-4 p-4">
                                        <h5 className="fw-bold mb-3 pb-2 border-bottom text-dark">
                                            Recent Articles
                                        </h5>

                                        {recentNews.length === 0 ? (
                                            <p className="text-muted small mb-0">No other articles available.</p>
                                        ) : (
                                            <div className="d-flex flex-column gap-3">
                                                {recentNews.map((item) => (
                                                    <div key={item._id} className="d-flex gap-3 align-items-center pb-2 border-bottom">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt={item.title}
                                                                className="rounded object-fit-cover flex-shrink-0"
                                                                style={{ width: '64px', height: '54px' }}
                                                                onError={(e: any) => { e.target.style.display = 'none'; }}
                                                            />
                                                        )}
                                                        <div className="flex-grow-1">
                                                            <h6 className="mb-1" style={{ fontSize: '14px', lineHeight: '1.3' }}>
                                                                <Link href={`/news/${item._id}`} className="text-dark text-decoration-none">
                                                                    {item.title}
                                                                </Link>
                                                            </h6>
                                                            <span className="text-muted small" style={{ fontSize: '11px' }}>
                                                                {formatDate(item.date || item.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Card>
                                </Col>
                            </Row>
                        )}
                    </div>
                </section>
            </div>
        </CommanLayout>
    );
}
