"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import CommanLayout from "@/components/CommanLayout";
import CommanBanner from "@/components/CommanBanner";
import IMAGES from "@/constant/theme";
import { ProductService } from "@/services/productService";

interface PhotoItem {
    id: string;
    url: string;
    alt: string;
    category?: string;
}

export default function PhotosPage() {
    const [photos, setPhotos] = useState<PhotoItem[]>([]);
    const [categories, setCategories] = useState<string[]>(["All"]);
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [loading, setLoading] = useState(true);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

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
                                category: catName
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
                                        category: catName
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
                                            onClick={() => setSelectedPhotoIndex(index)}
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
                                                {/* Hover Overlay with Zoom Icon */}
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
                                                        style={{ width: '48px', height: '48px', color: 'var(--primary)' }}
                                                    >
                                                        <i className="fa-solid fa-magnifying-glass-plus" style={{ fontSize: '18px' }} />
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
        </CommanLayout>
    );
}
