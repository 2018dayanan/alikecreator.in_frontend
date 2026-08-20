"use client";

import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";

interface varibleType {
    id?: string | number;
    image: any;
    title: string;
    price?: string;
    inputtype?: string;
}

export default function ShopListCard(props: varibleType) {
    const { toggleFavorite, isFavorite } = useWishlist();
    const itemId = props.id || props.title;
    const isFav = isFavorite(String(itemId));

    const handleToggle = () => {
        const numPrice = props.price ? parseFloat(props.price.replace(/[^0-9.]/g, '')) || 0 : 0;
        const imgUrl = typeof props.image === 'string' ? props.image : (props.image as any)?.src || '';
        toggleFavorite({
            id: itemId,
            _id: itemId,
            title: props.title,
            name: props.title,
            price: numPrice,
            image: imgUrl
        });
    };

    return (
        <div className="dz-shop-card style-2">
            <div className="dz-media">
                <Image src={props.image} alt="shop" />
            </div>
            <div className="dz-content">
                <div className="dz-header">
                    <div>
                        <h4 className="title mb-0"><Link href="/shop-list">{props.title}</Link></h4>
                        <ul className="dz-tags">
                            <li><Link href="/shop-with-category">Accessories,</Link></li>
                            <li><Link href="/shop-with-category">Sunglasses</Link></li>
                        </ul>
                    </div>
                    <div className="review-num">
                        <ul className="dz-rating">
                            <li className="star-fill"><i className="flaticon-star-1" /></li>
                            <li className="star-fill"><i className="flaticon-star-1" /></li>
                            <li className="star-fill"><i className="flaticon-star-1" /></li>
                            <li><i className="flaticon-star-1" /></li>
                            <li><i className="flaticon-star-1" /></li>
                        </ul>
                        <span><Link href="#"> 250 Review</Link></span>
                    </div>
                </div>
                <div className="dz-body">
                    <div className="dz-rating-box">
                        <div>
                            <p className="dz-para">High quality crafted item made with premium materials for everyday style.</p>
                        </div>
                    </div>
                    <div className="rate">
                        <div className="d-flex align-items-center mb-xl-3 mb-2">
                            <div className="meta-content m-0">
                                <span className="price-name">Price</span>
                                <span className="price">{props.price}</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <Link href="/shop-cart" className="btn btn-secondary btn-md btn-icon">
                                <i className="icon feather icon-shopping-cart d-md-none d-block" />
                                <span className="d-md-block d-none">Add to cart</span>
                            </Link>
                            <div className="bookmark-btn style-1">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={props.inputtype || `fav-${props.title}`}
                                    checked={isFav}
                                    onChange={handleToggle}
                                />
                                <label className="form-check-label" htmlFor={props.inputtype || `fav-${props.title}`}>
                                    <i className="fa-solid fa-heart" />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}