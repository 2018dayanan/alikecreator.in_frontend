import Link from "next/link";

import UniqueFashionBlog from "@/elements/About/UniqueFashionBlog";


const AboutUs = () => {
    return (
        <div className="page-content bg-light">
            <section className="dz-bnr-inr dz-bnr-inr-sm bg-light">
                <div className="container">
                    <div className="dz-bnr-inr-entry ">
                        <div className="row align-items-center">
                            <div className="col-lg-7 col-md-7">
                                <div className="text-start mb-xl-0 mb-4">
                                    <h1>Your Fashion Journey Starts Here Discover Style at Alikecreator</h1>
                                    <nav aria-label="breadcrumb" className="breadcrumb-row">
                                        <ul className="breadcrumb">
                                            <li className="breadcrumb-item"><Link href={"/"}> Home</Link></li>
                                            <li className="breadcrumb-item">About us</li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                            <div className="col-lg-5 col-md-5 ">
                                <div className="about-sale  text-start">
                                    <div className="row">
                                        <div className="col-lg-5 col-md-6 col-6">
                                            <div className="about-content">
                                                <h2 className="title"><span className="counter">50</span>+</h2>
                                                <p className="text">Items Sale</p>
                                            </div>
                                        </div>
                                        <div className="col-lg-5 col-md-6 col-6">
                                            <div className="about-content">
                                                <h2 className="title">400%</h2>
                                                <p className="text">Return on investment </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="about-banner overflow-visible" style={{ backgroundImage: "url('/assets/images/background/bg2.jpg')" }}>
                <div className="about-info">
                    <h3 className="dz-title">
                        <Link href="/about-me">why Alikecreator?</Link>
                    </h3>
                    <p className="text mb-0">Alikecreator is a dynamic platform designed to empower creators, merchants, and brands by giving them the tools to easily showcase and sell their products. We bridge the gap between creative vision and e-commerce success by providing a seamless, customizable, and user-friendly shopping experience. Whether you're looking for unique, curated merchandise or trying to launch your own brand, Alikecreator is built to support your journey every step of the way.</p>
                </div>
            </section>
            <section className="content-inner">
                <UniqueFashionBlog />
            </section>
            <section className="get-in-touch">
                <div className="m-r100 m-md-r0 m-sm-r0">
                    <h3 className="dz-title mb-lg-0 mb-3">Questions ?
                        <span>Our experts will help find the grar that’s right for you</span>
                    </h3>
                </div>
                <Link href="/contact-us-1" className="btn btn-light">Get In Touch</Link>
            </section>
        </div>
    )
}
export default AboutUs;