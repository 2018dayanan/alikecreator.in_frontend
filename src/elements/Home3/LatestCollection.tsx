"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link";
import IMAGES from "../../constant/theme";
import SwiperTestimonial from "./SwiperTestimonial";
import Image from "next/image";
import { ProductService } from "@/services/productService";

interface CarouselBanner {
    _id?: string;
    image?: string;
    url?: string;
    title?: string;
}

export default function LatestoCollection() {
    const [banner, setBanner] = useState<CarouselBanner | null>(null);

    useEffect(() => {
        const fetchRandomCarouselBanner = async () => {
            try {
                const res = await ProductService.getPublicCarousels();
                const list: CarouselBanner[] = res.data || res.carousels || [];

                if (Array.isArray(list) && list.length > 0) {
                    // Pick a random carousel banner every time the page loads
                    const randomIndex = Math.floor(Math.random() * list.length);
                    const chosen = list[randomIndex];
                    setBanner({
                        image: chosen.image,
                        url: chosen.url && chosen.url.trim() ? chosen.url.trim() : "/shop-list",
                        title: chosen.title || "Discover Collection"
                    });
                }
            } catch (err) {
                console.error("Error fetching random carousel banner for Discover section:", err);
            }
        };

        fetchRandomCarouselBanner();
    }, []);

    const bannerLink = banner?.url || "/shop-list";

    return (
        <div className="row align-items-center">
            {/* Left Column: Random Carousel Banner with Dynamic Redirect Link */}
            <div className="col-lg-4 col-md-12 m-b30">
                <div className="dz-media style-2 wow fadeInUp" data-wow-delay="0.2s">
                    <Link href={bannerLink} className="d-block overflow-hidden rounded position-relative">
                        {banner?.image ? (
                            <img
                                src={banner.image}
                                alt={banner.title || "Discover collection banner"}
                                className="w-100 object-fit-cover shadow-sm"
                                style={{ minHeight: '380px', maxHeight: '460px', objectFit: 'cover', borderRadius: '12px', display: 'block' }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = IMAGES.AboutPic8.src || '';
                                }}
                            />
                        ) : (
                            <Image src={IMAGES.AboutPic8} alt="about" priority />
                        )}
                    </Link>
                </div>
            </div>

            {/* Right Column: Discover Latest Collection Slider */}
            <div className="col-lg-8 col-md-12 m-b30">
                <div className="about-wraper position-relative">
                    <div className="section-head style-1 wow fadeInUp d-lg-flex justify-content-between align-items-center" data-wow-delay="0.4s">
                        <h3 className="title">Discover latest collection</h3>
                        <Link href="/about-us" className="service-btn-2 wow fadeInUp position-relative light d-md-flex d-none" data-wow-delay="0.6s">
                            <span className="icon-wrapper">
                                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.832 31.1663L31.1654 12.833" stroke="var(--title)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M12.832 12.833H31.1654V31.1663" stroke="var(--title)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                            </span>
                        </Link>
                    </div>
                    <SwiperTestimonial />
                </div>
            </div>
        </div>
    );
}