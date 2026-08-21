import Link from "next/link";
import { useReducer, useEffect, useState, useRef } from "react";

import { Modal, Spinner, Alert } from "react-bootstrap";
import { masonryData, headfilterData } from "../../constant/Alldata";
import ModalSlider from "../../components/ModalSlider";
import ProductInputButton from "../Shop/ProductInputButton";
import Image from "next/image";
import { ProductService } from "../../services/productService";
import ProductShimmer from "../../components/Shimmer/ProductShimmer";
import VideoModal from "../../components/VideoModal";
import { useWishlist } from "@/context/WishlistContext";

interface MenuItem {
    image: string;
    images?: string[];
    discount: string;
    name: string;
    price: string;
    category: string;
    hert: boolean;
    id: number;
    description?: string;
    originalPrice?: string;
    rating?: number;
    reviewCount?: number;
    sku?: string;
    externalLink?: string | null;
    video?: string | null;
}

type HeartIconsState = { [key: number]: boolean };

const initialState = {
    heartIcon: {} as HeartIconsState,
    basketIcon: {} as HeartIconsState,
    detailModal: false,
    selectedProduct: null as MenuItem | null,
    videoModal: false,
    videoProduct: null as { url: string; title: string } | null,
    showLoginModal: false,
    activeMenu: 0,
    data: [], // Initially empty, will be populated from backend
    categories: [],
    merchant: null as any,
    loading: true,
    error: null as string | null,
};

// Define the reducer function
function reducer(state: typeof initialState, action: any) {
    switch (action.type) {
        case 'TOGGLE_HEART':
            return {
                ...state,
                heartIcon: {
                    ...state.heartIcon,
                    [action.index]: !state.heartIcon[action.index],
                },
            };
        case 'TOGGLE_BASKET':
            return {
                ...state,
                basketIcon: {
                    ...state.basketIcon,
                    [action.index]: !state.basketIcon[action.index],
                },
            };
        case 'SET_DETAIL_MODAL':
            return {
                ...state,
                detailModal: action.value,
                selectedProduct: action.product || null,
            };
        case 'SET_VIDEO_MODAL':
            return {
                ...state,
                videoModal: action.value,
                videoProduct: action.product || null,
            };
        case 'SET_ACTIVE_MENU':
            return {
                ...state,
                activeMenu: action.index,
            };
        case 'SET_DATA':
            return {
                ...state,
                data: action.data,
                basketIcon: action.basketIcon || state.basketIcon,
            };
        case 'SET_LOGIN_MODAL':
            return {
                ...state,
                showLoginModal: action.value,
            };
        case 'FETCH_INIT':
            return { ...state, loading: true, error: null };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                loading: false,
                data: action.data,
                merchant: action.merchant || state.merchant,
                error: null,
                heartIcon: action.heartIcon || state.heartIcon,
                basketIcon: action.basketIcon || state.basketIcon
            };
        case 'FETCH_CATEGORIES_SUCCESS':
            return { ...state, categories: action.data };
        case 'FETCH_FAILURE':
            return { ...state, loading: false, error: action.error };
        default:
            throw new Error();
    }
}

const ProductSection = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { isFavorite, toggleFavorite } = useWishlist();
    const categoryScrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollButtons = () => {
        if (categoryScrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
            setCanScrollLeft(scrollLeft > 5);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    useEffect(() => {
        const timer = setTimeout(updateScrollButtons, 300);
        window.addEventListener('resize', updateScrollButtons);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateScrollButtons);
        };
    }, [state.categories]);

    const scrollCategory = (direction: 'left' | 'right') => {
        if (categoryScrollRef.current) {
            const scrollAmount = direction === 'left' ? -220 : 220;
            categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            dispatch({ type: 'FETCH_INIT' });
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    ProductService.getPublicProducts(),
                    ProductService.getPublicCategories()
                ]);

                if (productsRes.success && productsRes.data) {
                    let favoritesData: any[] = [];
                    const token = localStorage.getItem("token");
                    if (token) {
                        try {
                            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
                            const favRes = await fetch(`${API_BASE_URL}/user/favorites`, {
                                headers: { "Authorization": `Bearer ${token}` }
                            });
                            const favJson = await favRes.json();
                            if (favJson.success) {
                                favoritesData = favJson.data;
                            }
                        } catch (e) {
                            console.error("Failed to fetch favorites", e);
                        }
                    }

                    const extractProductImage = (item: any) => {
                        if (Array.isArray(item.images) && item.images.length > 0 && typeof item.images[0] === 'string' && item.images[0].trim()) {
                            return item.images[0].trim();
                        }
                        if (typeof item.images === 'string' && item.images.trim()) {
                            return item.images.trim();
                        }
                        if (typeof item.image === 'string' && item.image.trim()) {
                            return item.image.trim();
                        }
                        return "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1";
                    };

                    const extractProductImages = (item: any) => {
                        if (Array.isArray(item.images) && item.images.length > 0) {
                            const valid = item.images.filter((img: any) => typeof img === 'string' && img.trim());
                            if (valid.length > 0) return valid;
                        }
                        if (typeof item.images === 'string' && item.images.trim()) {
                            return item.images.split(',').map((s: string) => s.trim()).filter(Boolean);
                        }
                        if (typeof item.image === 'string' && item.image.trim()) {
                            return [item.image.trim()];
                        }
                        return ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1"];
                    };

                    const mappedData = productsRes.data.map((item: any) => ({
                        image: extractProductImage(item),
                        images: extractProductImages(item),
                        discount: item.discount ? item.discount.toString() : "0",
                        name: item.title,
                        price: item.price.toString(),
                        category: item.categoryId ? item.categoryId.name : "Uncategorized",
                        hert: false,
                        id: item._id,
                        description: item.description || "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
                        originalPrice: item.originalPrice ? item.originalPrice.toString() : (parseFloat(item.price) * 1.2).toFixed(2),
                        rating: item.rating || 4.7,
                        reviewCount: item.reviewCount || 5,
                        sku: item.sku || `PRT${item._id.substring(0, 7).toUpperCase()}`,
                        externalLink: item.externalLink || null,
                        video: item.video || null,
                    }));

                    const newHeartIcon: HeartIconsState = {};
                    mappedData.forEach((item: any, ind: number) => {
                        const isFav = favoritesData.some((f: any) => f.productId?._id === item.id);
                        newHeartIcon[ind] = isFav;
                    });

                    const newBasketIcon: HeartIconsState = {};
                    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
                    mappedData.forEach((item: any, ind: number) => {
                        newBasketIcon[ind] = currentCart.some((c: any) => c.id === item.id);
                    });

                    dispatch({
                        type: 'FETCH_SUCCESS',
                        data: mappedData,
                        merchant: productsRes.merchant,
                        heartIcon: newHeartIcon,
                        basketIcon: newBasketIcon
                    });
                } else {
                    dispatch({ type: 'FETCH_FAILURE', error: "Failed to load products" });
                }

                if (categoriesRes.success && categoriesRes.data) {
                    dispatch({ type: 'FETCH_CATEGORIES_SUCCESS', data: categoriesRes.data });
                }
            } catch (error: any) {
                dispatch({ type: 'FETCH_FAILURE', error: error.message || "An error occurred" });
            }
        };

        fetchInitialData();
    }, []);

    const handleHide = () => {
        dispatch({ type: 'SET_DETAIL_MODAL', value: false });
    };

    const filterCategory = async (categoryId: string | null, ind: number) => {
        document.querySelectorAll(".card-container").forEach((ell) => {
            ell.setAttribute("style", "transform:scale(0);");
        });
        dispatch({ type: 'SET_ACTIVE_MENU', index: ind });

        try {
            let json;
            if (categoryId) {
                json = await ProductService.getProductsByCategory(categoryId);
            } else {
                json = await ProductService.getPublicProducts();
            }

            if (json.success && json.data) {
                const extractProductImage = (item: any) => {
                    if (Array.isArray(item.images) && item.images.length > 0 && typeof item.images[0] === 'string' && item.images[0].trim()) {
                        return item.images[0].trim();
                    }
                    if (typeof item.images === 'string' && item.images.trim()) {
                        return item.images.trim();
                    }
                    if (typeof item.image === 'string' && item.image.trim()) {
                        return item.image.trim();
                    }
                    return "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1";
                };

                const extractProductImages = (item: any) => {
                    if (Array.isArray(item.images) && item.images.length > 0) {
                        const valid = item.images.filter((img: any) => typeof img === 'string' && img.trim());
                        if (valid.length > 0) return valid;
                    }
                    if (typeof item.images === 'string' && item.images.trim()) {
                        return item.images.split(',').map((s: string) => s.trim()).filter(Boolean);
                    }
                    if (typeof item.image === 'string' && item.image.trim()) {
                        return [item.image.trim()];
                    }
                    return ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1"];
                };

                const mappedData = json.data.map((item: any) => ({
                    image: extractProductImage(item),
                    images: extractProductImages(item),
                    discount: item.discount ? item.discount.toString() : "0",
                    name: item.title,
                    price: item.price.toString(),
                    category: item.categoryId ? item.categoryId.name : "Uncategorized",
                    hert: false,
                    id: item._id,
                    description: item.description || "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
                    originalPrice: item.originalPrice ? item.originalPrice.toString() : (parseFloat(item.price) * 1.2).toFixed(2),
                    rating: item.rating || 4.7,
                    reviewCount: item.reviewCount || 5,
                    sku: item.sku || `PRT${item._id.substring(0, 7).toUpperCase()}`,
                    externalLink: item.externalLink || null,
                    video: item.video || null,
                }));

                const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
                const newBasketIcon: HeartIconsState = {};
                mappedData.forEach((item: any, i: number) => {
                    newBasketIcon[i] = currentCart.some((c: any) => c.id === item.id);
                });

                dispatch({ type: 'SET_DATA', data: mappedData, basketIcon: newBasketIcon });
            }
        } catch (error) {
            console.error("Error filtering products:", error);
        }

        setTimeout(() => {
            document.querySelectorAll(".card-container").forEach((ell) => {
                ell.setAttribute("style", "transform:scale(1);transition:all .5s linear");
            });
        }, 200);
    };

    const toggleHeart = async (index: number, productId?: number | string) => {
        const product = state.data[index] as any;
        const targetId = productId || product?.id;
        if (!targetId) return;

        const token = localStorage.getItem("token");
        if (!token) {
            dispatch({ type: 'SET_LOGIN_MODAL', value: true });
            return;
        }

        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${API_BASE_URL}/user/favorites/toggle`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ productId: product.id })
            });

            const data = await response.json();
            if (data.success) {
                dispatch({ type: 'TOGGLE_HEART', index });
            } else {
                console.error("Failed to toggle favorite:", data.message);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };

    const toggleBasket = (index: number) => {
        dispatch({ type: 'TOGGLE_BASKET', index });
        const product = state.data[index] as any;
        if (!product) return;

        try {
            const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existingItemIndex = currentCart.findIndex((item: any) => item.id === product.id);

            if (existingItemIndex !== -1) {
                currentCart.splice(existingItemIndex, 1);
            } else {
                currentCart.push({ ...product, quantity: 1 });
            }
            localStorage.setItem('cart', JSON.stringify(currentCart));
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            console.error("Error updating cart", error);
        }
    };
    return (
        <>
            <div className="row justify-content-between align-items-center mb-4 g-3">
                <div className="col-xl-4 col-lg-4 col-md-12">
                    <div className="section-head style-1 mb-0">
                        <div className="left-content">
                            <h2 className="title mb-0">
                                {state.merchant ? `${state.merchant.business_name || state.merchant.name}'s Products` : 'Most popular products'}
                            </h2>
                        </div>
                    </div>
                </div>
                <div className="col-xl-8 col-lg-8 col-md-12">
                    <div className="category-filter-nav-wrap">
                        {canScrollLeft && (
                            <button
                                className="category-nav-arrow category-nav-prev"
                                onClick={() => scrollCategory('left')}
                                aria-label="Scroll categories left"
                                type="button"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                        )}
                        <div
                            className="category-chips-scroll"
                            ref={categoryScrollRef}
                            onScroll={updateScrollButtons}
                        >
                            <button
                                type="button"
                                className={`category-filter-chip ${state.activeMenu === 0 ? "active" : ""}`}
                                onClick={() => filterCategory(null, 0)}
                            >
                                <span>All</span>
                            </button>
                            {state.categories && state.categories.length > 0 && state.categories.map((item: any, ind: number) => (
                                <button
                                    type="button"
                                    className={`category-filter-chip ${state.activeMenu === ind + 1 ? "active" : ""}`}
                                    key={item._id || ind + 1}
                                    onClick={() => filterCategory(item._id, ind + 1)}
                                >
                                    <span>{item.name}</span>
                                </button>
                            ))}
                        </div>
                        {canScrollRight && (
                            <button
                                className="category-nav-arrow category-nav-next"
                                onClick={() => scrollCategory('right')}
                                aria-label="Scroll categories right"
                                type="button"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {state.loading ? (
                <ProductShimmer count={8} />
            ) : state.error ? (
                <div className="container mt-4">
                    <Alert variant="danger">{state.error}</Alert>
                </div>
            ) : !state.data || state.data.length === 0 ? (
                <div className="container mt-4 text-center">
                    <p>No products available at the moment.</p>
                </div>
            ) : (
                <div className="clearfix">
                    <ul id="masonry" className="row g-xl-4 g-3">
                        {state.data && state.data.map((item: MenuItem, ind: number) => (
                            <div className="card-container col-6 col-xl-3 col-lg-3 col-md-4 col-sm-6 Tops wow fadeInUp" data-wow-delay="0.6s" key={ind}>
                                <div className="shop-card">
                                    <div 
                                        className="dz-media" 
                                        style={{ position: "relative", aspectRatio: "3 / 4", cursor: "pointer" }}
                                        onClick={() => {
                                            dispatch({ type: 'SET_DETAIL_MODAL', value: true, product: item });
                                        }}
                                    >
                                        <Image
                                            src={item.image}
                                            alt="media"
                                            fill
                                            style={{ objectFit: "cover" }}
                                            unoptimized
                                        />
                                        <div 
                                            className="shop-meta"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Link href={"#"} className="btn btn-secondary btn-md btn-rounded"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    dispatch({ type: 'SET_DETAIL_MODAL', value: true, product: item });
                                                }}
                                            >
                                                <i className="fa-solid fa-eye d-md-none d-block" />
                                                <span className="d-md-block d-none">View Photo</span>
                                            </Link>
                                            <div className={`btn btn-primary meta-icon dz-wishicon ${isFavorite(item.id || (item as any)._id) ? "active" : ""}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleFavorite(item);
                                                }}
                                            >
                                                <i className="icon feather icon-heart dz-heart" />
                                                <i className="icon feather icon-heart-on dz-heart-fill" />
                                            </div>
                                            {item.externalLink ? (
                                                <Link href={item.externalLink} target="_blank" className="btn btn-primary meta-icon dz-carticon">
                                                    <i className="flaticon flaticon-basket" />
                                                    <i className="flaticon flaticon-basket dz-heart-fill" />
                                                </Link>
                                            ) : (
                                                <div className={`btn btn-primary meta-icon dz-carticon ${state.basketIcon[ind] ? "active" : ""}`}
                                                    onClick={() => {
                                                        toggleBasket(ind);
                                                    }}
                                                >
                                                    <i className="flaticon flaticon-basket" />
                                                    <i className="flaticon flaticon-basket-on dz-heart-fill" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="dz-content">
                                        <h5 className="title">
                                            <Link 
                                                href={"#"}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    dispatch({ type: 'SET_DETAIL_MODAL', value: true, product: item });
                                                }}
                                            >
                                                {item.name}
                                            </Link>
                                        </h5>
                                        <h5 className="price">₹{item.price}</h5>
                                    </div>
                                    <div className="product-tag">
                                        <span className="badge ">Get {item.discount}% Off</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </ul>
                </div>
            )}
            <Modal className="quick-view-modal" show={state.detailModal} onHide={handleHide} centered>
                <button type="button" className="btn-close"
                    onClick={handleHide}
                >
                    <i className="icon feather icon-x" />
                </button>
                <div className="modal-body">
                    <div className="row g-xl-4 g-3">
                        <div className="col-xl-6 col-md-6">
                            <div className="dz-product-detail mb-0">
                                <ModalSlider images={state.selectedProduct?.images} />
                            </div>
                        </div>
                        <div className="col-xl-6 col-md-6">
                            <div className="dz-product-detail style-2 ps-xl-3 ps-0 pt-2 mb-0">
                                <div className="dz-content">
                                    <div className="dz-content-footer">
                                        <div className="dz-content-start">
                                            {state.selectedProduct?.discount && state.selectedProduct.discount !== "0" && (
                                                <span className="badge bg-secondary mb-2">SALE {state.selectedProduct.discount}% Off</span>
                                            )}
                                            <h4 className="title mb-1"><Link href="/shop-list">{state.selectedProduct?.name}</Link></h4>
                                            <div className="review-num">
                                                <ul className="dz-rating me-2">
                                                    <li className="star-fill"><i className="flaticon-star-1" /></li>
                                                    <li className="star-fill"><i className="flaticon-star-1" /></li>
                                                    <li className="star-fill"><i className="flaticon-star-1" /></li>
                                                    <li className="star-fill"><i className="flaticon-star-1" /></li>
                                                    <li className="star-fill"><i className="flaticon-star-1" /></li>
                                                </ul>
                                                <span className="text-secondary me-2">{state.selectedProduct?.rating} Rating</span>
                                                <Link href={"#"}>({state.selectedProduct?.reviewCount} customer reviews)</Link>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="para-text">
                                        {state.selectedProduct?.description}
                                    </p>

                                    {state.selectedProduct?.video && (
                                        <div className="mb-3">
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold rounded-3 shadow-sm"
                                                onClick={() => {
                                                    dispatch({
                                                        type: 'SET_VIDEO_MODAL',
                                                        value: true,
                                                        product: {
                                                            url: state.selectedProduct?.video,
                                                            title: state.selectedProduct?.name
                                                        }
                                                    });
                                                }}
                                            >
                                                <i className="fa-brands fa-youtube text-danger fs-5" />
                                                <span>Watch Video Showcase</span>
                                            </button>
                                        </div>
                                    )}

                                    <div className="meta-content m-b20 d-flex align-items-end">
                                        <div className="me-3">
                                            <span className="form-label">Price</span>
                                            <span className="price">₹{state.selectedProduct?.price} <del>₹{state.selectedProduct?.originalPrice}</del></span>
                                        </div>
                                        <div className="btn-quantity light me-0">
                                            <label className="form-label">Quantity</label>
                                            <ProductInputButton />
                                        </div>
                                    </div>
                                    <div className=" cart-btn">
                                        {state.selectedProduct?.externalLink ? (
                                            <Link href={state.selectedProduct.externalLink} target="_blank" className="btn btn-secondary text-uppercase">
                                                Buy Now <i className="fa-solid fa-arrow-up-right-from-square ms-2" />
                                            </Link>
                                        ) : (
                                            <Link
                                                href="/shop-cart"
                                                className="btn btn-secondary text-uppercase"
                                                onClick={() => {
                                                    if (state.selectedProduct) {
                                                        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
                                                        const existingItemIndex = currentCart.findIndex((item: any) => item.id === state.selectedProduct?.id);
                                                        if (existingItemIndex === -1) {
                                                            currentCart.push({ ...state.selectedProduct, quantity: 1 });
                                                            localStorage.setItem('cart', JSON.stringify(currentCart));
                                                            window.dispatchEvent(new Event('cartUpdated'));
                                                        }
                                                    }
                                                }}
                                            >View Product</Link>
                                        )}
                                        <button
                                            type="button"
                                            className={`btn btn-md ${isFavorite(state.selectedProduct?.id) ? 'btn-primary' : 'btn-outline-secondary'} btn-icon`}
                                            onClick={() => {
                                                if (state.selectedProduct) {
                                                    toggleFavorite(state.selectedProduct);
                                                }
                                            }}
                                        >
                                            <svg width="19" height="17" viewBox="0 0 19 17" fill={isFavorite(state.selectedProduct?.id) ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9.24805 16.9986C8.99179 16.9986 8.74474 16.9058 8.5522 16.7371C7.82504 16.1013 7.12398 15.5038 6.50545 14.9767L6.50229 14.974C4.68886 13.4286 3.12289 12.094 2.03333 10.7794C0.815353 9.30968 0.248047 7.9162 0.248047 6.39391C0.248047 4.91487 0.755203 3.55037 1.67599 2.55157C2.60777 1.54097 3.88631 0.984375 5.27649 0.984375C6.31552 0.984375 7.26707 1.31287 8.10464 1.96065C8.52734 2.28763 8.91049 2.68781 9.24805 3.15459C9.58574 2.68781 9.96875 2.28763 10.3916 1.96065C11.2292 1.31287 12.1807 0.984375 13.2197 0.984375C14.6098 0.984375 15.8885 1.54097 16.8202 2.55157C17.741 3.55037 18.248 4.91487 18.248 6.39391C18.248 7.9162 17.6809 9.30968 16.4629 10.7792C15.3733 12.094 13.8075 13.4285 11.9944 14.9737C11.3747 15.5016 10.6726 16.1001 9.94376 16.7374C9.75136 16.9058 9.50417 16.9986 9.24805 16.9986ZM5.27649 2.03879C4.18431 2.03879 3.18098 2.47467 2.45108 3.26624C1.71033 4.06975 1.30232 5.18047 1.30232 6.39391C1.30232 7.67422 1.77817 8.81927 2.84508 10.1066C3.87628 11.3509 5.41011 12.658 7.18605 14.1715L7.18935 14.1743C7.81021 14.7034 8.51402 15.3033 9.24654 15.9438C9.98344 15.302 10.6884 14.7012 11.3105 14.1713C13.0863 12.6578 14.6199 11.3509 15.6512 10.1066C16.7179 8.81927 17.1938 7.67422 17.1938 6.39391C17.1938 5.18047 16.7858 4.06975 16.045 3.26624C15.3152 2.47467 14.3118 2.03879 13.2197 2.03879C12.4197 2.03879 11.6851 2.29312 11.0365 2.79465C10.4585 3.24179 10.0558 3.80704 9.81975 4.20255C9.69835 4.40593 9.48466 4.52733 9.24805 4.52733C9.01143 4.52733 8.79774 4.40593 8.67635 4.20255C8.44041 3.80704 8.03777 3.24179 7.45961 2.79465C6.811 2.29312 6.07643 2.03879 5.27649 2.03879Z" fill={isFavorite(state.selectedProduct?.id) ? "currentColor" : "black"} />
                                            </svg>
                                            {isFavorite(state.selectedProduct?.id) ? "In Wishlist" : "Add To Wishlist"}
                                        </button>
                                    </div>
                                    <div className="dz-info mb-0">
                                        <ul>
                                            <li><strong>SKU:</strong></li>
                                            <li>{state.selectedProduct?.sku}</li>
                                        </ul>
                                        <ul>
                                            <li><strong>Category:</strong></li>
                                            <li><Link href="/shop-standard">{state.selectedProduct?.category}</Link></li>
                                        </ul>
                                        <div className="dz-social-icon">
                                            <ul>
                                                <li><Link target="_blank" className="text-dark" href="https://www.facebook.com/Eonpulsetech">
                                                    <i className="fab fa-facebook-f" />
                                                </Link></li>
                                                <li><Link target="_blank" className="text-dark" href="https://www.behance.net/Eonpulsetech">
                                                    <i className="fa-brands fa-behance" />
                                                </Link></li>
                                                <li><Link target="_blank" className="text-dark" href="https://www.youtube.com/@Eonpulsetech1723">
                                                    <i className="fa-brands fa-youtube" />
                                                </Link></li>
                                                <li><Link target="_blank" className="text-dark" href="https://www.linkedin.com/showcase/3686700/admin/">
                                                    <i className="fa-brands fa-linkedin-in" />
                                                </Link></li>
                                                <li><Link target="_blank" className="text-dark" href="https://www.instagram.com/Eonpulsetech/">
                                                    <i className="fab fa-instagram" />
                                                </Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </Modal>

            <Modal show={state.showLoginModal} onHide={() => dispatch({ type: 'SET_LOGIN_MODAL', value: false })} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Login Required</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>You need to be logged in to add products to your favorites.</p>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-outline-secondary" onClick={() => dispatch({ type: 'SET_LOGIN_MODAL', value: false })}>
                        Cancel
                    </button>
                    <Link href="/login" className="btn btn-secondary">
                        Go to Login
                    </Link>
                </Modal.Footer>
            </Modal>

            {/* Video Popup Modal */}
            <VideoModal
                show={state.videoModal}
                onHide={() => dispatch({ type: 'SET_VIDEO_MODAL', value: false, product: null })}
                videoUrl={state.videoProduct?.url}
                title={state.videoProduct?.title}
            />
        </>
    );
};

export default ProductSection;