'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import IMAGES from '../../constant/theme';
import { ProductService } from '@/services/productService';

interface NewsItem {
    _id: string;
    title: string;
    description: string;
    image?: string;
    date?: string;
    createdAt?: string;
    merchantId?: {
        name?: string;
        business_name?: string;
        subdomain?: string;
    };
}

export default function LatestPostSection() {
    const [newsList, setNewsList] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await ProductService.getPublicNews(undefined, 1, 3);
                if (res.success && res.data && res.data.length > 0) {
                    setNewsList(res.data);
                }
            } catch (err) {
                console.error("Failed to load public news:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    // Fallback static items if backend has no news yet
    const fallbackNews: NewsItem[] = [
        {
            _id: 'sample-1',
            title: 'Trendsetter Chronicles: Unveiling the Latest in Fashion',
            description: 'Discover the upcoming trends, color palettes, and silhouettes that will dominate this season.',
            image: typeof IMAGES.BlogPost3Pic1 === 'string' ? IMAGES.BlogPost3Pic1 : IMAGES.BlogPost3Pic1.src,
            date: '2025-05-17'
        },
        {
            _id: 'sample-2',
            title: 'Dress to Impress: Elevate Your Everyday Style',
            description: 'Simple styling tips and wardrobe essentials to elevate your everyday lifestyle.',
            image: typeof IMAGES.BlogPostPic2 === 'string' ? IMAGES.BlogPostPic2 : IMAGES.BlogPostPic2.src,
            date: '2025-05-17'
        },
        {
            _id: 'sample-3',
            title: 'Chic & Unique: Personalized Fashion Finds',
            description: 'Explore exclusive handcrafted styles tailored uniquely to reflect your personality.',
            image: typeof IMAGES.BlogPostPic3 === 'string' ? IMAGES.BlogPostPic3 : IMAGES.BlogPostPic3.src,
            date: '2025-05-17'
        }
    ];

    const displayNews = newsList.length > 0 ? newsList : fallbackNews;
    const mainPost = displayNews[0];
    const sidePosts = displayNews.slice(1, 3);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Latest';
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? 'Latest' : d.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="container">
            <div className="section-head style-1 wow fadeInUp d-md-flex justify-content-between align-items-center" data-wow-delay="0.1s">
                <div className="left-content">
                    <h2 className="title">Latest Updates </h2>
                    <p>Stay updated with our latest announcements, trends, and stories.</p>
                </div>
                <Link className="btn btn-secondary" href="/news">View all update</Link>
            </div>
            <div className="row blog-shap">
                {/* Main Featured News Card (Left) */}
                {mainPost && (
                    <div className="col-lg-6 col-md-12 col-sm-12 m-b30 wow fadeInUp" data-wow-delay="0.1s">
                        <div className="dz-card style-1 light h-100 d-flex flex-column">
                            <div className="dz-media" style={{ height: '320px', overflow: 'hidden', backgroundColor: '#f0f0f0' }}>
                                <img
                                    src={mainPost.image || IMAGES.BlogPost3Pic1.src}
                                    alt={mainPost.title}
                                    className="w-100 h-100 object-fit-cover"
                                    onError={(e: any) => { e.target.src = IMAGES.BlogPost3Pic1.src; }}
                                />
                            </div>
                            <div className="dz-info bg-white flex-grow-1 d-flex flex-column">
                                <div className="dz-meta d-flex align-items-center justify-content-between mb-2">
                                    <ul>
                                        <li className="post-date text-primary fw-semibold">
                                            📅 {formatDate(mainPost.date || mainPost.createdAt)}
                                        </li>
                                    </ul>
                                    {mainPost.merchantId && (
                                        <span className="badge bg-light text-dark border">
                                            {mainPost.merchantId.business_name || mainPost.merchantId.name}
                                        </span>
                                    )}
                                </div>
                                <h3 className="dz-title mb-2">
                                    <Link href={`/news/${mainPost._id}`}>
                                        {mainPost.title}
                                    </Link>
                                </h3>
                                <p className="text-muted small mb-3 text-truncate-2" style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {mainPost.description}
                                </p>
                                <Link href={`/news/${mainPost._id}`} className="font-14 mt-auto read-btn fw-bold text-primary">
                                    Read More <i className="icon feather icon-chevron-right ms-1"></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Secondary News Cards (Right) */}
                <div className="col-lg-6 col-md-12 col-sm-12 m-b30 wow fadeInUp" data-wow-delay="0.1s">
                    <div className="row">
                        {sidePosts.map((post, idx) => (
                            <div key={post._id || idx} className="col-lg-12 col-md-6 m-b30">
                                <div className="dz-card blog-half style-7 bg-white shadow-sm rounded overflow-hidden">
                                    <div className="dz-media" style={{ height: '170px', width: '200px', flexShrink: 0, overflow: 'hidden' }}>
                                        <img
                                            src={post.image || (idx === 0 ? IMAGES.BlogPostPic2.src : IMAGES.BlogPostPic3.src)}
                                            alt={post.title}
                                            className="w-100 h-100 object-fit-cover"
                                            onError={(e: any) => { e.target.src = idx === 0 ? IMAGES.BlogPostPic2.src : IMAGES.BlogPostPic3.src; }}
                                        />
                                    </div>
                                    <div className="dz-info d-flex flex-column justify-content-between p-3">
                                        <div>
                                            <div className="dz-meta mb-1">
                                                <span className="post-date small text-primary fw-semibold">
                                                    📅 {formatDate(post.date || post.createdAt)}
                                                </span>
                                                {post.merchantId && (
                                                    <span className="badge bg-light text-dark border ms-2 small">
                                                        {post.merchantId.business_name || post.merchantId.name}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="dz-title mb-1" style={{ fontSize: '17px', lineHeight: '1.4' }}>
                                                <Link href={`/news/${post._id}`} className="text-dark">
                                                    {post.title}
                                                </Link>
                                            </h4>
                                            <p className="text-muted small mb-2" style={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {post.description}
                                            </p>
                                        </div>
                                        <Link href={`/news/${post._id}`} className="font-14 mt-auto read-btn fw-bold text-primary">
                                            Read More <i className="icon feather icon-chevron-right ms-1" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}