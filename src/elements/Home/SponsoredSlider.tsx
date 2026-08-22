"use client"
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { ProductService } from "@/services/productService";

interface BrandType {
    _id: string;
    title: string;
    description: string;
    logo: string;
    bgImage: string;
}

const SponsoredSlider = () => {
    const [brands, setBrands] = useState<BrandType[]>([]);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const res = await ProductService.getPublicBrands();
                const list = res.data || [];
                setBrands(list.slice(0, 4));
            } catch (err) {
                console.error("Error fetching public brands:", err);
            }
        };
        fetchBrands();
    }, []);

    if (brands.length === 0) {
        return <div className="text-center py-4">No trusted brands found.</div>;
    }

    return (
        <Swiper 
            slidesPerView={4}
            spaceBetween={30}
            loop={brands.length > 4}            
            breakpoints={{
                1200: { slidesPerView: 4 },
                991: { slidesPerView: 3 },
                767: { slidesPerView: 2 },
                575: { slidesPerView: 1.5 },
                340: { slidesPerView: 1, centeredSlides: true },
            }}
            className="swiper swiper-company"
        >            
            {brands.map((item, i) => (
                <SwiperSlide key={item._id || i}>
                    <div className="company-box style-1 h-100 d-flex flex-column">
                        <div className="dz-media position-relative" style={{ height: '220px', width: '100%', overflow: 'hidden' }}>
                            <img 
                                src={item.bgImage} 
                                alt={item.title} 
                                className="company-img w-100 h-100" 
                                style={{ objectFit: 'cover' }} 
                            />
                            <div className="position-absolute top-50 start-50 translate-middle bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', padding: '10px' }}>
                                <img 
                                    src={item.logo} 
                                    alt={`${item.title} logo`} 
                                    className="logo w-100 h-100" 
                                    style={{ objectFit: 'contain', position: 'static', transform: 'none' }} 
                                />
                            </div>
                        </div>
                        <div className="dz-content flex-grow-1 d-flex flex-column justify-content-center">
                            <h6 className="title mb-1">{item.title}</h6>
                            <span className="sale-title text-truncate" style={{ display: 'block', maxWidth: '100%', fontSize: '13px' }}>{item.description}</span>
                        </div>		
                    </div>
                </SwiperSlide>
            ))}                
        </Swiper>
    );
};

export default SponsoredSlider;