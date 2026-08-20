"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link";
import IMAGES from "../../constant/theme";
import { ProductService } from "@/services/productService";

interface Product {
    _id?: string;
    title: string;
    description?: string;
    image?: string;
    images?: string[];
    price?: number;
    discount?: number | null;
    externalLink?: string;
    categoryId?: {
        _id?: string;
        name?: string;
    } | string;
}

const SummerSaleBlog = () => {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchRandomProducts = async () => {
            try {
                const res = await ProductService.getRandomProducts(4);
                const list: Product[] = res.data || [];
                if (Array.isArray(list) && list.length > 0) {
                    setProducts(list);
                }
            } catch (err) {
                console.error("Error fetching random products for banner section:", err);
            }
        };

        fetchRandomProducts();
    }, []);

    // Product 1 (Left Card)
    const p1 = products[0];
    const p1Img = p1?.image || (Array.isArray(p1?.images) && p1.images[0]) || IMAGES.ShopLargbnr1.src;
    const p1Title = p1?.title || "Summer 2026 Collection";
    const p1Category = typeof p1?.categoryId === 'object' ? p1.categoryId?.name : null;
    const p1Badge = p1Category ? `${p1Category}` : (p1?.discount ? `Up to ${p1.discount}% Off` : "Special Deal");
    const p1Link = p1?.externalLink || "/shop-list";

    // Product 2 (Right Card)
    const p2 = products[1] || products[0];
    const p2Img = p2?.image || (Array.isArray(p2?.images) && p2.images[0]) || IMAGES.ShopLargbnr2.src;
    const p2Title = p2?.title || "New Trending Arrivals";
    const p2Category = typeof p2?.categoryId === 'object' ? p2.categoryId?.name : null;
    const p2Badge = p2Category ? `${p2Category}` : "Featured Pick";
    const p2Link = p2?.externalLink || "/shop-list";

    return (
        <div className="row product-style2 g-0 summer-sale-promo-section">
            {/* Scoped CSS to remove the awkward circular background and ensure clean responsive layout */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    .summer-sale-promo-section .product-box.style-4 .sale-box:after {
                        display: none !important;
                    }
                    .summer-sale-promo-section .promo-glass-box {
                        background: rgba(255, 255, 255, 0.9) !important;
                        backdrop-filter: blur(8px);
                        -webkit-backdrop-filter: blur(8px);
                        border-radius: 16px;
                        padding: 28px 32px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.08);
                        max-width: 440px;
                        transition: all 0.3s ease;
                    }
                    .summer-sale-promo-section .promo-glass-box:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 15px 35px rgba(0,0,0,0.12);
                    }
                    .summer-sale-promo-section .promo-badge {
                        display: inline-block;
                        font-size: 12px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        padding: 5px 14px;
                        border-radius: 30px;
                    }
                `
            }} />

            {/* Left Card: Random Product #1 */}
            <div className="col-lg-6 col-md-12">
                <div className="product-box style-4 position-relative overflow-hidden">
                    <div
                        className="product-media"
                        style={{
                            backgroundImage: `url(${p1Img})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            minHeight: '420px'
                        }}
                    ></div>
                    <div className="product-content p-4 p-md-5 d-flex align-items-center">
                        <div className="promo-glass-box">
                            <span className="promo-badge bg-dark text-white mb-2">
                                {p1Badge}
                            </span>
                            <h2 className="text-dark fw-bold mb-2" style={{ fontSize: '24px', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {p1Title}
                            </h2>
                            {p1?.price !== undefined && (
                                <div className="mb-3">
                                    <span className="fs-5 fw-bold text-primary">₹{p1.price}</span>
                                </div>
                            )}
                            <Link href={p1Link} className="btn btn-outline-secondary btn-md text-uppercase fw-semibold px-4 py-2">
                                Shop Now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Card: Random Product #2 */}
            <div className="col-lg-6 col-md-12">
                <div className="product-box style-4 position-relative overflow-hidden">
                    <div
                        className="product-media"
                        style={{
                            backgroundImage: `url(${p2Img})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            minHeight: '420px'
                        }}
                    ></div>
                    <div className="product-content p-4 p-md-5 d-flex align-items-center">
                        <div className="promo-glass-box">
                            <span className="promo-badge bg-primary text-white mb-2">
                                {p2Badge}
                            </span>
                            <h2 className="text-dark fw-bold mb-2" style={{ fontSize: '24px', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {p2Title}
                            </h2>
                            {p2?.price !== undefined && (
                                <div className="mb-3">
                                    <span className="fs-5 fw-bold text-primary">₹{p2.price}</span>
                                </div>
                            )}
                            <Link href={p2Link} className="btn btn-secondary btn-md text-uppercase fw-semibold px-4 py-2">
                                Shop Now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummerSaleBlog;