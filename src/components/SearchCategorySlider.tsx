"use client"

import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ProductService } from "@/services/productService";

export default function SearchCategorySlider() {
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await ProductService.getRandomProducts(10);
                if (response.success && response.data) {
                    setProducts(response.data);
                }
            } catch (error) {
                console.error("Error fetching random products:", error);
            }
        };

        fetchProducts();
    }, []);

    if (products.length === 0) return null;

    return (
        <Swiper className="category-swiper2"
            slidesPerView={6}
            centeredSlides={false}
            spaceBetween={20}
            loop={true}
            autoplay={{
                delay: 3000,
            }}
            breakpoints={{
                1600: {
                    slidesPerView: 6,
                    spaceBetween: 40,
                },
                1200: {
                    slidesPerView: 6,
                    spaceBetween: 20,
                },
                991: {
                    slidesPerView: 4,
                    spaceBetween: 20,
                },
                591: {
                    slidesPerView: 3,
                    spaceBetween: 15,
                },
                320: {
                    slidesPerView: 2,
                    spaceBetween: 15,
                },
            }}
        >
            {products.map((elem, ind) => (
                <SwiperSlide key={ind}>
                    <div className="shop-card">
                        <div className="dz-media">
                            {/* Assuming images is an array and we want the first one. Also fallback image could be useful */}
                            <Image src={elem.images?.[0] || "/assets/images/default-product.png"} alt={elem.title || "Product"} width={200} height={200} />
                        </div>
                        <div className="dz-content">
                            <h6 className="title"><Link href={`/product/${elem.slug || elem._id}`}>{elem.title}</Link></h6>
                            <h6 className="price">₹{elem.price}</h6>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    )
}