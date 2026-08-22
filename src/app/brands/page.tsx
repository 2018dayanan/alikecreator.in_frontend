'use client';
import React, { useEffect, useState } from 'react';
import CommanLayout from '@/components/CommanLayout';
import CommanBanner from '@/components/CommanBanner';
import IMAGES from '@/constant/theme';
import { ProductService, getActiveSubdomain } from '@/services/productService';
import { Spinner, Alert, Row, Col } from 'react-bootstrap';

interface BrandType {
    _id: string;
    title: string;
    description: string;
    logo: string;
    bgImage: string;
}

export default function AllBrandsPage() {
    const [brands, setBrands] = useState<BrandType[]>([]);
    const [merchant, setMerchant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const loadInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                const subdomain = getActiveSubdomain();

                if (subdomain) {
                    try {
                        const mRes = await ProductService.getMerchantBySubdomain(subdomain);
                        if (isMounted && mRes && (mRes.success || mRes.status)) {
                            setMerchant(mRes.data || mRes.merchant);
                        }
                    } catch (e) {
                        console.warn("Subdomain merchant info not found", e);
                    }
                }

                const res = await ProductService.getPublicBrands();
                if (isMounted) {
                    setBrands(res.data || []);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err.message || 'Failed to load brands');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadInitialData();
        return () => { isMounted = false; };
    }, []);

    return (
        <CommanLayout>
            <div className="page-content bg-light">
                {/* Banner */}
                <CommanBanner
                    parentText="Home"
                    currentText="Trusted Brands"
                    mainText={merchant ? `${merchant.business_name || merchant.name}'s Trusted Brands` : "Discover Our Premium Partners"}
                    image={IMAGES.BackBg1?.src || ''}
                />

                <section className="content-inner py-5">
                    <div className="container">
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-3 text-muted">Loading brands...</p>
                            </div>
                        ) : error ? (
                            <Alert variant="danger" className="text-center py-4">
                                <h5>Unable to load brands</h5>
                                <p className="mb-0">{error}</p>
                            </Alert>
                        ) : brands.length === 0 ? (
                            <div className="text-center py-5 bg-white rounded-4 shadow-sm border p-5">
                                <div style={{ fontSize: '56px' }}>🏢</div>
                                <h4 className="fw-bold mt-3 text-dark">No brands found</h4>
                                <p className="text-muted small mb-4">
                                    We currently don't have any premium partners listed. Check back later!
                                </p>
                            </div>
                        ) : (
                            <Row className="g-4">
                                {brands.map((brand) => (
                                    <Col key={brand._id} lg={3} md={4} sm={6}>
                                        <div className="company-box style-1 h-100 d-flex flex-column bg-white shadow-sm border rounded-4 overflow-hidden">
                                            <div className="dz-media position-relative" style={{ height: '220px', width: '100%', overflow: 'hidden' }}>
                                                <img 
                                                    src={brand.bgImage} 
                                                    alt={brand.title} 
                                                    className="company-img w-100 h-100 transition-all" 
                                                    style={{ objectFit: 'cover' }} 
                                                />
                                                <div className="position-absolute top-50 start-50 translate-middle bg-white rounded-circle shadow border d-flex align-items-center justify-content-center" style={{ width: '90px', height: '90px', padding: '15px' }}>
                                                    <img 
                                                        src={brand.logo} 
                                                        alt={`${brand.title} logo`} 
                                                        className="logo w-100 h-100" 
                                                        style={{ objectFit: 'contain', position: 'static', transform: 'none' }} 
                                                    />
                                                </div>
                                            </div>
                                            <div className="dz-content flex-grow-1 d-flex flex-column justify-content-center p-4 text-center">
                                                <h5 className="title fw-bold mb-2 text-dark">{brand.title}</h5>
                                                <span className="text-muted small" style={{ display: 'block', maxWidth: '100%' }}>{brand.description}</span>
                                            </div>		
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </div>
                </section>
            </div>
        </CommanLayout>
    );
}
