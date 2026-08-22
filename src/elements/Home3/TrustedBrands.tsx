"use client"
import React, { useEffect, useState } from "react";
import { ProductService } from "@/services/productService";

interface BrandType {
    _id: string;
    title: string;
    description: string;
    logo: string;
    bgImage: string;
}

export default function TrustedBrands() {
    const [brands, setBrands] = useState<BrandType[]>([]);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const res = await ProductService.getPublicBrands();
                const list = res.data || [];
                setBrands(list);
            } catch (err) {
                console.error("Error fetching public brands:", err);
            }
        };

        fetchBrands();
    }, []);

    if (brands.length === 0) {
        return null;
    }

    return (
        <section className="content-inner-2 pt-0">
            <div className="container">
                <div className="section-head style-1 wow fadeInUp m-b30" data-wow-delay="0.2s">
                    <div className="left-content">
                        <h2 className="title">Trusted Brands</h2>
                        <p>Explore products from our premium partners</p>
                    </div>
                </div>
                <div className="row g-4">
                    {brands.map((brand) => (
                        <div key={brand._id} className="col-6 col-sm-4 col-md-3 col-lg-2 wow fadeInUp" data-wow-delay="0.4s">
                            <div className="brand-card shadow-sm border rounded text-center position-relative overflow-hidden" 
                                style={{ 
                                    backgroundImage: `url(${brand.bgImage})`, 
                                    backgroundSize: 'cover', 
                                    backgroundPosition: 'center',
                                    height: '140px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'transform 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                title={brand.description}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    zIndex: 1
                                }} />
                                <div style={{ zIndex: 2, position: 'relative', padding: '10px' }}>
                                    <img 
                                        src={brand.logo} 
                                        alt={brand.title} 
                                        style={{ maxWidth: '100%', maxHeight: '60px', objectFit: 'contain' }}
                                    />
                                    <h6 className="mt-3 mb-0 fw-bold text-dark" style={{ fontSize: '13px' }}>{brand.title}</h6>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
