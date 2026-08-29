"use client";

import { Fragment } from "react/jsx-runtime";
import { Offcanvas } from "react-bootstrap";
import HeaderSidbar from "./HeaderSidbar";
import { useEffect, useReducer, useState } from "react";
import HeadSearchBar from "./HeadSearchBar";
import HeaderSideShoppingCard from "./HeaderSideShopingCard";
import Link from "next/link";
import IMAGES from "../constant/theme";
import { accountMenuItem } from "../constant/Alldata";
import CountdownBlog from "./CountdownBlog";
import Image from "next/image";
import { useWishlist } from "@/context/WishlistContext";

interface reduType {
    headerFix: boolean;
    isBottom: boolean;
    isActive: boolean;
    previousScroll: number;
    openSearchBar: boolean;
    openSidebar: boolean;
    headSideBar: boolean;
    headShoppingSidebar: boolean;
    basketShoppingCard: boolean;
    home: boolean;
    openMenu: number | null;
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
    | { type: 'TOGGLE_BASKET_SHOPPING_CARD' }
    | { type: 'TOGGLE_CATEGORY_ACTIVE' }
    | { type: 'home' }
    | { type: 'toggleMenu'; index: number };

const initialState: reduType = {
    headerFix: false,
    isBottom: false,
    isActive: false,
    previousScroll: 0,
    openSearchBar: false,
    openSidebar: false,
    headSideBar: false,
    headShoppingSidebar: false,
    basketShoppingCard: false,
    home: false,
    openMenu: null,
};

function reducer(state: reduType, action: Action): reduType {
    switch (action.type) {
        case 'home':
            return { ...state, home: !state.home };
        case 'toggleMenu':
            return {
                ...state,
                openMenu: state.openMenu === action.index ? null : action.index,
            };
        case 'FIX_HEADER':
            return { ...state, headerFix: action.payload };
        case 'FIX_BOTTOM':
            return { ...state, isBottom: action.payload };
        case 'SET_IS_ACTIVE':
            return { ...state, isActive: action.payload };
        case 'SET_PREVIOUS_SCROLL':
            return { ...state, previousScroll: action.payload };
        case 'TOGGLE_SEARCH_BAR':
            return { ...state, openSearchBar: !state.openSearchBar };
        case 'TOGGLE_HEAD_SIDEBAR':
            return { ...state, headSideBar: !state.headSideBar };
        case 'TOGGLE_HEAD_SHOPPING_SIDEBAR':
            return { ...state, headShoppingSidebar: !state.headShoppingSidebar };
        case 'TOGGLE_BASKET_SHOPPING_CARD':
            return { ...state, basketShoppingCard: !state.basketShoppingCard };
        default:
            return state;
    }
}

export default function Header3({ setOpenSidebar, openSidebar }: any) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [cartCount, setCartCount] = useState(0);
    const { wishlistCount } = useWishlist();

    useEffect(() => {
        const loadCartCount = () => {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartCount(cart.length);
        };
        loadCartCount();
        window.addEventListener('cartUpdated', loadCartCount);
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

    let year = new Date().getFullYear();

    return (
        <Fragment>
            <header className="site-header mo-left header style-3">
                <div className={`sticky-header main-bar-wraper ${state.headerFix ? 'is-fixed' : ''}`}>
                    <div className="main-bar clearfix">
                        <div className="container-fluid clearfix">
                            <button className={`menu-nav-btn ${openSidebar ? "" : "collapsed"}`}
                                onClick={() => setOpenSidebar(!openSidebar)}
                            >
                                <span className="for-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </span>
                                <span className="dots-close">
                                    <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="20" height="2.10526" transform="matrix(-0.707107 -0.707107 -0.707107 0.707107 22.0635 20.561)" fill="white" />
                                        <rect x="6.43262" y="20.5611" width="20" height="2.10526" transform="rotate(-45 6.43262 20.5611)" fill="white" />
                                    </svg>
                                </span>
                            </button>
                            <div className="logo-header me-5">
                                <Link href={"/"} >
                                    <Image src={IMAGES.logo} className="logo-dark" alt="logo" />
                                    <Image src={IMAGES.LogoWhiteSvg} className="logo-light" alt="logo" />
                                </Link>
                            </div>

                            {/* EXTRA NAV */}
                            <div className={`extra-nav ${state.isBottom ? "bottom-end" : ""} ${state.isActive ? "active" : ""}`}>
                                <div className="extra-cell">
                                    <ul className="header-right">
                                        <li className="nav-item login-link">
                                            <Link className="nav-link" href="/login">
                                                Login / Register
                                            </Link>
                                        </li>
                                        <li className="nav-item search-link">
                                            <Link href={"#"} className="nav-link"
                                                onClick={() => dispatch({ type: 'TOGGLE_SEARCH_BAR' })}
                                            >
                                                <i className="iconly-Light-Search" />
                                            </Link>
                                        </li>
                                        <li className="nav-item wishlist-link">
                                            <Link href={"#"} className="nav-link"
                                                onClick={() => dispatch({ type: 'TOGGLE_HEAD_SHOPPING_SIDEBAR' })}
                                            >
                                                <i className="iconly-Light-Heart2" />
                                                {wishlistCount > 0 && <span className="badge badge-circle">{wishlistCount}</span>}
                                            </Link>
                                        </li>
                                        <li className="nav-item cart-link">
                                            <Link href={"#"} className="nav-link cart-btn"
                                                onClick={() => dispatch({ type: 'TOGGLE_BASKET_SHOPPING_CARD' })}
                                            >
                                                <i className="iconly-Broken-Buy" />
                                                <span className="badge badge-circle">{cartCount}</span>
                                            </Link>
                                        </li>
                                        <li className="nav-item filte-link">
                                            <Link href={"#"} className="nav-link filte-btn"
                                                onClick={() => dispatch({ type: 'TOGGLE_HEAD_SIDEBAR' })}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 13" fill="none">
                                                    <rect y="11" width="30" height="2" fill="black" />
                                                    <rect width="30" height="2" fill="black" />
                                                </svg>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </header>

            <div className={`header-menu navbar-collapse collapse ${openSidebar ? "show" : ""}`} >
                <div className="row h-100">
                    <div className="col-lg-3">
                        <div className="header-nav h-100 nav-dark">
                            <ul className="nav navbar-nav">
                                <li>
                                    <Link href="/"><span>Home</span></Link>
                                </li>
                                <li><Link href="/photos"><span>Photos</span></Link></li>
                                <li><Link href="/about-us"><span>About Us</span></Link></li>
                                <li><Link href="/contact-us"><span>Contact Us</span></Link></li>
                                <li className={`sub-menu-down ${state.openMenu === 6 ? "open active" : ""}`}
                                    onClick={() => dispatch({ type: 'toggleMenu', index: 6 })}
                                    onMouseEnter={() => dispatch({ type: 'toggleMenu', index: 6 })}
                                >
                                    <Link href="#"><span>My Account</span> <i className="fas fa-chevron-down tabindex" /></Link>
                                    <ul className="sub-menu">
                                        {accountMenuItem.map((data, index) => (
                                            <li key={index}><Link href={data.url}>{data.name}</Link></li>
                                        ))}
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="right-social-menu">
                    <ul>
                        <li>
                            <Link href={"#"}>info@alikecreator.com</Link>
                        </li>
                        <li>
                            <Link href={"#"}>+91 123 456 7890</Link>
                        </li>
                    </ul>
                    <ul>
                        <li>
                            <Link href={"#"}>Instagram</Link>
                        </li>
                        <li>
                            <Link href={"#"}>Facebook</Link>
                        </li>
                        <li>
                            <Link href={"#"}>twitter</Link>
                        </li>
                    </ul>
                </div>
                <div className="footer-menu">
                    <p className="mb-0">© <span className="current-year">{year}</span> Alikecreator Theme. All Rights Reserved.</p>
                </div>
            </div>

            {/* SearchBar */}
            <Offcanvas className="dz-search-area dz-offcanvas offcanvas-top"
                show={state.openSearchBar}
                onHide={() => dispatch({ type: 'TOGGLE_SEARCH_BAR' })}
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
            <Offcanvas className="dz-offcanvas offcanvas-end" placement="end"
                show={state.headSideBar}
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

            {/* Sidebar cart */}
            <Offcanvas className="dz-offcanvas offcanvas-end" placement="end" tabIndex={-1}
                show={state.headShoppingSidebar}
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

            {/* Shopping Sidebar Basket */}
            <Offcanvas className="dz-offcanvas offcanvas-end" placement="end" tabIndex={-1}
                show={state.basketShoppingCard}
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
        </Fragment>
    );
}