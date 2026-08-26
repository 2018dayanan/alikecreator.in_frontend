
"use client";

import { useEffect, useState } from "react";
import IMAGES from "../constant/theme";
import {
    FooterMenu, OurStores,
    UsefulLinks,
    WidgetData
} from "../constant/Alldata";
import SubscribeNewsletter from "./SubscribeNewsletter";
import Image from "next/image";
import Link from "next/link";
import { ProductService } from "@/services/productService";

interface footertype {
    footerStyle?: string;
}

const Footer = (props: footertype) => {
    let year = new Date().getFullYear();
    const [recentPosts, setRecentPosts] = useState<any[]>([]);

    useEffect(() => {
        const fetchRecentNews = async () => {
            try {
                const res = await ProductService.getPublicNews(undefined, 1, 3);
                if (res.success && res.data && res.data.length > 0) {
                    setRecentPosts(res.data);
                }
            } catch (err) {
                // Ignore and use fallback
            }
        };
        fetchRecentNews();
    }, []);

    const fallbackPosts = [
        {
            _id: 'sample-1',
            title: 'Trendsetter Chronicles: Unveiling Latest in Fashion',
            image: typeof IMAGES.BlogPost3Pic1 === 'string' ? IMAGES.BlogPost3Pic1 : IMAGES.BlogPost3Pic1.src,
            date: '2025-05-17'
        },
        {
            _id: 'sample-2',
            title: 'Dress to Impress: Elevate Your Everyday Style',
            image: typeof IMAGES.BlogPostPic2 === 'string' ? IMAGES.BlogPostPic2 : IMAGES.BlogPostPic2.src,
            date: '2025-05-17'
        },
        {
            _id: 'sample-3',
            title: 'Chic & Unique: Personalized Fashion Finds',
            image: typeof IMAGES.BlogPostPic3 === 'string' ? IMAGES.BlogPostPic3 : IMAGES.BlogPostPic3.src,
            date: '2025-05-17'
        }
    ];

    const displayPosts = recentPosts.length > 0 ? recentPosts.slice(0, 3) : fallbackPosts;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Jan 23, 2025';
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? 'Jan 23, 2025' : d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <footer className={`site-footer ${props.footerStyle || "style-1"}`}>
            {/* <!-- Footer Top --> */}
            <div className="footer-top">
                <div className="container">
                    <div className="row justify-content-between">
                        <div className="col-xl-3 col-md-4 col-sm-6"  >
                            <div className="widget widget_about me-2">
                                <div className="footer-logo logo-white">
                                    <Link href={"/"}>
                                        {props.footerStyle === "footer-dark" ?
                                            <Image src={IMAGES.LogoWhite} alt="" />
                                            :
                                            <Image src={IMAGES.logo} alt="" />
                                        }

                                    </Link>
                                </div>
                                <ul className="widget-address">
                                    <li>
                                        <p><span>Address</span> : 75 C Park Street Kolkata 700016</p>
                                    </li>
                                    <li>
                                        <p><span>E-mail</span> : info@alikecreator.com</p>
                                    </li>
                                    <li>
                                        <p><span>Phone</span> : (064) 332-1233</p>
                                    </li>
                                </ul>
                                <div className="subscribe_widget">
                                    <h6 className="title fw-medium text-capitalize">subscribe to our newsletter</h6>
                                    <SubscribeNewsletter />
                                </div>
                            </div>
                        </div>

                        {/* Recent Posts Widget (3 Posts) */}
                        <div className="col-xl-3 col-md-4 col-sm-6">
                            <div className="widget widget_post">
                                <h5 className="footer-title">Recent Posts</h5>
                                <ul>
                                    {displayPosts.map((item, ind) => (
                                        <li key={item._id || ind} className="d-flex align-items-center mb-3">
                                            <div className="dz-media" style={{ width: '60px', height: '60px', overflow: 'hidden', borderRadius: '8px', flexShrink: 0, backgroundColor: '#f0f0f0' }}>
                                                <img
                                                    src={item.image || IMAGES.BlogPost3Pic1.src}
                                                    alt={item.title || item.name || "post"}
                                                    className="w-100 h-100 object-fit-cover"
                                                    onError={(e: any) => { e.target.src = IMAGES.BlogPost3Pic1.src; }}
                                                />
                                            </div>
                                            <div className="dz-content ms-3">
                                                <h6 className="name mb-1" style={{
                                                    fontSize: '14px',
                                                    lineHeight: '1.35',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    <Link href={`/news/${item._id}`}>
                                                        {item.title || item.name}
                                                    </Link>
                                                </h6>
                                                <span className="time small text-muted">
                                                    {formatDate(item.date || item.createdAt)}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="col-xl-2 col-md-4 col-sm-4 col-6">
                            <div className="widget widget_services">
                                <h5 className="footer-title">Useful Links</h5>
                                <ul>
                                    {UsefulLinks.map((item: any, i) => (
                                        <li key={i}><Link href={item.link || "#"}>{item.name}</Link></li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            {/*  Footer Top End  */}

            {/*  Footer Bottom  */}
            <div className="footer-bottom">
                <div className="container">
                    <div className="row fb-inner">
                        <div className="col-lg-6 col-md-12 text-start">
                            <p className="copyright-text">© <span className="current-year">{year}</span> <a href="https://www.Eonpulsetech.com/"> Eonpulsetech</a> Theme. All Rights Reserved.</p>
                        </div>
                        <div className="col-lg-6 col-md-12 text-end">
                            <div className="d-flex align-items-center justify-content-center justify-content-md-center justify-content-xl-end">
                                <span className="me-3">We Accept: </span>
                                <Image src={IMAGES.FooterImg} alt="" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*  Footer Bottom End  */}
        </footer>
    );
};

export default Footer;
