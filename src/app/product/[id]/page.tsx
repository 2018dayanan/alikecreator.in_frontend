'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CommanLayout from '@/components/CommanLayout';
import CommanBanner from '@/components/CommanBanner';
import IMAGES from '@/constant/theme';
import { ProductService, getActiveSubdomain } from '@/services/productService';
import { useWishlist } from '@/context/WishlistContext';
import { Spinner, Alert, Row, Col, Badge, Button } from 'react-bootstrap';

interface ProductItem {
    id: string | number;
    _id?: string;
    name: string;
    title?: string;
    price: number | string;
    originalPrice?: number | string;
    discount?: number | string | null;
    image: string;
    images?: string[];
    category?: string;
    categoryId?: any;
    description?: string;
    rating?: number;
    reviewCount?: number;
    sku?: string;
    video?: string | null;
    purchaseType?: string;
    rewardCoins?: number | null;
}

const DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1";

const getSafeProductImage = (p: any): string => {
    if (typeof p?.image === 'string' && p.image.trim()) return p.image.trim();
    if (Array.isArray(p?.images) && p.images.length > 0 && typeof p.images[0] === 'string' && p.images[0].trim()) return p.images[0].trim();
    if (typeof p?.images === 'string' && p.images.trim()) return p.images.trim();
    return DEFAULT_PRODUCT_IMAGE;
};

export default function ProductDetailPage() {
    const params = useParams();
    const id = params.id as string;
    
    const { toggleFavorite, isFavorite } = useWishlist();
    const [product, setProduct] = useState<ProductItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAdded, setIsAdded] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const loadProduct = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const subdomain = getActiveSubdomain();
                const res = await ProductService.getPublicProductById(id, subdomain);
                
                if (isMounted && res.success && res.data) {
                    const p = res.data;
                    const numPrice = typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0;
                    const origPrice = p.originalPrice || p.oldPrice || (p.discount ? Math.round(numPrice / (1 - (p.discount / 100))) : (numPrice > 0 ? Math.round(numPrice * 1.25) : 0));
                    const catName = typeof p.categoryId === 'object' && p.categoryId ? p.categoryId.name : (p.category || 'General');

                    setProduct({
                        id: p._id || p.id,
                        name: p.title || p.name || 'Untitled Product',
                        price: numPrice,
                        originalPrice: origPrice,
                        discount: p.discount || (origPrice > numPrice ? Math.round(((origPrice - numPrice) / origPrice) * 100) : null),
                        image: getSafeProductImage(p),
                        category: catName,
                        description: p.description || 'Premium quality crafted with meticulous attention to detail and timeless elegance.',
                        rating: p.rating || 5.0,
                        reviewCount: p.reviewCount || 12,
                        sku: p.sku || `SKU-${(p._id || '').slice(-6).toUpperCase() || 'ECOM'}`,
                        externalLink: p.externalLink || null,
                        video: p.video || null,
                        purchaseType: p.purchaseType || 'internal',
                        rewardCoins: p.rewardCoins || null
                    });
                } else if (isMounted) {
                    setError('Product not found');
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err.message || 'Failed to load product');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadProduct();
        return () => { isMounted = false; };
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingIdx = currentCart.findIndex((item: any) => String(item.id || item._id) === String(product.id || product._id));

        if (existingIdx !== -1) {
            currentCart[existingIdx].quantity = (currentCart[existingIdx].quantity || 1) + 1;
        } else {
            currentCart.push({
                id: product.id,
                title: product.name,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(currentCart));
        window.dispatchEvent(new Event('cartUpdated'));

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1800);
    };

    const handleShare = (platform: string) => {
        if (!product) return;
        const url = window.location.href;
        const text = encodeURIComponent(product.name || 'Check out this product');
        const encodedUrl = encodeURIComponent(url);

        let shareUrl = '';
        switch (platform) {
            case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`; break;
            case 'whatsapp': shareUrl = `https://api.whatsapp.com/send?text=${text}%20${encodedUrl}`; break;
            case 'telegram': shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${text}`; break;
            case 'email': shareUrl = `mailto:?subject=${text}&body=Check out this product: ${encodedUrl}`; break;
            case 'linkedin': shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${text}`; break;
            case 'twitter': shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`; break;
            case 'instagram': shareUrl = `https://www.instagram.com/`; break;
            case 'copy': 
                navigator.clipboard.writeText(url).then(() => alert('Product link copied to clipboard!'));
                return;
        }
        if (shareUrl) window.open(shareUrl, '_blank');
    };

    if (loading) {
        return (
            <CommanLayout>
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Loading product details...</p>
                </div>
            </CommanLayout>
        );
    }

    if (error || !product) {
        return (
            <CommanLayout>
                <div className="container py-5">
                    <Alert variant="danger" className="text-center">
                        <h5>Unable to load product</h5>
                        <p>{error || 'Product not found'}</p>
                        <Link href="/shop-standard" className="btn btn-outline-danger mt-3">Back to Shop</Link>
                    </Alert>
                </div>
            </CommanLayout>
        );
    }

    return (
        <CommanLayout>
            <div className="page-content bg-light">
                <CommanBanner
                    parentText="Shop"
                    currentText={product.name}
                    mainText="Product Details"
                    image={IMAGES.BackBg1?.src || ''}
                />
                
                <section className="content-inner py-5">
                    <div className="container">
                        <div className="bg-white p-5 rounded-4 shadow-sm border">
                            <Row className="g-5">
                                <Col lg={6}>
                                    <div className="rounded-4 overflow-hidden bg-light shadow-sm position-relative" style={{ height: '500px' }}>
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-100 h-100 object-fit-cover"
                                            onError={(e: any) => { e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                                        />
                                        {product.discount && (
                                            <Badge bg="danger" className="position-absolute top-0 end-0 m-3 px-3 py-2 fs-6 rounded-pill shadow-sm">
                                                {product.discount}% OFF
                                            </Badge>
                                        )}
                                    </div>
                                </Col>
                                <Col lg={6} className="d-flex flex-column justify-content-center">
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <Badge bg="primary" className="px-3 py-2 rounded-pill fs-6">{product.category}</Badge>
                                        <span className="text-muted fw-semibold">SKU: {product.sku}</span>
                                    </div>

                                    <h2 className="fw-bold text-dark mb-3" style={{ fontSize: '2.5rem' }}>{product.name}</h2>
                                    
                                    <div className="d-flex align-items-baseline gap-3 mb-4">
                                        <span className="fw-bold text-primary" style={{ fontSize: '2rem' }}>₹{Number(product.price).toLocaleString()}</span>
                                        {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                                            <span className="text-muted text-decoration-line-through" style={{ fontSize: '1.2rem' }}>
                                                ₹{Number(product.originalPrice).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {product.rewardCoins && (
                                        <div className="mb-4">
                                            <span className="badge bg-warning text-dark px-3 py-2 fs-6 rounded-pill shadow-sm">
                                                🪙 Earn {product.rewardCoins} Reward Coins
                                            </span>
                                        </div>
                                    )}
                                    
                                    <p className="text-muted fs-5 mb-5" style={{ lineHeight: '1.8' }}>
                                        {product.description}
                                    </p>

                                    <div className="d-flex flex-column flex-sm-row gap-3 mb-5">
                                        {product.purchaseType === 'external' ? (
                                            <a 
                                                href={product.externalLink || '#'} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="btn btn-secondary rounded-pill py-3 px-5 fw-bold fs-5 shadow-sm text-uppercase"
                                            >
                                                View Product <i className="fa-solid fa-arrow-up-right-from-square ms-2" />
                                            </a>
                                        ) : (
                                            <Button 
                                                variant={isAdded ? "success" : "secondary"} 
                                                className="rounded-pill py-3 px-5 fw-bold fs-5 shadow-sm text-uppercase"
                                                onClick={handleAddToCart}
                                            >
                                                {isAdded ? "✓ Added to Cart" : "Add To Cart 🛒"}
                                            </Button>
                                        )}
                                        <Button 
                                            variant={isFavorite(String(product.id)) ? "danger" : "outline-danger"} 
                                            className="rounded-pill py-3 px-4 fw-bold fs-5 shadow-sm d-flex align-items-center gap-2"
                                            onClick={() => toggleFavorite(product)}
                                        >
                                            ♥ {isFavorite(String(product.id)) ? 'In Wishlist' : 'Add to Wishlist'}
                                        </Button>
                                    </div>

                                    <div className="pt-4 border-top">
                                        <h6 className="fw-bold text-dark mb-3">Share this product:</h6>
                                        <div className="d-flex gap-3">
                                            <Button variant="light" className="rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm text-primary" style={{width: '45px', height: '45px'}} onClick={() => handleShare('facebook')} title="Share on Facebook">
                                                <i className="fab fa-facebook-f fs-5"></i>
                                            </Button>
                                            <Button variant="light" className="rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm text-success" style={{width: '45px', height: '45px'}} onClick={() => handleShare('whatsapp')} title="Share on WhatsApp">
                                                <i className="fa-brands fa-whatsapp fs-5"></i>
                                            </Button>
                                            <Button variant="light" className="rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm text-info" style={{width: '45px', height: '45px'}} onClick={() => handleShare('telegram')} title="Share on Telegram">
                                                <i className="fa-brands fa-telegram fs-5"></i>
                                            </Button>
                                            <Button variant="light" className="rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm text-danger" style={{width: '45px', height: '45px'}} onClick={() => handleShare('email')} title="Share via Email">
                                                <i className="fa-solid fa-envelope fs-5"></i>
                                            </Button>
                                            <Button variant="light" className="rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm text-primary" style={{width: '45px', height: '45px'}} onClick={() => handleShare('linkedin')} title="Share on LinkedIn">
                                                <i className="fa-brands fa-linkedin-in fs-5"></i>
                                            </Button>
                                            <Button variant="light" className="rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm text-dark" style={{width: '45px', height: '45px'}} onClick={() => handleShare('twitter')} title="Share on X (Twitter)">
                                                <i className="fa-brands fa-x-twitter fs-5"></i>
                                            </Button>
                                            <Button variant="light" className="rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm text-danger" style={{width: '45px', height: '45px'}} onClick={() => handleShare('instagram')} title="Share on Instagram">
                                                <i className="fab fa-instagram fs-5"></i>
                                            </Button>
                                            <Button variant="light" className="rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm text-secondary" style={{width: '45px', height: '45px'}} onClick={() => handleShare('copy')} title="Copy Link">
                                                <i className="fa-solid fa-link fs-5"></i>
                                            </Button>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </section>
            </div>
        </CommanLayout>
    );
}
