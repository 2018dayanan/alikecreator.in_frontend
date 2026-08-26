"use client";

import { useEffect, useReducer, useState } from "react";
import { Offcanvas } from "react-bootstrap";
import Link from "next/link";
import Image from "next/image";
import IMAGES from "../constant/theme";
import Menus from "./Menus";
import HeadSearchBar from "./HeadSearchBar";
import HeaderSidbar from "./HeaderSidbar";
import HeaderSideShoppingCard from "./HeaderSideShopingCard";
import { useWishlist } from "@/context/WishlistContext";

interface DesignType {
    design: string;
}

interface State {
    headerFix: boolean;
    isBottom: boolean;
    isActive: boolean;
    previousScroll: number;
    openSidebar: boolean;
    openSearchBar: boolean;
    headSideBar: boolean;
    headShoppingSidebar: boolean;
    basketShoppingCard: boolean;
}

type Action =
    | { type: 'FIX_HEADER'; payload: boolean }
    | { type: 'FIX_BOTTOM'; payload: boolean }
    | { type: 'SET_IS_ACTIVE'; payload: boolean }
    | { type: 'SET_PREVIOUS_SCROLL'; payload: number }
    | { type: 'TOGGLE_SIDEBAR' }
    | { type: 'TOGGLE_SEARCH_BAR' }
    | { type: 'TOGGLE_HEAD_SIDEBAR' }
    | { type: 'TOGGLE_HEAD_SHOPPING_SIDEBAR' }
    | { type: 'TOGGLE_BASKET_SHOPPING_CARD' };

const initialState = {
    headerFix: false,
    isBottom: false,
    isActive: false,
    previousScroll: 0,
    openSidebar: false,
    openSearchBar: false,
    headSideBar: false,
    headShoppingSidebar: false,
    basketShoppingCard: false,
};

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'FIX_HEADER':
            return { ...state, headerFix: action.payload };
        case 'FIX_BOTTOM':
            return { ...state, isBottom: action.payload };
        case 'SET_IS_ACTIVE':
            return { ...state, isActive: action.payload };
        case 'SET_PREVIOUS_SCROLL':
            return { ...state, previousScroll: action.payload };
        case 'TOGGLE_SIDEBAR':
            return { ...state, openSidebar: !state.openSidebar };
        case 'TOGGLE_SEARCH_BAR':
            return { ...state, openSearchBar: !state.openSearchBar };
        case 'TOGGLE_HEAD_SIDEBAR':
            return { ...state, headSideBar: !state.headSideBar };
        case 'TOGGLE_HEAD_SHOPPING_SIDEBAR':
            return { ...state, headShoppingSidebar: !state.headShoppingSidebar };
        case 'TOGGLE_BASKET_SHOPPING_CARD':
            return { ...state, basketShoppingCard: !state.basketShoppingCard };
        default:
            throw new Error();
    }
}

const Header = ({ design }: DesignType) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [cartCount, setCartCount] = useState(0);
    const { wishlistCount } = useWishlist();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userProfilePic, setUserProfilePic] = useState<string | any>(IMAGES.ProfilePic);

    useEffect(() => {
        const loadCartCount = () => {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartCount(cart.length);
        };
        loadCartCount();
        window.addEventListener('cartUpdated', loadCartCount);

        const checkAuth = () => {
            const token = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");
            if (token && storedUser) {
                setIsLoggedIn(true);
                try {
                    const user = JSON.parse(storedUser);
                    if (user.profile_picture) {
                        setUserProfilePic(user.profile_picture);
                    }
                } catch (e) { }
            } else {
                setIsLoggedIn(false);
            }
        };
        checkAuth();

        return () => window.removeEventListener('cartUpdated', loadCartCount);
    }, []);

    const scrollHandler = () => {
        if (window.scrollY > 80) {
            dispatch({ type: 'FIX_HEADER', payload: true });
        } else {
            dispatch({ type: 'FIX_HEADER', payload: false });
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerWidth <= 768) {
                const currentScroll = window.scrollY;
                const bodyHeight = document.body.scrollHeight;
                const windowHeight = window.innerHeight;

                dispatch({ type: 'FIX_BOTTOM', payload: currentScroll + windowHeight >= bodyHeight });
                dispatch({ type: 'SET_IS_ACTIVE', payload: currentScroll > state.previousScroll });
                dispatch({ type: 'SET_PREVIOUS_SCROLL', payload: currentScroll });
            }
        };

        const combinedHandler = () => {
            scrollHandler();
            handleScroll();
        };

        window.addEventListener("scroll", combinedHandler);
        return () => {
            window.removeEventListener("scroll", combinedHandler);
        };
    }, [state.previousScroll]);

    return (
        <>
            <header className={`site-header mo-left header ${design}`}>
                {/* Main Header */}
                <div className={`sticky-header main-bar-wraper navbar-expand-lg ${state.headerFix ? 'is-fixed' : ''}`}>
                    <div className="main-bar clearfix">
                        <div className="container-fluid clearfix d-flex align-items-center justify-content-between">
                            <div className="logo-header-wrap d-flex align-items-center">
                                {design === "header-text-white header-transparent" ? (
                                    <div className="logo-header me-md-5">
                                        <Link href="/" className="logo-light"><Image src={IMAGES.LogoWhite} alt="logo-white" style={{ transform: 'scale(1.2)', transformOrigin: 'left center' }} /></Link>
                                        <Link href="/" className="logo-dark"><Image src={IMAGES.logopng} alt="logo" style={{ transform: 'scale(1.2)', transformOrigin: 'left center' }} /></Link>
                                    </div>
                                ) : (
                                    <div className="logo-header logo-dark me-md-5">
                                        <Link href="/"><Image src={IMAGES.logo} alt="logo" style={{ transform: 'scale(1.2)', transformOrigin: 'left center' }} /></Link>
                                    </div>
                                )}
                            </div>

                            {/* Main Nav */}
                            <div className={`header-nav w3menu navbar-collapse collapse justify-content-start ${state.openSidebar ? "show" : ""}`}
                                id="navbarNavDropdown"
                            >
                                <div className="logo-header logo-dark">
                                    <Link href="/"><Image src={IMAGES.logo} alt="logo" style={{ transform: 'scale(1.2)', transformOrigin: 'left center' }} /></Link>
                                </div>
                                <Menus />
                                <div className="dz-social-icon">
                                    <ul>
                                        <li><Link className="fab fa-facebook-f" target="_blank" href="https://www.facebook.com/alikecreator"></Link></li>
                                        <li><Link className="fa-brands fa-behance" target="_blank" href="https://www.behance.net/alikecreator"></Link></li>
                                        <li><Link className="fab fa-linkedin-in" target="_blank" href="https://www.linkedin.com/showcase/3686700/admin/"></Link></li>
                                        <li><Link className="fab fa-instagram" target="_blank" href="https://www.instagram.com/alikecreator/"></Link></li>
                                    </ul>
                                </div>
                            </div>

                            {/* Right Actions: Header-right (Search, Wishlist, Cart, Filter) + Navbar Toggler */}
                            <div className="extra-nav-wrapper d-flex align-items-center ms-auto">
                                <div className={`extra-nav ${state.isBottom ? "bottom-end" : ""} ${state.isActive ? "active" : ""}`}>
                                    <div className="extra-cell">
                                        <ul className="header-right d-flex align-items-center">
                                            {isLoggedIn ? (
                                                <li className="nav-item profile-link" style={{ marginRight: '15px' }}>
                                                    <Link className="nav-link p-0" href="/account-dashboard">
                                                        <Image
                                                            src={userProfilePic}
                                                            alt="Profile"
                                                            width={40}
                                                            height={40}
                                                            className="rounded-circle"
                                                            style={{ objectFit: 'cover' }}
                                                        />
                                                    </Link>
                                                </li>
                                            ) : (
                                                <li className="nav-item login-link d-none d-lg-inline-block">
                                                    <Link className="nav-link" href="/login">
                                                        Login / Register
                                                    </Link>
                                                </li>
                                            )}
                                            <li className="nav-item search-link">
                                                <Link className="nav-link" href="#"
                                                    onClick={(e) => { e.preventDefault(); dispatch({ type: 'TOGGLE_SEARCH_BAR' }); }}
                                                >
                                                    <i className="iconly-Light-Search" />
                                                </Link>
                                            </li>
                                            <li className="nav-item wishlist-link">
                                                <Link className="nav-link" href="#"
                                                    onClick={(e) => { e.preventDefault(); dispatch({ type: 'TOGGLE_HEAD_SHOPPING_SIDEBAR' }); }}
                                                >
                                                    <i className="iconly-Light-Heart2" />
                                                    {wishlistCount > 0 && <span className="badge badge-circle">{wishlistCount}</span>}
                                                </Link>
                                            </li>
                                            <li className="nav-item cart-link">
                                                <Link href="#" className="nav-link cart-btn"
                                                    onClick={(e) => { e.preventDefault(); dispatch({ type: 'TOGGLE_BASKET_SHOPPING_CARD' }); }}
                                                >
                                                    <i className="iconly-Broken-Buy" />
                                                    <span className="badge badge-circle">{cartCount}</span>
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <button
                                    className={`navbar-toggler collapsed navicon justify-content-end ${state.openSidebar ? "open" : ""}`}
                                    onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                                    type="button"
                                    aria-label="Toggle navigation"
                                >
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Main Header End */}
            </header>

            {/* SearchBar */}
            <Offcanvas className="dz-search-area dz-offcanvas offcanvas-top"
                show={state.openSearchBar} onHide={() => dispatch({ type: 'TOGGLE_SEARCH_BAR' })}
                placement={'top'}
            >
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"
                    onClick={() => dispatch({ type: 'TOGGLE_SEARCH_BAR' })}
                >
                    &times;
                </button>
                <HeadSearchBar />
            </Offcanvas>

            {/* Sidebar filter */}
            <Offcanvas className="dz-offcanvas offcanvas-end" placement="end" show={state.headSideBar}
                onHide={() => dispatch({ type: 'TOGGLE_HEAD_SIDEBAR' })}
            >
                <button type="button" className="btn-close"
                    onClick={() => dispatch({ type: 'TOGGLE_HEAD_SIDEBAR' })}
                >
                    &times;
                </button>
                <div className="offcanvas-body">
                    <HeaderSidbar />
                </div>
            </Offcanvas>

            {/* Sidebar cart - Wishlist Tab */}
            <Offcanvas className="dz-offcanvas offcanvas-end" placement="end" tabIndex={-1} show={state.headShoppingSidebar}
                onHide={() => dispatch({ type: 'TOGGLE_HEAD_SHOPPING_SIDEBAR' })}
            >
                <button type="button" className="btn-close"
                    onClick={() => dispatch({ type: 'TOGGLE_HEAD_SHOPPING_SIDEBAR' })}
                >
                    &times;
                </button>
                <div className="offcanvas-body">
                    <div className="product-description">
                        <HeaderSideShoppingCard tabactive="Wishlist" />
                    </div>
                </div>
            </Offcanvas>

            {/* Shopping Sidebar Basket - Cart Tab */}
            <Offcanvas className="dz-offcanvas offcanvas-end" placement="end" tabIndex={-1} show={state.basketShoppingCard}
                onHide={() => dispatch({ type: 'TOGGLE_BASKET_SHOPPING_CARD' })}
            >
                <button type="button" className="btn-close"
                    onClick={() => dispatch({ type: 'TOGGLE_BASKET_SHOPPING_CARD' })}
                >
                    &times;
                </button>
                <div className="offcanvas-body">
                    <div className="product-description">
                        <HeaderSideShoppingCard tabactive="ShoppingCart" />
                    </div>
                </div>
            </Offcanvas>
        </>
    );
};

export default Header;