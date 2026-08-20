"use client";

import Link from "next/link";
import IMAGES, { SVGICON } from "../../constant/theme";
import Image from "next/image";
import { useWishlist } from "@/context/WishlistContext";

export default function BestOfferBlog() {
    const { toggleFavorite, isFavorite } = useWishlist();
    const isFav = isFavorite("best-offer-item");

    return (
        <div className="cart-detail">
            <Link href={"#"} className="btn btn-outline-secondary w-100 m-b20">Bank Offer 5% Cashback</Link>
            <div className="icon-bx-wraper style-4 m-b15">
                <div className="icon-bx">
                    <i className="flaticon flaticon-ship" />
                </div>
                <div className="icon-content">
                    <span className=" font-14">Easy Returns</span>
                    <h6 className="dz-title">30 Days</h6>
                </div>
            </div>
            <div className="icon-bx-wraper style-4 m-b30">
                <div className="icon-bx">
                    <Image src={IMAGES.ShopIconBox} alt="/" />
                </div>
                <div className="icon-content">
                    <h6 className="dz-title">Enjoy The Product</h6>
                    <p>Lorem Ipsum is simply dummy text of the printing and typesetting</p>
                </div>
            </div>
            <div className="save-text">
                <i className="icon feather icon-check-circle" />
                <span className="m-l10">You will save ₹504 on this order</span>
            </div>
            <table>
                <tbody>
                    <tr className="total">
                        <td>
                            <h6 className="mb-0">Total</h6>
                        </td>
                        <td className="price">
                            ₹125.75
                        </td>
                    </tr>
                </tbody>
            </table>
            <button
                type="button"
                className={`btn ${isFav ? 'btn-primary' : 'btn-outline-secondary'} btn-icon m-b20 w-100`}
                onClick={() => toggleFavorite({ id: "best-offer-item", title: "Special Offer Product", price: 125.75 })}
            >
                <svg width="19" height="17" viewBox="0 0 19 17" fill={isFav ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg"
                    dangerouslySetInnerHTML={{ __html: SVGICON.BlankHeart }}
                >
                </svg>
                {isFav ? "In Wishlist" : "Add To Wishlist"}
            </button>
            <Link href="/shop-cart" className="btn btn-secondary w-100">ADD TO CART</Link>
        </div>
    );
}