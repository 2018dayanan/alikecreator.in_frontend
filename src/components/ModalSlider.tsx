"use client"
import {Swiper, SwiperSlide } from "swiper/react";
import IMAGES from "../constant/theme";
import { FreeMode, Thumbs } from "swiper/modules";
import { useState } from "react";
import LightGallery from 'lightgallery/react';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import Link from "next/link";
import Image from "next/image";

interface ModalSliderProps {
    images?: string[];
}

export default function ModalSlider({ images = [] }: ModalSliderProps){
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    
    // Filter out any null or undefined image paths
    const validImages = images?.filter(src => !!src) || [];
    
    // Fallback to default images if none provided
    const sliderData = validImages.length > 0 
        ? validImages.map(src => ({ src, isExternal: true })) 
        : [
            { src: IMAGES.productlady1, isExternal: false },
            { src: IMAGES.productlady2, isExternal: false },    
            { src: IMAGES.productlady3, isExternal: false },
        ];

    const thumbData = validImages.length > 0
        ? validImages.map(src => ({ src, isExternal: true }))
        : [
            { src: IMAGES.thumbproductlady1, isExternal: false },
            { src: IMAGES.thumbproductlady2, isExternal: false },
            { src: IMAGES.thumbproductlady3, isExternal: false },
        ];

    function hoverEffect(e: any) {
        const targetRect = e.target.getBoundingClientRect();
        let xValue = ((e.clientX - targetRect.left) / targetRect.width) * 50;
        let yValue = ((e.clientY - targetRect.top) / targetRect.height) * 50;
        e.target.setAttribute("style", `cursor: pointer; transition: 0.1s; transform: scale(1.5); transform-origin: ${xValue}% ${yValue}%`);
    }
    
    function removeHover(e: any) {
        e.target.setAttribute("style", `cursor: pointer; transition: 0.1s; transform: scale(1); transform-origin: 0% 0%`);
    }

    return(
        <>
            <LightGallery 
                plugins={[lgThumbnail, lgZoom]}
                selector={'.DZoomImage'}
            >
                <Swiper className="quick-modal-swiper2"
                    spaceBetween={0}
                    updateOnWindowResize={true}	                
                    thumbs={{ swiper: thumbsSwiper }}
                    modules={[Thumbs]} 
                >                
                    {sliderData.map((item, ind)=>(
                        <SwiperSlide id="lightgallery" key={ind}>
                            <div className="dz-media" style={{ position: "relative", width: "100%", aspectRatio: "3 / 4", overflow: "hidden" }}>
                                <Link className="mfp-link lg-item DZoomImage" href={item.isExternal ? item.src : (item.src as any).src} data-src={item.isExternal ? item.src : (item.src as any).src}>
                                    <i className="feather icon-maximize dz-maximize top-right z-1"/>
                                    {item.isExternal ? (
                                        <img src={item.src as string} alt="" className="d-none" />
                                    ) : (
                                        <Image src={item.src} alt="" className="d-none" /> 
                                    )}
                                </Link>
                                {item.isExternal ? (
                                    <img 
                                        src={item.src as string} 
                                        alt="slider" 
                                        onMouseEnter={hoverEffect}
                                        onMouseLeave={removeHover}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <Image src={item.src} alt="slider"                                  
                                        onMouseEnter={hoverEffect}
                                        onMouseLeave={removeHover}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                )}
                            </div>
                        </SwiperSlide>
                    ))}                    
                </Swiper>
            </LightGallery>
            <Swiper className="quick-modal-swiper thumb-swiper-lg thumb-sm swiper-vertical"
                spaceBetween={15}
                slidesPerView={4}
                freeMode={true}
                watchSlidesProgress={true}
                // @ts-ignore
                onSwiper={setThumbsSwiper}
                modules={[FreeMode, Thumbs]}
            >
                {thumbData.map((item, ind) => (
                    <SwiperSlide key={ind}>
                        <div style={{ position: "relative", width: "100%", aspectRatio: "3 / 4", overflow: "hidden", cursor: "pointer" }}>
                            {item.isExternal ? (
                                <img src={item.src as string} alt={`thumb${ind}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <Image src={item.src} alt={`thumb${ind}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </>
    )
}