'use client';
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CommanLayout from '@/components/CommanLayout';
import CommanBanner from '@/components/CommanBanner';
import IMAGES from '@/constant/theme';
import { ProductService, getActiveSubdomain } from '@/services/productService';
import { useWishlist } from '@/context/WishlistContext';
import { Modal, Spinner, Alert, Row, Col, Card, Form, Button, Pagination, Badge } from 'react-bootstrap';
import ProductInputButton from '@/elements/Shop/ProductInputButton';
import ModalSlider from '@/components/ModalSlider';
import VideoModal from '@/components/VideoModal';

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
    externalLink?: string | null;
    video?: string | null;
    purchaseType?: 'internal' | 'external';
    rewardCoins?: number | null;
    maxRedeemableCoins?: number;
    merchantId?: any;
}

interface CategoryOption {
    _id: string;
    name: string;
    image?: string;
}

const DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1";

const getSafeProductImage = (p: any): string => {
    if (typeof p?.image === 'string' && p.image.trim()) return p.image.trim();
    if (Array.isArray(p?.images) && p.images.length > 0 && typeof p.images[0] === 'string' && p.images[0].trim()) return p.images[0].trim();
    if (typeof p?.images === 'string' && p.images.trim()) return p.images.trim();
    return DEFAULT_PRODUCT_IMAGE;
};

const getSafeProductImages = (p: any): string[] => {
    if (Array.isArray(p?.images) && p.images.length > 0) {
        const valid = p.images.filter((img: any) => typeof img === 'string' && img.trim());
        if (valid.length > 0) return valid;
    }
    if (typeof p?.images === 'string' && p.images.trim()) {
        return p.images.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    if (typeof p?.image === 'string' && p.image.trim()) {
        return [p.image.trim()];
    }
    return [DEFAULT_PRODUCT_IMAGE];
};

export default function AllProductsPage() {
    const { toggleFavorite, isFavorite } = useWishlist();

    const [products, setProducts] = useState<ProductItem[]>([]);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [merchant, setMerchant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filtering & UI State
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('featured');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 12;

    // Modals
    const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);
    const [showQuickView, setShowQuickView] = useState(false);
    const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);
    const [addedCartIds, setAddedCartIds] = useState<{ [key: string]: boolean }>({});

    // Load Categories, Merchant Info & Products
    useEffect(() => {
        let isMounted = true;
        const loadInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                const subdomain = getActiveSubdomain();

                // 1. Fetch Merchant if subdomain exists
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

                // 2. Fetch Categories
                try {
                    const catRes = await ProductService.getPublicCategories(subdomain);
                    if (isMounted && catRes && (catRes.data || catRes.categories)) {
                        setCategories(catRes.data || catRes.categories || []);
                    }
                } catch (e) {
                    console.warn("Categories fetch error", e);
                }

                // 3. Fetch Products
                const prodRes = await ProductService.getPublicProducts(subdomain, 1, 100);
                const rawList = prodRes.data || prodRes.products || [];

                if (isMounted) {
                    const mapped: ProductItem[] = rawList.map((p: any) => {
                        const numPrice = typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0;
                        const origPrice = p.originalPrice || p.oldPrice || (p.discount ? Math.round(numPrice / (1 - (p.discount / 100))) : (numPrice > 0 ? Math.round(numPrice * 1.25) : 0));
                        const catName = typeof p.categoryId === 'object' && p.categoryId ? p.categoryId.name : (p.category || 'General');

                        return {
                            id: p._id || p.id,
                            _id: p._id || p.id,
                            name: p.title || p.name || 'Untitled Product',
                            title: p.title || p.name || 'Untitled Product',
                            price: numPrice,
                            originalPrice: origPrice,
                            discount: p.discount || (origPrice > numPrice ? Math.round(((origPrice - numPrice) / origPrice) * 100) : null),
                            image: getSafeProductImage(p),
                            images: getSafeProductImages(p),
                            category: catName,
                            categoryId: typeof p.categoryId === 'object' ? p.categoryId?._id : p.categoryId,
                            description: p.description || 'Premium quality crafted with meticulous attention to detail and timeless elegance.',
                            rating: p.rating || 5.0,
                            reviewCount: p.reviewCount || 12,
                            sku: p.sku || `SKU-${(p._id || '').slice(-6).toUpperCase() || 'ECOM'}`,
                            externalLink: p.externalLink || null,
                            video: p.video || null,
                            purchaseType: p.purchaseType || 'internal',
                            rewardCoins: p.rewardCoins || null,
                            maxRedeemableCoins: p.maxRedeemableCoins || 0,
                            merchantId: p.merchantId
                        };
                    });

                    setProducts(mapped);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err.message || 'Failed to load products');
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

    // Filter & Sort Logic
    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Filter by Category
        if (selectedCategory !== 'all') {
            result = result.filter(p => {
                const catId = typeof p.categoryId === 'object' ? p.categoryId?._id : p.categoryId;
                const catName = (p.category || '').toLowerCase();
                return catId === selectedCategory || catName === selectedCategory.toLowerCase();
            });
        }

        // Filter by Search Query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(p =>
                (p.name || '').toLowerCase().includes(q) ||
                (p.description || '').toLowerCase().includes(q) ||
                (p.category || '').toLowerCase().includes(q)
            );
        }

        // Sorting
        if (sortBy === 'price-low') {
            result.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sortBy === 'price-high') {
            result.sort((a, b) => Number(b.price) - Number(a.price));
        } else if (sortBy === 'name-asc') {
            result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        } else if (sortBy === 'discount') {
            result.sort((a, b) => Number(b.discount || 0) - Number(a.discount || 0));
        }

        return result;
    }, [products, selectedCategory, searchQuery, sortBy]);

    // Paginated Slices
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(start, start + itemsPerPage);
    }, [filteredProducts, currentPage]);

    // Add to cart handler
    const handleAddToCart = (product: ProductItem) => {
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingIdx = currentCart.findIndex((item: any) => String(item.id || item._id) === String(product.id || product._id));

        if (existingIdx !== -1) {
            currentCart[existingIdx].quantity = (currentCart[existingIdx].quantity || 1) + 1;
        } else {
            currentCart.push({
                id: product.id || product._id,
                _id: product.id || product._id,
                title: product.name,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1,
                maxRedeemableCoins: product.maxRedeemableCoins || 0,
                rewardCoins: product.rewardCoins || null
            });
        }

        localStorage.setItem('cart', JSON.stringify(currentCart));
        window.dispatchEvent(new Event('cartUpdated'));

        setAddedCartIds(prev => ({ ...prev, [String(product.id)]: true }));
        setTimeout(() => {
            setAddedCartIds(prev => ({ ...prev, [String(product.id)]: false }));
        }, 1800);
    };

    const handleOpenQuickView = (product: ProductItem) => {
        setQuickViewProduct(product);
        setShowQuickView(true);
    };

    return (
        <CommanLayout>
            <div className="page-content bg-light">
                {/* Banner */}
                <CommanBanner
                    parentText="Home"
                    currentText={merchant ? `${merchant.business_name || merchant.name} Catalog` : "All Products"}
                    mainText={merchant ? `Explore ${merchant.business_name || merchant.name}'s Collection` : "Discover All Products"}
                    image={IMAGES.BackBg1?.src || ''}
                />

                <section className="content-inner py-5">
                    <div className="container">
                        {/* Search, Categories & Controls Header */}
                        <div className="bg-white p-4 rounded-4 shadow-sm mb-4 border">
                            <Row className="g-3 align-items-center">
                                {/* Search */}
                                <Col lg={4} md={6}>
                                    <div className="position-relative">
                                        <Form.Control
                                            type="text"
                                            placeholder="Search products by name or keywords..."
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="rounded-pill pe-5"
                                        />
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => setSearchQuery('')}
                                                className="btn position-absolute top-50 end-0 translate-middle-y border-0 text-muted"
                                                style={{ zIndex: 5 }}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </Col>

                                {/* Sort Dropdown */}
                                <Col lg={3} md={6}>
                                    <Form.Select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="rounded-pill"
                                    >
                                        <option value="featured">Featured / Newest</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="discount">Biggest Discount</option>
                                        <option value="name-asc">Alphabetical (A-Z)</option>
                                    </Form.Select>
                                </Col>

                                {/* View Switcher & Result Count */}
                                <Col lg={5} className="d-flex justify-content-lg-end align-items-center gap-3">
                                    <span className="small text-muted fw-semibold">
                                        Showing <strong>{filteredProducts.length}</strong> items
                                    </span>
                                    <div className="btn-group rounded-pill p-1 bg-light border" role="group">
                                        <Button
                                            variant={viewMode === 'grid' ? 'primary' : 'light'}
                                            size="sm"
                                            className="rounded-pill px-3 py-1"
                                            onClick={() => setViewMode('grid')}
                                            title="Grid View"
                                        >
                                            <i className="fa-solid fa-grid-2 me-1" /> Grid
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'primary' : 'light'}
                                            size="sm"
                                            className="rounded-pill px-3 py-1"
                                            onClick={() => setViewMode('list')}
                                            title="List View"
                                        >
                                            <i className="fa-solid fa-list me-1" /> List
                                        </Button>
                                    </div>
                                </Col>
                            </Row>

                            {/* Category Filter Pills */}
                            {categories.length > 0 && (
                                <div className="d-flex flex-wrap gap-2 pt-3 mt-3 border-top">
                                    <Button
                                        variant={selectedCategory === 'all' ? 'primary' : 'outline-secondary'}
                                        size="sm"
                                        className="rounded-pill px-3"
                                        onClick={() => {
                                            setSelectedCategory('all');
                                            setCurrentPage(1);
                                        }}
                                    >
                                        All Products
                                    </Button>
                                    {categories.map((cat) => (
                                        <Button
                                            key={cat._id}
                                            variant={selectedCategory === cat._id || selectedCategory === cat.name ? 'primary' : 'outline-secondary'}
                                            size="sm"
                                            className="rounded-pill px-3"
                                            onClick={() => {
                                                setSelectedCategory(cat._id);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            {cat.name}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Products Content */}
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-3 text-muted">Loading all products...</p>
                            </div>
                        ) : error ? (
                            <Alert variant="danger" className="text-center py-4">
                                <h5>Unable to load products</h5>
                                <p className="mb-0">{error}</p>
                            </Alert>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-5 bg-white rounded-4 shadow-sm border p-5">
                                <div style={{ fontSize: '56px' }}>🛍️</div>
                                <h4 className="fw-bold mt-3 text-dark">No products found</h4>
                                <p className="text-muted small mb-4">
                                    We couldn't find any products matching your search or selected category filter.
                                </p>
                                <Button
                                    variant="primary"
                                    className="rounded-pill px-4"
                                    onClick={() => {
                                        setSelectedCategory('all');
                                        setSearchQuery('');
                                    }}
                                >
                                    Reset All Filters
                                </Button>
                            </div>
                        ) : viewMode === 'grid' ? (
                            /* Grid Layout */
                            <Row className="g-4">
                                {paginatedProducts.map((item) => {
                                    const isFav = isFavorite(String(item.id));
                                    const isAdded = addedCartIds[String(item.id)];

                                    return (
                                        <Col key={item.id} lg={3} md={4} sm={6}>
                                            <div className="shop-card style-1 bg-white rounded-4 shadow-sm overflow-hidden h-100 d-flex flex-column border">
                                                {/* Media Thumbnail */}
                                                <div className="dz-media position-relative overflow-hidden" style={{ height: '280px', backgroundColor: '#f9f9f9' }}>
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-100 h-100 object-fit-cover transition-all"
                                                        onError={(e: any) => { e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                                                    />

                                                    {/* Video Badge Button */}
                                                    {item.video && (
                                                        <button
                                                            type="button"
                                                            className="position-absolute top-0 start-0 m-2 btn btn-dark btn-sm rounded-circle p-2 shadow"
                                                            style={{ zIndex: 10, width: '36px', height: '36px' }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveVideo({ url: item.video!, title: item.name });
                                                            }}
                                                            title="Watch Product Video"
                                                        >
                                                            ▶
                                                        </button>
                                                    )}

                                                    {/* Discount Tag */}
                                                    {item.discount && (
                                                        <div className="product-tag position-absolute top-0 end-0 m-2">
                                                            <span className="badge bg-danger rounded-pill px-2 py-1">
                                                                {item.discount}% OFF
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Hover Action Overlay */}
                                                    <div className="shop-meta d-flex align-items-center justify-content-center gap-2 position-absolute w-100 bottom-0 p-3" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
                                                        <Button
                                                            variant="light"
                                                            size="sm"
                                                            className="rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1 shadow-sm"
                                                            onClick={() => handleOpenQuickView(item)}
                                                        >
                                                            👁 Quick View
                                                        </Button>

                                                        <Button
                                                            variant={isFav ? "primary" : "light"}
                                                            size="sm"
                                                            className="rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm"
                                                            style={{ width: '36px', height: '36px' }}
                                                            onClick={() => toggleFavorite(item)}
                                                            title={isFav ? "Remove from wishlist" : "Add to wishlist"}
                                                        >
                                                            ♥
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Content info */}
                                                <div className="dz-content p-3 d-flex flex-column flex-grow-1">
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <span className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '11px' }}>
                                                            {item.category}
                                                        </span>
                                                        <span className="small text-warning">
                                                            ★ {Number(item.rating || 5.0).toFixed(1)}
                                                        </span>
                                                    </div>

                                                    <h6 className="title mb-2" style={{ fontSize: '15px', lineHeight: '1.4' }}>
                                                        <a
                                                            href="#"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleOpenQuickView(item);
                                                            }}
                                                            className="text-dark text-decoration-none fw-semibold text-truncate-2"
                                                        >
                                                            {item.name}
                                                        </a>
                                                    </h6>

                                                    <div className="d-flex align-items-baseline gap-2 mb-3 mt-auto">
                                                        <span className="fw-bold text-primary" style={{ fontSize: '18px' }}>
                                                            ₹{Number(item.price).toLocaleString()}
                                                        </span>
                                                        {item.originalPrice && Number(item.originalPrice) > Number(item.price) && (
                                                            <span className="text-muted text-decoration-line-through small">
                                                                ₹{Number(item.originalPrice).toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Add to Cart / Buy Button */}
                                                    {item.externalLink ? (
                                                        <Link
                                                            href={item.externalLink}
                                                            target="_blank"
                                                            className="btn btn-outline-primary btn-sm rounded-pill w-100 fw-semibold"
                                                        >
                                                            Buy Now ↗
                                                        </Link>
                                                    ) : (
                                                        <Button
                                                            variant={isAdded ? "success" : "primary"}
                                                            size="sm"
                                                            className="rounded-pill w-100 fw-semibold transition-all"
                                                            onClick={() => handleAddToCart(item)}
                                                        >
                                                            {isAdded ? "✓ Added to Cart" : "Add To Cart 🛒"}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </Col>
                                    );
                                })}
                            </Row>
                        ) : (
                            /* List Layout */
                            <div className="d-flex flex-column gap-3">
                                {paginatedProducts.map((item) => {
                                    const isFav = isFavorite(String(item.id));
                                    const isAdded = addedCartIds[String(item.id)];

                                    return (
                                        <Card key={item.id} className="border-0 shadow-sm rounded-4 overflow-hidden p-3">
                                            <Row className="g-3 align-items-center">
                                                <Col md={3} sm={4}>
                                                    <div className="position-relative rounded-3 overflow-hidden" style={{ height: '180px', backgroundColor: '#f9f9f9' }}>
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-100 h-100 object-fit-cover"
                                                            onError={(e: any) => { e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                                                        />
                                                        {item.discount && (
                                                            <span className="badge bg-danger position-absolute top-0 end-0 m-2 rounded-pill">
                                                                {item.discount}% OFF
                                                            </span>
                                                        )}
                                                    </div>
                                                </Col>
                                                <Col md={6} sm={8}>
                                                    <span className="badge bg-light text-dark border mb-2">{item.category}</span>
                                                    <h5 className="fw-bold mb-1">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleOpenQuickView(item); }} className="text-dark text-decoration-none">
                                                            {item.name}
                                                        </a>
                                                    </h5>
                                                    <p className="text-muted small mb-2 text-truncate-2">{item.description}</p>
                                                    <span className="text-warning small">★ {Number(item.rating || 5.0).toFixed(1)} rating</span>
                                                </Col>
                                                <Col md={3} className="text-md-end d-flex flex-column justify-content-between">
                                                    <div className="mb-3">
                                                        <h4 className="fw-bold text-primary mb-0">₹{Number(item.price).toLocaleString()}</h4>
                                                        {item.originalPrice && (
                                                            <span className="text-muted text-decoration-line-through small">₹{Number(item.originalPrice).toLocaleString()}</span>
                                                        )}
                                                    </div>
                                                    <div className="d-flex flex-column gap-2">
                                                        {item.externalLink ? (
                                                            <Link href={item.externalLink} target="_blank" className="btn btn-outline-primary btn-sm rounded-pill">
                                                                Buy Now ↗
                                                            </Link>
                                                        ) : (
                                                            <Button variant={isAdded ? "success" : "primary"} size="sm" className="rounded-pill" onClick={() => handleAddToCart(item)}>
                                                                {isAdded ? "✓ Added" : "Add To Cart 🛒"}
                                                            </Button>
                                                        )}
                                                        <div className="d-flex gap-2 justify-content-md-end">
                                                            <Button variant="outline-secondary" size="sm" className="rounded-pill" onClick={() => handleOpenQuickView(item)}>
                                                                Quick View
                                                            </Button>
                                                            <Button variant={isFav ? "primary" : "outline-danger"} size="sm" className="rounded-circle" onClick={() => toggleFavorite(item)}>
                                                                ♥
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && totalPages > 1 && (
                            <div className="d-flex justify-content-center mt-5">
                                <Pagination>
                                    <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} />
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <Pagination.Item key={p} active={p === currentPage} onClick={() => setCurrentPage(p)}>
                                            {p}
                                        </Pagination.Item>
                                    ))}
                                    <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} />
                                </Pagination>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Quick View Detailed Modal */}
            <Modal show={showQuickView} onHide={() => setShowQuickView(false)} size="lg" centered className="quick-view-modal">
                {quickViewProduct && (
                    <div className="p-3">
                        <Modal.Header closeButton className="border-0 pb-0">
                            <Modal.Title className="fw-bold">{quickViewProduct.name}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="pt-2">
                            <Row className="g-4">
                                <Col md={6}>
                                    <div className="rounded-4 overflow-hidden bg-light shadow-sm" style={{ maxHeight: '380px' }}>
                                        <img
                                            src={quickViewProduct.image}
                                            alt={quickViewProduct.name}
                                            className="w-100 h-100 object-fit-cover"
                                            onError={(e: any) => { e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                                        />
                                    </div>
                                </Col>
                                <Col md={6} className="d-flex flex-column justify-content-between">
                                    <div>
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <Badge bg="primary">{quickViewProduct.category}</Badge>
                                            <span className="small text-muted">SKU: {quickViewProduct.sku}</span>
                                        </div>

                                        <h4 className="fw-bold mb-2 text-dark">{quickViewProduct.name}</h4>

                                        <div className="d-flex align-items-baseline gap-3 mb-3">
                                            <h3 className="fw-bold text-primary mb-0">₹{Number(quickViewProduct.price).toLocaleString()}</h3>
                                            {quickViewProduct.originalPrice && Number(quickViewProduct.originalPrice) > Number(quickViewProduct.price) && (
                                                <del className="text-muted">₹{Number(quickViewProduct.originalPrice).toLocaleString()}</del>
                                            )}
                                        </div>

                                        <p className="text-muted small mb-4" style={{ lineHeight: '1.7' }}>
                                            {quickViewProduct.description}
                                        </p>
                                    </div>

                                    <div>
                                        <div className="d-flex gap-2">
                                            {quickViewProduct.externalLink ? (
                                                <Link
                                                    href={quickViewProduct.externalLink}
                                                    target="_blank"
                                                    className="btn btn-primary rounded-pill w-100 fw-bold py-2"
                                                >
                                                    Buy on Store ↗
                                                </Link>
                                            ) : (
                                                <Button
                                                    variant="primary"
                                                    className="rounded-pill w-100 fw-bold py-2"
                                                    onClick={() => {
                                                        handleAddToCart(quickViewProduct);
                                                        setShowQuickView(false);
                                                    }}
                                                >
                                                    Add To Cart 🛒
                                                </Button>
                                            )}
                                            <Button
                                                variant={isFavorite(String(quickViewProduct.id)) ? "danger" : "outline-secondary"}
                                                className="rounded-circle p-2 flex-shrink-0"
                                                style={{ width: '44px', height: '44px' }}
                                                onClick={() => toggleFavorite(quickViewProduct)}
                                                title="Toggle Wishlist"
                                            >
                                                ♥
                                            </Button>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Modal.Body>
                    </div>
                )}
            </Modal>

            {/* Video Player Modal */}
            <VideoModal
                show={Boolean(activeVideo)}
                onHide={() => setActiveVideo(null)}
                videoUrl={activeVideo?.url}
                title={activeVideo?.title}
            />
        </CommanLayout>
    );
}
