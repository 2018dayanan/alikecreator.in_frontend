"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import CommanLayout from "@/components/CommanLayout";
import CommanBanner from "@/components/CommanBanner";
import IMAGES from "@/constant/theme";
import { ProductService } from "@/services/productService";
import { Modal } from "react-bootstrap";
import ModalSlider from "@/components/ModalSlider";
import ProductInputButton from "@/elements/Shop/ProductInputButton";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";

interface PhotoItem {
    id: string;
    url: string;
    alt: string;
    category?: string;
    purchaseType?: string;
    externalLink?: string;
    product?: any;
}

export default function PhotosPage() {
    const [photos, setPhotos] = useState<PhotoItem[]>([]);
    const [categories, setCategories] = useState<string[]>(["All"]);
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [loading, setLoading] = useState(true);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

    // Quick View Modal State
    const [showQuickView, setShowQuickView] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const { isFavorite, toggleFavorite } = useWishlist();

    useEffect(() => {
        const fetchProductPhotos = async () => {
            try {
                setLoading(true);
                const res = await ProductService.getPublicProducts();
                const products = res.data || res.products || [];

                if (Array.isArray(products) && products.length > 0) {
                    const extractedPhotos: PhotoItem[] = [];
                    const foundCategories = new Set<string>();

                    products.forEach((prod: any, pIdx: number) => {
                        const catName = prod.category?.name || prod.category || prod.categoryId?.name || "General";
                        if (catName) foundCategories.add(catName);

                        // Main product image
                        if (prod.image && typeof prod.image === "string" && prod.image.trim()) {
                            extractedPhotos.push({
                                id: `${prod._id || pIdx}-main`,
                                url: prod.image,
                                alt: prod.title || "Product photo",
                                category: catName,
                                purchaseType: prod.purchaseType,
                                externalLink: prod.externalLink,
                                product: prod
                            });
                        }

                        // Additional multi-images of the product
                        if (Array.isArray(prod.images)) {
                            prod.images.forEach((imgUrl: string, imgIdx: number) => {
                                if (imgUrl && typeof imgUrl === "string" && imgUrl.trim() && imgUrl !== prod.image) {
                                    extractedPhotos.push({
                                        id: `${prod._id || pIdx}-extra-${imgIdx}`,
                                        url: imgUrl,
                                        alt: `${prod.title || "Product"} view ${imgIdx + 1}`,
                                        category: catName,
                                        purchaseType: prod.purchaseType,
                                        externalLink: prod.externalLink,
                                        product: prod
                                    });
                                }
                            });
                        }
                    });

                    // Fallback to sample images if backend products have no images yet
                    if (extractedPhotos.length === 0) {
                        const fallbackList = [
                            IMAGES.ShopPorductPng1,
                            IMAGES.ShopPorductPng2,
                            IMAGES.ShopPorductPng3,
                            IMAGES.ShopPorductPng4,
                            IMAGES.AboutPic8,
                            IMAGES.shopproduct1,
                            IMAGES.shopproduct2,
                            IMAGES.shopproduct3,
                            IMAGES.shopproduct4,
                        ];
                        fallbackList.forEach((fbImg: any, fbIdx: number) => {
                            extractedPhotos.push({
                                id: `fallback-${fbIdx}`,
                                url: typeof fbImg === "string" ? fbImg : fbImg.src || "",
                                alt: `Gallery Photo ${fbIdx + 1}`,
                                category: "Collection"
                            });
                        });
                    }

                    setPhotos(extractedPhotos);
                    setCategories(["All", ...Array.from(foundCategories)]);
                } else {
                    // Fallback gallery images
                    const fallbackList = [
                        IMAGES.ShopPorductPng1,
                        IMAGES.ShopPorductPng2,
                        IMAGES.ShopPorductPng3,
                        IMAGES.ShopPorductPng4,
                        IMAGES.AboutPic8,
                        IMAGES.shopproduct1,
                        IMAGES.shopproduct2,
                        IMAGES.shopproduct3,
                        IMAGES.shopproduct4,
                    ];
                    const fallbackPhotos = fallbackList.map((fbImg: any, fbIdx: number) => ({
                        id: `fallback-${fbIdx}`,
                        url: typeof fbImg === "string" ? fbImg : fbImg.src || "",
                        alt: `Gallery Photo ${fbIdx + 1}`,
                        category: "Collection"
                    }));
                    setPhotos(fallbackPhotos);
                    setCategories(["All", "Collection"]);
                }
            } catch (err) {
                console.error("Error fetching product photos:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProductPhotos();
    }, []);

    const handleAddToCart = (product: any) => {
        if (!product) return;
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingIdx = currentCart.findIndex((item: any) => String(item.id || item._id) === String(product._id || product.id));

        if (existingIdx !== -1) {
            currentCart[existingIdx].quantity = (currentCart[existingIdx].quantity || 1) + 1;
        } else {
            currentCart.push({
                id: product._id || product.id,
                _id: product._id || product.id,
                title: product.title || product.name,
                name: product.name || product.title,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(currentCart));
        window.dispatchEvent(new Event('cartUpdated'));
        
        import('react-hot-toast').then(({ toast }) => {
            toast.success('Added to cart!');
        });
    };

    const filteredPhotos = activeCategory === "All"
        ? photos
        : photos.filter((p) => p.category === activeCategory);

    // Lightbox navigation
    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedPhotoIndex !== null) {
            setSelectedPhotoIndex((selectedPhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length);
        }
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedPhotoIndex !== null) {
            setSelectedPhotoIndex((selectedPhotoIndex + 1) % filteredPhotos.length);
        }
    };

    // Close modal on Escape key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setSelectedPhotoIndex(null);
            } else if (e.key === "ArrowLeft" && selectedPhotoIndex !== null) {
                setSelectedPhotoIndex((prev) => (prev !== null ? (prev - 1 + filteredPhotos.length) % filteredPhotos.length : null));
            } else if (e.key === "ArrowRight" && selectedPhotoIndex !== null) {
                setSelectedPhotoIndex((prev) => (prev !== null ? (prev + 1) % filteredPhotos.length : null));
            }
        };

        if (selectedPhotoIndex !== null) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedPhotoIndex, filteredPhotos.length]);

    return (
        <CommanLayout>
            <div className="page-content bg-light">
                <CommanBanner
                    parentText="Home"
                    currentText="Photos"
                    mainText="Photos"
                    image={IMAGES.BackBg1.src}
                />

                <div className="content-inner-1 py-5">
                    <div className="container">
                        {/* Category filter pills if multiple categories exist */}
                        {categories.length > 2 && (
                            <div className="d-flex flex-wrap justify-content-center gap-2 mb-5">
                                {categories.map((cat, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className={`btn btn-sm rounded-pill px-3 py-2 fw-medium transition-all ${activeCategory === cat ? 'btn-primary shadow-sm' : 'btn-outline-secondary'}`}
                                        onClick={() => setActiveCategory(cat)}
                                        style={{ fontSize: '13px' }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Loading State */}
                        {loading ? (
                            <div className="row g-4">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12">
                                        <div
                                            className="rounded-4 bg-secondary bg-opacity-10 shadow-sm"
                                            style={{ height: '320px', animation: 'pulse 1.5s infinite' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : filteredPhotos.length === 0 ? (
                            <div className="card shadow-sm border-0 p-5 text-center rounded-4 my-4">
                                <div className="mb-3">
                                    <i className="feather icon-image text-muted" style={{ fontSize: '48px' }} />
                                </div>
                                <h4 className="fw-bold mb-2">No Photos Found</h4>
                                <p className="text-muted mb-0">Photos will appear here as soon as products are added.</p>
                            </div>
                        ) : (
                            /* Photos Grid */
                            <div className="row g-4">
                                {filteredPhotos.map((photo, index) => (
                                    <div
                                        key={photo.id || index}
                                        className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12"
                                    >
                                        <div
                                            className="photo-grid-card position-relative overflow-hidden rounded-4 shadow-sm h-100 cursor-pointer"
                                            style={{
                                                backgroundColor: '#fff',
                                                cursor: 'pointer',
                                                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                            }}
                                            onClick={() => {
                                                if (photo.purchaseType === 'external' || photo.purchaseType === 'internal') {
                                                    setSelectedProduct(photo.product);
                                                    setShowQuickView(true);
                                                } else {
                                                    setSelectedPhotoIndex(index);
                                                }
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-6px)';
                                                e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                                            }}
                                        >
                                            <div className="photo-card-img position-relative" style={{ height: '340px' }}>
                                                <img
                                                    src={photo.url}
                                                    alt={photo.alt}
                                                    className="w-100 h-100 object-fit-cover transition-transform"
                                                    style={{ display: 'block', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = IMAGES.ShopPorductPng1.src || '';
                                                    }}
                                                />
                                                {/* Hover Overlay with Icon based on purchaseType */}
                                                <div
                                                    className="photo-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                                                    style={{
                                                        background: 'rgba(0,0,0,0.25)',
                                                        opacity: 0,
                                                        transition: 'opacity 0.3s ease'
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
                                                >
                                                    <span
                                                        className="btn btn-light rounded-circle shadow d-flex align-items-center justify-content-center"
                                                        style={{ width: '48px', height: '48px', padding: 0, color: 'var(--primary)' }}
                                                    >
                                                        <i 
                                                            className={photo.purchaseType === 'external' ? "fa-solid fa-arrow-up-right-from-square" : (photo.purchaseType === 'internal' ? "fa-solid fa-cart-shopping" : "fa-solid fa-magnifying-glass-plus")} 
                                                            style={{ fontSize: '18px' }} 
                                                        />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Lightbox / Fullscreen Modal Viewer */}
                {selectedPhotoIndex !== null && filteredPhotos[selectedPhotoIndex] && (
                    <div
                        className="photo-lightbox-modal position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            zIndex: 99999,
                            backdropFilter: 'blur(8px)',
                            padding: '20px'
                        }}
                        onClick={() => setSelectedPhotoIndex(null)}
                    >
                        {/* Close button */}
                        <button
                            type="button"
                            className="btn btn-outline-light rounded-circle position-absolute top-0 end-0 m-4 d-flex align-items-center justify-content-center shadow"
                            style={{ width: '44px', height: '44px', zIndex: 100000 }}
                            onClick={() => setSelectedPhotoIndex(null)}
                            title="Close (Esc)"
                        >
                            <i className="fa-solid fa-xmark" style={{ fontSize: '20px' }} />
                        </button>

                        {/* Prev Button */}
                        <button
                            type="button"
                            className="btn btn-outline-light rounded-circle position-absolute start-0 top-50 translate-middle-y ms-3 ms-md-4 d-flex align-items-center justify-content-center shadow"
                            style={{ width: '48px', height: '48px', zIndex: 100000 }}
                            onClick={handlePrev}
                            title="Previous (Left Arrow)"
                        >
                            <i className="fa-solid fa-chevron-left" style={{ fontSize: '20px' }} />
                        </button>

                        {/* Next Button */}
                        <button
                            type="button"
                            className="btn btn-outline-light rounded-circle position-absolute end-0 top-50 translate-middle-y me-3 me-md-4 d-flex align-items-center justify-content-center shadow"
                            style={{ width: '48px', height: '48px', zIndex: 100000 }}
                            onClick={handleNext}
                            title="Next (Right Arrow)"
                        >
                            <i className="fa-solid fa-chevron-right" style={{ fontSize: '20px' }} />
                        </button>

                        {/* Photo Display */}
                        <div
                            className="photo-lightbox-content position-relative text-center"
                            style={{ maxWidth: '90vw', maxHeight: '85vh' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={filteredPhotos[selectedPhotoIndex].url}
                                alt={filteredPhotos[selectedPhotoIndex].alt}
                                className="img-fluid rounded-4 shadow-lg"
                                style={{
                                    maxHeight: '85vh',
                                    maxWidth: '90vw',
                                    objectFit: 'contain',
                                    border: '2px solid rgba(255,255,255,0.1)'
                                }}
                            />
                            <div className="position-absolute bottom-0 start-50 translate-middle-x mb-n4 px-3 py-1 rounded-pill bg-dark bg-opacity-75 text-white small">
                                {selectedPhotoIndex + 1} / {filteredPhotos.length}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick View Modal */}
            <Modal className="quick-view-modal" show={showQuickView} onHide={() => setShowQuickView(false)} centered>
                <button type="button" className="btn-close" onClick={() => setShowQuickView(false)}>
                    <i className="icon feather icon-x" />
                </button>
                <div className="modal-body">
                    <div className="row g-xl-4 g-3">
                        <div className="col-xl-6 col-md-6">
                            <div className="dz-product-detail mb-0">
                                <ModalSlider images={selectedProduct?.images} />
                            </div>
                        </div>
                        <div className="col-xl-6 col-md-6">
                            <div className="dz-product-detail style-2 ps-xl-3 ps-0 pt-2 mb-0">
                                <div className="dz-content">
                                    <div className="dz-content-footer">
                                        <div className="dz-content-start">
                                            {selectedProduct?.discount && selectedProduct.discount !== "0" && selectedProduct.discount !== 0 && (
                                                <span className="badge bg-secondary mb-2">SALE {selectedProduct.discount}% Off</span>
                                            )}
                                            <h4 className="title mb-1"><Link href={`/product/${selectedProduct?._id || selectedProduct?.id || ''}`}>{selectedProduct?.title || selectedProduct?.name}</Link></h4>
                                            <div className="review-num">
                                                <ul className="dz-rating me-2">
                                                    <li className="star-fill"><i className="flaticon-star-1" /></li>
                                                    <li className="star-fill"><i className="flaticon-star-1" /></li>
                                                    <li className="star-fill"><i className="flaticon-star-1" /></li>
                                                    <li className="star-fill"><i className="flaticon-star-1" /></li>
                                                    <li className="star-fill"><i className="flaticon-star-1" /></li>
                                                </ul>
                                                <span className="text-secondary me-2">{selectedProduct?.rating || 4.5} Rating</span>
                                                <Link href={"#"}>({selectedProduct?.reviewCount || 0} customer reviews)</Link>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="para-text">
                                        {selectedProduct?.description}
                                    </p>

                                    {selectedProduct?.video && (
                                        <div className="mb-3">
                                            <Link href={selectedProduct.video} target="_blank" className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold rounded-3 shadow-sm">
                                                <i className="fa-brands fa-youtube text-danger fs-5" />
                                                <span>Watch Video Showcase</span>
                                            </Link>
                                        </div>
                                    )}

                                    <div className="meta-content m-b20 d-flex align-items-end">
                                        <div className="me-3">
                                            <span className="form-label">Price</span>
                                            <span className="price">₹{selectedProduct?.price} {selectedProduct?.originalPrice && <del>₹{selectedProduct?.originalPrice}</del>}</span>
                                        </div>
                                        {selectedProduct?.rewardCoins && (
                                            <div className="me-3">
                                                <span className="form-label text-warning">Reward Coins</span>
                                                <span className="price text-warning" style={{ fontSize: "1.2rem" }}>🪙 {selectedProduct.rewardCoins}</span>
                                            </div>
                                        )}
                                        <div className="btn-quantity light me-0">
                                            <label className="form-label">Quantity</label>
                                            <ProductInputButton />
                                        </div>
                                    </div>
                                    <div className=" cart-btn">
                                        {selectedProduct?.purchaseType === 'external' ? (
                                            <Link href={selectedProduct.externalLink || '#'} target="_blank" className="btn btn-secondary text-uppercase">
                                                View Product <i className="fa-solid fa-arrow-up-right-from-square ms-2" />
                                            </Link>
                                        ) : (
                                            <Link
                                                href="/shop-cart"
                                                className="btn btn-secondary text-uppercase"
                                                onClick={() => {
                                                    if (selectedProduct) {
                                                        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
                                                        const existingItemIndex = currentCart.findIndex((item: any) => String(item.id || item._id) === String(selectedProduct?._id || selectedProduct?.id));
                                                        if (existingItemIndex === -1) {
                                                            currentCart.push({ ...selectedProduct, id: selectedProduct._id || selectedProduct.id, quantity: 1 });
                                                            localStorage.setItem('cart', JSON.stringify(currentCart));
                                                            window.dispatchEvent(new Event('cartUpdated'));
                                                        }
                                                    }
                                                }}
                                            >Add To Cart</Link>
                                        )}
                                        <button
                                            type="button"
                                            className={`btn btn-md ${isFavorite(selectedProduct?._id || selectedProduct?.id) ? 'btn-primary' : 'btn-outline-secondary'} btn-icon`}
                                            onClick={() => {
                                                if (selectedProduct) {
                                                    toggleFavorite({ ...selectedProduct, id: selectedProduct._id || selectedProduct.id });
                                                }
                                            }}
                                        >
                                            <svg width="19" height="17" viewBox="0 0 19 17" fill={isFavorite(selectedProduct?._id || selectedProduct?.id) ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9.24805 16.9986C8.99179 16.9986 8.74474 16.9058 8.5522 16.7371C7.82504 16.1013 7.12398 15.5038 6.50545 14.9767L6.50229 14.974C4.68886 13.4286 3.12289 12.094 2.03333 10.7794C0.815353 9.30968 0.248047 7.9162 0.248047 6.39391C0.248047 4.91487 0.755203 3.55037 1.67599 2.55157C2.60777 1.54097 3.88631 0.984375 5.27649 0.984375C6.31552 0.984375 7.26707 1.31287 8.10464 1.96065C8.52734 2.28763 8.91049 2.68781 9.24805 3.15459C9.58574 2.68781 9.96875 2.28763 10.3916 1.96065C11.2292 1.31287 12.1807 0.984375 13.2197 0.984375C14.6098 0.984375 15.8885 1.54097 16.8202 2.55157C17.741 3.55037 18.248 4.91487 18.248 6.39391C18.248 7.9162 17.6809 9.30968 16.4629 10.7792C15.3733 12.094 13.8075 13.4285 11.9944 14.9737C11.3747 15.5016 10.6726 16.1001 9.94376 16.7374C9.75136 16.9058 9.50417 16.9986 9.24805 16.9986ZM5.27649 2.03879C4.18431 2.03879 3.18098 2.47467 2.45108 3.26624C1.71033 4.06975 1.30232 5.18047 1.30232 6.39391C1.30232 7.67422 1.77817 8.81927 2.84508 10.1066C3.87628 11.3509 5.41011 12.658 7.18605 14.1715L7.18935 14.1743C7.81021 14.7034 8.51402 15.3033 9.24654 15.9438C9.98344 15.302 10.6884 14.7012 11.3105 14.1713C13.0863 12.6578 14.6199 11.3509 15.6512 10.1066C16.7179 8.81927 17.1938 7.67422 17.1938 6.39391C17.1938 5.18047 16.7858 4.06975 16.045 3.26624C15.3152 2.47467 14.3118 2.03879 13.2197 2.03879C12.4197 2.03879 11.6851 2.29312 11.0365 2.79465C10.4585 3.24179 10.0558 3.80704 9.81975 4.20255C9.69835 4.40593 9.48466 4.52733 9.24805 4.52733C9.01143 4.52733 8.79774 4.40593 8.67635 4.20255C8.44041 3.80704 8.03777 3.24179 7.45961 2.79465C6.811 2.29312 6.07643 2.03879 5.27649 2.03879Z" fill={isFavorite(selectedProduct?._id || selectedProduct?.id) ? "currentColor" : "black"} />
                                            </svg>
                                            {isFavorite(selectedProduct?._id || selectedProduct?.id) ? "In Wishlist" : "Add To Wishlist"}
                                        </button>
                                    </div>
                                    <div className="dz-info mb-0">
                                        <ul>
                                            <li><strong>SKU:</strong></li>
                                            <li>{selectedProduct?.sku || selectedProduct?._id?.substring(0, 8)}</li>
                                        </ul>
                                        <ul>
                                            <li><strong>Category:</strong></li>
                                            <li><Link href="/shop-standard">{typeof selectedProduct?.categoryId === 'object' ? selectedProduct?.categoryId?.name : selectedProduct?.category || "Unknown"}</Link></li>
                                        </ul>
                                        <div className="dz-social-icon">
                                            <ul>
                                                <li><Link target="_blank" className="text-dark" href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? encodeURIComponent(`${window.location.origin}/product/${selectedProduct?._id || selectedProduct?.id}`) : ''}`}>
                                                    <i className="fab fa-facebook-f" />
                                                </Link></li>
                                                <li><Link target="_blank" className="text-dark" href={`https://api.whatsapp.com/send?text=${encodeURIComponent(selectedProduct?.title || selectedProduct?.name || 'Check out this product:')} ${typeof window !== 'undefined' ? encodeURIComponent(`${window.location.origin}/product/${selectedProduct?._id || selectedProduct?.id}`) : ''}`}>
                                                    <i className="fa-brands fa-whatsapp" />
                                                </Link></li>
                                                <li><a href="#" className="text-dark" onClick={(e) => {
                                                    e.preventDefault();
                                                    if (typeof window !== 'undefined') {
                                                        const url = `${window.location.origin}/product/${selectedProduct?._id || selectedProduct?.id}`;
                                                        navigator.clipboard.writeText(url).then(() => alert('Product link copied to clipboard!'));
                                                    }
                                                }} title="Copy Link">
                                                    <i className="fa-solid fa-link" />
                                                </a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </CommanLayout>
    );
}
