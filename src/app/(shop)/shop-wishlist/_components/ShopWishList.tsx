"use client";

import Link from "next/link";
import CommanBanner from "@/components/CommanBanner";
import IMAGES from "@/constant/theme";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "react-toastify";

export default function ShopWishList() {
    const { wishlist, removeFavorite, loading } = useWishlist();

    const handleAddToCart = (item: any) => {
        try {
            const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existingIndex = currentCart.findIndex((cartItem: any) => cartItem.id === (item.id || item._id));

            if (existingIndex !== -1) {
                currentCart[existingIndex].quantity = (currentCart[existingIndex].quantity || 1) + 1;
            } else {
                currentCart.push({
                    id: item.id || item._id,
                    _id: item.id || item._id,
                    name: item.title || item.name,
                    title: item.title || item.name,
                    price: item.price,
                    originalPrice: item.originalPrice,
                    image: item.image,
                    quantity: 1,
                    maxRedeemableCoins: item.maxRedeemableCoins || 0,
                    rewardCoins: item.rewardCoins || null
                });
            }

            localStorage.setItem('cart', JSON.stringify(currentCart));
            window.dispatchEvent(new Event('cartUpdated'));
            toast.success(`"${item.title || item.name}" added to cart!`);
        } catch (err) {
            console.error("Error adding to cart:", err);
            toast.error("Failed to add to cart");
        }
    };

    return (
        <div className="page-content bg-light">
            <CommanBanner parentText="Home" currentText="Wishlist" mainText="Wishlist" image={IMAGES.BackBg1.src} />
            <div className="content-inner-1">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading wishlist...</span>
                                    </div>
                                    <p className="mt-3 text-muted">Loading your favorite items...</p>
                                </div>
                            ) : wishlist.length === 0 ? (
                                <div className="card shadow-sm border-0 p-5 text-center rounded-4">
                                    <div className="mb-4">
                                        <div 
                                            className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                            style={{ width: '80px', height: '80px', backgroundColor: 'rgba(125, 28, 45, 0.1)', color: 'var(--primary)' }}
                                        >
                                            <i className="fa-regular fa-heart" style={{ fontSize: '36px' }} />
                                        </div>
                                    </div>
                                    <h3 className="fw-bold mb-2">Your Wishlist is Empty</h3>
                                    <p className="text-muted mb-4">
                                        Explore our collection and add your favorite items to your wishlist for easy shopping later.
                                    </p>
                                    <div>
                                        <Link href="/shop-list" className="btn btn-secondary px-4 py-2">
                                            Explore Products
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table check-tbl style-1">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Name</th>
                                                <th>Price</th>
                                                <th>Stock</th>
                                                <th>Action</th>
                                                <th className="text-end">Remove</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {wishlist.map((elem, ind) => {
                                                const prodId = elem.id || elem._id || `${ind}`;
                                                const isInStock = elem.inStock !== false;
                                                return (
                                                    <tr key={prodId}>
                                                        <td className="product-item-img">
                                                            {elem.image ? (
                                                                <img
                                                                    src={elem.image}
                                                                    alt={elem.title || "Product"}
                                                                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px' }}
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).src = IMAGES.ShopPorductPng1.src || '';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div 
                                                                    className="bg-light d-flex align-items-center justify-content-center"
                                                                    style={{ width: '80px', height: '80px', borderRadius: '12px' }}
                                                                >
                                                                    <i className="fa-regular fa-image text-muted" />
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="product-item-name">
                                                            <Link href="/shop-list" className="fw-medium text-dark">
                                                                {elem.title || elem.name}
                                                            </Link>
                                                        </td>
                                                        <td className="product-item-price">
                                                            <strong>₹{elem.price}</strong>
                                                            {elem.originalPrice && elem.originalPrice > elem.price ? (
                                                                <span className="ms-2 text-muted text-decoration-line-through">
                                                                    ₹{elem.originalPrice}
                                                                </span>
                                                            ) : null}
                                                        </td>
                                                        <td className="product-item-stock">
                                                            <span className={`badge ${isInStock ? 'bg-success' : 'bg-danger'} text-white`}>
                                                                {isInStock ? 'In Stock' : 'Out of Stock'}
                                                            </span>
                                                        </td>
                                                        <td className="product-item-totle">
                                                            {elem.purchaseType === 'external' && elem.externalLink ? (
                                                                <Link 
                                                                    href={elem.externalLink} 
                                                                    target="_blank" 
                                                                    className="btn btn-secondary btnhover text-nowrap"
                                                                >
                                                                    Buy Now <i className="fa-solid fa-arrow-up-right-from-square ms-1" />
                                                                </Link>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-secondary btnhover text-nowrap"
                                                                    onClick={() => handleAddToCart(elem)}
                                                                >
                                                                    Add To Cart
                                                                </button>
                                                            )}
                                                        </td>
                                                        <td className="product-item-close text-end">
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-danger rounded-circle p-2"
                                                                onClick={() => removeFavorite(prodId)}
                                                                title="Remove from Wishlist"
                                                                style={{ width: '36px', height: '36px' }}
                                                            >
                                                                <i className="ti-close" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}