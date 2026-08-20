"use client";

import Link from "next/link";
import { SVGICON } from "../constant/theme";
import { modalCategoryBlog } from "../constant/Alldata";
import ProductInputButton from "../elements/Shop/ProductInputButton";
import { useWishlist } from "@/context/WishlistContext";

export default function BasicModalData() {
    const { toggleFavorite, isFavorite } = useWishlist();

    const sampleProduct = {
        id: "sample-cardigan-01",
        title: "Cozy Knit Cardigan Sweater",
        name: "Cozy Knit Cardigan Sweater",
        price: 125.75,
        originalPrice: 132.17,
        image: ""
    };

    const isFav = isFavorite(sampleProduct.id);

    return (
        <>
            <div className="dz-product-detail style-2 ps-xl-3 ps-0 pt-2 mb-0">
                <div className="dz-content">
                    <div className="dz-content-footer">
                        <div className="dz-content-start">
                            <span className="badge bg-secondary mb-2">SALE 20% Off</span>
                            <h4 className="title mb-1"><Link href="/shop-list">{sampleProduct.title}</Link></h4>
                            <div className="review-num">
                                <ul className="dz-rating me-2">
                                    <li className="star-fill"><i className="flaticon-star-1" /></li>
                                    <li className="star-fill"><i className="flaticon-star-1" /></li>
                                    <li className="star-fill"><i className="flaticon-star-1" /></li>
                                    <li><i className="flaticon-star-1" /></li>
                                    <li><i className="flaticon-star-1" /></li>
                                </ul>
                                <span className="text-secondary me-2">4.7 Rating</span>
                                <Link href="#">(5 customer reviews)</Link>
                            </div>
                        </div>
                    </div>
                    <p className="para-text">
                        High quality comfortable knit sweater for all occasions.
                    </p>
                    <div className="meta-content m-b20 d-flex align-items-end">
                        <div className="me-3">
                            <span className="form-label">Price</span>
                            <span className="price">₹{sampleProduct.price} <del>₹{sampleProduct.originalPrice}</del></span>
                        </div>
                        <div className="btn-quantity light me-0">
                            <label className="form-label">Quantity</label>
                            <ProductInputButton />
                        </div>
                    </div>
                    <div className=" cart-btn">
                        <Link href="/shop-cart" className="btn btn-secondary text-uppercase">Add To Cart</Link>
                        <button
                            type="button"
                            className={`btn btn-md ${isFav ? 'btn-primary' : 'btn-outline-secondary'} btn-icon`}
                            onClick={() => toggleFavorite(sampleProduct)}
                        >
                            <svg width="19" height="17" viewBox="0 0 19 17" fill={isFav ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg" dangerouslySetInnerHTML={{ __html: SVGICON.BlankHeart }}></svg>
                            {isFav ? "In Wishlist" : "Add To Wishlist"}
                        </button>
                    </div>
                    <div className="dz-info mb-0">
                        <ul>
                            <li><strong>SKU:</strong></li>
                            <li>PRT584E63A</li>
                        </ul>
                        <ul>
                            <li><strong>Category:</strong></li>
                            {modalCategoryBlog.map((elem, ind) => (
                                <li key={ind}><Link href="/shop-standard">{elem.name}</Link></li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}