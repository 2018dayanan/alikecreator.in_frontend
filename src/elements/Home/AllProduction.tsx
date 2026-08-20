"use client"
import React, { useEffect, useState } from "react";
import IMAGES from "../../constant/theme";
import Link from "next/link";
import ProductRollup from '../../components/ProductRollup';
import Image from "next/image";
import { ProductService } from "@/services/productService";
import VideoModal from "@/components/VideoModal";

interface CarouselBanner {
    _id?: string;
    image?: string;
    url?: string;
    title?: string;
}

interface ProductCardItem {
    _id: string;
    title: string;
    image: string;
    price?: number;
    discount?: number | null;
    badge?: string | null;
    link: string;
    video?: string | null;
}

const AllProduction = () => {
    const [banner, setBanner] = useState<CarouselBanner | null>(null);
    const [products, setProducts] = useState<ProductCardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                // 1. Fetch Random Carousel Banner for the Left Side Image
                const carouselRes = await ProductService.getPublicCarousels();
                const carouselList: CarouselBanner[] = carouselRes.data || carouselRes.carousels || [];
                if (isMounted && Array.isArray(carouselList) && carouselList.length > 0) {
                    const randomBanner = carouselList[Math.floor(Math.random() * carouselList.length)];
                    setBanner({
                        image: randomBanner.image,
                        url: randomBanner.url && randomBanner.url.trim() ? randomBanner.url.trim() : "/shop-list",
                        title: randomBanner.title || "Featured Banner"
                    });
                }

                // 2. Fetch Discover Collection / Random Products for the Right Side
                const discoverRes = await ProductService.getPublicDiscover();
                const discoverList = discoverRes.data || [];

                if (isMounted && Array.isArray(discoverList) && discoverList.length > 0) {
                    const shuffled = [...discoverList].sort(() => 0.5 - Math.random()).slice(0, 3);
                    const mapped: ProductCardItem[] = shuffled.map((item: any, idx: number) => {
                        const prod = item.productId || item;
                        const img = prod.image || (Array.isArray(prod.images) && prod.images[0]) || '';
                        const title = item.customTitle || prod.title || `Featured Item ${idx + 1}`;
                        const catName = typeof prod.categoryId === 'object' ? prod.categoryId?.name : null;
                        const badge = item.customBadge || catName || (prod.discount ? `Save ${prod.discount}%` : "Trending");
                        const link = prod.externalLink || "/shop-list";

                        return {
                            _id: item._id || prod._id || `item-${idx}`,
                            title,
                            image: img,
                            price: prod.price,
                            discount: prod.discount,
                            badge,
                            link,
                            video: prod.video || null
                        };
                    });
                    setProducts(mapped);
                } else if (isMounted) {
                    const randomRes = await ProductService.getRandomProducts(3);
                    const randomList = randomRes.data || [];
                    if (Array.isArray(randomList) && randomList.length > 0) {
                        const mapped: ProductCardItem[] = randomList.slice(0, 3).map((prod: any, idx: number) => {
                            const img = prod.image || (Array.isArray(prod.images) && prod.images[0]) || '';
                            const catName = typeof prod.categoryId === 'object' ? prod.categoryId?.name : null;
                            const badge = catName || (prod.discount ? `Up to ${prod.discount}% off` : "Special Deal");

                            return {
                                _id: prod._id || `prod-${idx}`,
                                title: prod.title,
                                image: img,
                                price: prod.price,
                                discount: prod.discount,
                                badge,
                                link: prod.externalLink || "/shop-list",
                                video: prod.video || null
                            };
                        });
                        setProducts(mapped);
                    }
                }
            } catch (err) {
                console.error("Error loading AllProduction section data:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    const bannerLink = banner?.url || "/shop-list";

    return (
        <div className="row align-items-xl-center align-items-start">
            {/* Left Column: Random Carousel Banner with Clickable Redirect Link */}
            <div className="col-lg-5 col-md-12 m-b30 align-self-center">
                <div className="dz-media style-1 img-ho1 overflow-hidden rounded-3 shadow-sm">
                    <Link href={bannerLink} className="d-block" title={banner?.title || "Explore collection"}>
                        {banner?.image ? (
                            <img
                                src={banner.image}
                                alt={banner.title || "Featured banner"}
                                className="w-100 object-fit-cover"
                                style={{ maxHeight: '520px', minHeight: '380px', objectFit: 'cover', display: 'block', borderRadius: '12px' }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = IMAGES.AboutPic3.src || '';
                                }}
                            />
                        ) : (
                            <Image src={IMAGES.AboutPic3} alt="shop" priority />
                        )}
                    </Link>
                </div>
            </div>

            {/* Right Column: Discover & Trending Products */}
            <div className="col-lg-7 col-md-12 col-sm-12">
                <div className="row justify-content-between align-items-center">
                    <div className="col-lg-8 col-md-8 col-sm-12">
                        <div className="section-head style-1">
                            <div className="left-content">
                                <h2 className="title">Discover Latest Trending Picks For You</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-12 text-md-end">
                        <Link href="/shop-list" className="icon-button d-md-block d-none ms-md-auto m-b30">
                            <div className="text-row word-rotate-box c-black">
                                <ProductRollup />
                                <svg
                                    className="badge__emoji"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="40"
                                    height="40"
                                    viewBox="0 0 40 40"
                                    fill="none"
                                >
                                    <path
                                        d="M31.3072 10.7239L39.5891 19.0059C39.8523 19.2696 40.0001 19.627 40.0001 19.9995C40.0001 20.3721 39.8523 20.7295 39.5891 20.9932L31.3072 29.2752C31.1236 29.4582 30.8748 29.5608 30.6156 29.5606C30.3564 29.5604 30.1078 29.4573 29.9245 29.274C29.7412 29.0907 29.6381 28.8422 29.6379 28.5829C29.6377 28.3237 29.7404 28.075 29.9234 27.8913L36.8368 20.9781L0.978516 20.9781C0.718997 20.9781 0.470108 20.875 0.2866 20.6915C0.103093 20.508 -1.17109e-07 20.2591 -1.14015e-07 19.9995C-1.1092e-07 19.74 0.103093 19.4911 0.2866 19.3076C0.470108 19.1241 0.718997 19.021 0.978516 19.021L36.8368 19.021L29.9234 12.1077C29.7404 11.9241 29.6377 11.6754 29.6379 11.4162C29.6381 11.1569 29.7412 10.9084 29.9245 10.7251C30.1078 10.5418 30.3564 10.4387 30.6156 10.4385C30.8748 10.4383 31.1236 10.5409 31.3072 10.7239Z"
                                        fill="black"
                                    />
                                </svg>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="row g-3">
                    {products.length > 0 ? (
                        products.map((item) => (
                            <div className="col-lg-4 col-md-4 col-sm-6 m-b15" key={item._id}>
                                <div className="shop-card style-5 h-100 border rounded-3 p-2 shadow-sm bg-white position-relative">
                                    {item.video && (
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-3 rounded-pill d-flex align-items-center gap-1 shadow-sm border-0"
                                            style={{ zIndex: 5, padding: "3px 8px", fontSize: "10px", fontWeight: "600" }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setActiveVideo({ url: item.video!, title: item.title });
                                            }}
                                            title="Watch Video"
                                        >
                                            <i className="fa-brands fa-youtube" style={{ fontSize: "12px" }} />
                                            <span>Video</span>
                                        </button>
                                    )}
                                    <div
                                        className="dz-media rounded overflow-hidden mb-2 d-flex align-items-center justify-content-center bg-light"
                                        style={{ height: '180px' }}
                                    >
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = IMAGES.ShopPorductPng1.src || '';
                                                }}
                                            />
                                        ) : (
                                            <Image src={IMAGES.ShopPorductPng1} alt="product" />
                                        )}
                                    </div>
                                    <div className="dz-content p-1 d-flex flex-column">
                                        <div>
                                            {item.badge && (
                                                <span className="sale-title badge bg-warning text-dark px-2 py-1 mb-1 small fw-bold">
                                                    {item.badge}
                                                </span>
                                            )}
                                            <h6 className="title mb-1 text-truncate" title={item.title}>
                                                <Link href={item.link} className="text-dark fw-semibold">
                                                    {item.title}
                                                </Link>
                                            </h6>
                                        </div>
                                        <div className="mt-auto pt-1">
                                            <h6 className="price text-primary fw-bold mb-0">
                                                ₹{item.price ?? '—'}
                                            </h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        [1, 2, 3].map((i) => (
                            <div className="col-lg-4 col-md-4 col-sm-6 m-b15" key={i}>
                                <div className="shop-card style-5 h-100 border rounded-3 p-2 shadow-sm bg-white">
                                    <div className="dz-media rounded overflow-hidden mb-2 d-flex align-items-center justify-content-center bg-light" style={{ height: '180px' }}>
                                        <Image src={IMAGES.ShopPorductPng1} alt="shop" />
                                    </div>
                                    <div className="dz-content p-1">
                                        <span className="sale-title badge bg-secondary text-white px-2 py-1 mb-1 small">Featured</span>
                                        <h6 className="title mb-1 text-truncate"><Link href="/shop-list" className="text-dark">Featured Collection</Link></h6>
                                        <h6 className="price text-primary fw-bold mb-0">₹99</h6>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Video Popup Modal */}
            <VideoModal
                show={Boolean(activeVideo)}
                onHide={() => setActiveVideo(null)}
                videoUrl={activeVideo?.url}
                title={activeVideo?.title}
            />
        </div>
    );
};

export default AllProduction;