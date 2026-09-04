"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link";
import IMAGES from "../../constant/theme";
import Image from "next/image";
import { ProductService } from "@/services/productService";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";

interface CarouselBanner {
	_id?: string;
	title?: string;
	description?: string;
	image?: string;
	url?: string;
	order?: number;
}

export default function MainBanner3() {
	const [banners, setBanners] = useState<CarouselBanner[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchCarousels = async () => {
			try {
				const res = await ProductService.getPublicCarousels();
				const list: CarouselBanner[] = res.data || res.carousels || [];
				if (Array.isArray(list) && list.length > 0) {
					setBanners(list);
				}
			} catch (err) {
				console.error("Error fetching homepage carousel banners:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchCarousels();
	}, []);

	// Default fallback banner data
	const defaultBanner: CarouselBanner = {
		title: "Make your fashion look more charming",
		description: "Earn Reward Coins with every purchase and use them on your next order at AlikeCreator. 1 Reward Coin = ₹1, Let’s explore a whole new shopping experience!",
		url: "/shop-cart",
	};

	const displayBanners = banners.length > 0 ? banners : [defaultBanner];

	if (displayBanners.length > 1) {
		return (
			<div className="main-slider style-3 position-relative">
				<Swiper
					modules={[Autoplay, EffectFade, Pagination]}
					effect="fade"
					fadeEffect={{ crossFade: true }}
					speed={1000}
					loop={true}
					autoplay={{
						delay: 5000,
						disableOnInteraction: false,
					}}
					pagination={{
						clickable: true,
					}}
					className="main-banner-swiper"
				>
					{displayBanners.map((banner, index) => {
						const title = banner.title || defaultBanner.title;
						const description = banner.description || defaultBanner.description;
						const url = banner.url && banner.url.trim() ? banner.url.trim() : "/shop-cart";
						const bannerImg = banner.image;

						return (
							<SwiperSlide key={banner._id || index}>
								<div className="container">
									<div className="banner-content">
										<div className="row gx-0 align-items-center">
											<div className="col-md-12 col-lg-8 align-self-center">
												<div className="inner-content">
													<div className="content-info">
														<h1 className="title mb-4 wow flipInX animated" data-wow-delay="0.5s">
															{title}
														</h1>
														<p className="text" data-swiper-parallax="-40">
															{description}
														</p>
														<div className="content-btn m-b30 wow fadeInUp" data-wow-delay="0.8s" data-swiper-parallax="-60">
															<Link
																className="btn btn-secondary btn-lg me-xl-3 me-2 btnhover20"
																href={url}
															>
																Buy Now
															</Link>
														</div>
													</div>
												</div>
											</div>
											<div className="col-md-12 col-lg-4">
												<div className="banner-media">
													<div className="img-preview wow slideInRight" data-wow-delay="0.1s" data-wow-duration="1.5s">
														{bannerImg ? (
															<img
																src={bannerImg}
																alt={title || "banner-media"}
																className="img-fluid"
																style={{ maxHeight: '420px', width: 'auto', objectFit: 'contain' }}
																onError={(e) => {
																	(e.target as HTMLImageElement).src = IMAGES.Bannermedia3.src || '';
																}}
															/>
														) : (
															<Image src={IMAGES.Bannermedia3} alt="banner-media" priority />
														)}
													</div>
													<div className="star">
														<svg xmlns="http://www.w3.org/2000/svg" width="68" height="68" viewBox="0 0 68 68" fill="none">
															<path d="M34 0L43.6167 24.3833L68 34L43.6167 43.6167L34 68L24.3833 43.6167L0 34L24.3833 24.3833L34 0Z" fill="black" />
														</svg>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</SwiperSlide>
						);
					})}
				</Swiper>
			</div>
		);
	}

	// Single Banner Render
	const singleBanner = displayBanners[0];
	const title = singleBanner.title || defaultBanner.title;
	const description = singleBanner.description || defaultBanner.description;
	const url = singleBanner.url && singleBanner.url.trim() ? singleBanner.url.trim() : "/shop-cart";
	const bannerImg = singleBanner.image;

	return (
		<div className="main-slider style-3">
			<div className="container">
				<div className="banner-content">
					<div className="row gx-0 align-items-center">
						<div className="col-md-12 col-lg-8 align-self-center">
							<div className="inner-content">
								<div className="content-info">
									<h1 className="title mb-4 wow flipInX animated" data-wow-delay="0.5s">
										{title}
									</h1>
									<p className="text" data-swiper-parallax="-40">
										{description}
									</p>
									<div className="content-btn m-b30 wow fadeInUp" data-wow-delay="0.8s" data-swiper-parallax="-60">
										<Link className="btn btn-secondary btn-lg me-xl-3 me-2 btnhover20" href={url}>
											Buy Now
										</Link>
									</div>
								</div>
							</div>
						</div>
						<div className="col-md-12 col-lg-4">
							<div className="banner-media">
								<div className="img-preview wow slideInRight" data-wow-delay="0.1s" data-wow-duration="1.5s">
									{bannerImg ? (
										<img
											src={bannerImg}
											alt={title || "banner-media"}
											className="img-fluid"
											style={{ maxHeight: '420px', width: 'auto', objectFit: 'contain' }}
											onError={(e) => {
												(e.target as HTMLImageElement).src = IMAGES.Bannermedia3.src || '';
											}}
										/>
									) : (
										<Image src={IMAGES.Bannermedia3} alt="banner-media" priority />
									)}
								</div>
								<div className="star">
									<svg xmlns="http://www.w3.org/2000/svg" width="68" height="68" viewBox="0 0 68 68" fill="none">
										<path d="M34 0L43.6167 24.3833L68 34L43.6167 43.6167L34 68L24.3833 43.6167L0 34L24.3833 24.3833L34 0Z" fill="black" />
									</svg>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}