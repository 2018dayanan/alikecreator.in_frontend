'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CommanLayout from '@/components/CommanLayout';
import CommanBanner from '@/components/CommanBanner';
import IMAGES from '@/constant/theme';
import { Spinner, Alert, Container, Row, Col, Card } from 'react-bootstrap';

interface RentalCategory {
    _id: string;
    title: string;
    description: string;
    icon: string;
    image: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RentalCategoriesPublicPage() {
    const [categories, setCategories] = useState<RentalCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_URL}/public/rental/categories`);
                const data = await res.json();
                if (data.status) {
                    setCategories(data.data);
                } else {
                    setError(data.message || 'Failed to fetch rental categories');
                }
            } catch (err) {
                console.error(err);
                setError('A network error occurred while fetching categories.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return (
        <CommanLayout>
            <CommanBanner image={IMAGES.BackBg1.src} mainText="Rental Categories" parentText="Home" currentText="Rental Categories" />
            
            <div className="section-padding py-5 bg-light">
                <Container>
                    <div className="text-center mb-5">
                        <h2 className="fw-bold mb-3">Explore Our Rental Collection</h2>
                        <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
                            Discover a wide range of premium rental items for every occasion. Select a category below to view our available products.
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : error ? (
                        <Alert variant="danger" className="text-center">{error}</Alert>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-5">
                            <h4 className="text-muted">No rental categories found.</h4>
                        </div>
                    ) : (
                        <Row className="g-4">
                            {categories.map((category) => (
                                <Col lg={4} md={6} sm={12} key={category._id}>
                                    <Link href={`/rental/product?categoryId=${category._id}`} className="text-decoration-none">
                                        <Card className="h-100 shadow-sm border-0 rental-category-card overflow-hidden">
                                            <div className="position-relative" style={{ height: '250px', backgroundColor: '#f8f9fa' }}>
                                                {category.image ? (
                                                    <Image 
                                                        src={category.image} 
                                                        alt={category.title}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                        className="transition-transform duration-300 hover-scale"
                                                    />
                                                ) : (
                                                    <div className="d-flex align-items-center justify-content-center h-100 w-100">
                                                        <i className={`fa-solid ${category.icon || 'fa-box'} fa-4x text-muted`}></i>
                                                    </div>
                                                )}
                                                
                                                {/* Overlay Gradient */}
                                                <div 
                                                    className="position-absolute bottom-0 w-100 p-4" 
                                                    style={{ 
                                                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' 
                                                    }}
                                                >
                                                    <h4 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
                                                        {category.icon && <i className={`fa-solid ${category.icon} text-primary`}></i>}
                                                        {category.title}
                                                    </h4>
                                                    <p className="text-white-50 mb-0 small line-clamp-2">
                                                        {category.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                </Col>
                            ))}
                        </Row>
                    )}
                </Container>
            </div>
            
            <style jsx global>{`
                .rental-category-card {
                    transition: all 0.3s ease;
                    border-radius: 12px;
                }
                .rental-category-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
                }
                .hover-scale {
                    transition: transform 0.5s ease;
                }
                .rental-category-card:hover .hover-scale {
                    transform: scale(1.05);
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </CommanLayout>
    );
}
