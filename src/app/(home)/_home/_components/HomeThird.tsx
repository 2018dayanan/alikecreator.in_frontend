"use client"
import { Fragment } from "react"
import Link from "next/link";
import LatestoCollection from "@/elements/Home3/LatestCollection";
import MainBanner3 from "@/elements/Home3/MainBanner3";
import ProductSection from "@/elements/Home/ProductSection";
import SummerSaleBlog from "@/elements/Home/SummerSaleBlog";
import AllProduction from "@/elements/Home/AllProduction";
import OffersectionSlider from "@/elements/Home/OffersectionSlider";
import SponsoredSlider from "@/elements/Home/SponsoredSlider";
import LatestPostSection from "@/elements/Home3/LatestPostSection";

const HomeThird = () => {
    return (
        <Fragment>
            <MainBanner3 />
            <section className="content-inner overflow-hidden bg-light-dark">
                <div className="container">
                    <LatestoCollection />
                </div>
            </section>
            <section className="content-inner">
                <div className="container">
                    <ProductSection />
                </div>
            </section>
            <section className=" adv-area">
                <div className="container-fluid px-0">
                    <SummerSaleBlog />
                </div>
            </section>
            <section className="content-inner-2 overflow-hidden">
                <div className="container">
                    <AllProduction />
                </div>
            </section>
            <section className="content-inner-2">
                <div className="container">
                    <div
                        className="section-head style-1 wow fadeInUp d-flex justify-content-between m-b30"
                        data-wow-delay="0.2s"
                    >
                        <div className="left-content">
                            <h2 className="title">Featured offer for you</h2>
                        </div>
                        <Link
                            href="/shop-list"
                            className="text-secondary font-14 d-flex align-items-center gap-1"
                        >
                            See All
                            <i className="icon feather icon-chevron-right font-18" />
                        </Link>
                    </div>
                </div>
                <div className="container-fluid px-3">
                    <OffersectionSlider />
                </div>
            </section>
            <section className="content-inner-2">
                <div className="container">
                    <div
                        className="section-head style-1 wow fadeInUp d-flex  justify-content-between"
                        data-wow-delay="0.2s"
                    >
                        <div className="left-content">
                            <h2 className="title">Sponsored</h2>
                        </div>
                        <Link
                            href="/shop-list"
                            className="text-secondary font-14 d-flex align-items-center gap-1"
                        >
                            See All
                            <i className="icon feather icon-chevron-right font-18" />
                        </Link>
                    </div>
                    <SponsoredSlider />
                </div>
            </section>
            <section className="content-inner ">
                <LatestPostSection />
            </section>
        </Fragment>
    )
}
export default HomeThird;