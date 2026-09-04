"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Form from 'react-bootstrap/Form';
import CommanBanner from "@/components/CommanBanner";
import IMAGES from "@/constant/theme";
import { Accordion, Badge, Spinner } from "react-bootstrap";
import Image from 'next/image';
import { AddressService, UserAddress } from "@/services/addressService";
import toast from 'react-hot-toast';

interface CartItem {
    id: string | number;
    _id?: string;
    name?: string;
    title?: string;
    price: number | string;
    image?: string;
    quantity: number;
    maxRedeemableCoins?: number;
}

export default function ShopCheckout() {
    const [isClient, setIsClient] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
    const [loadingAddresses, setLoadingAddresses] = useState(true);

    // Cart and order calculation state
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [coinDiscountInfo, setCoinDiscountInfo] = useState<{ coins: number; discount: number } | null>(null);
    const [shippingCost, setShippingCost] = useState<number>(0); // 0 = Free shipping
    const [saveNewAddressToProfile, setSaveNewAddressToProfile] = useState(true);

    // Checkout Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        companyName: '',
        country: 'India',
        street: '',
        apartment: '',
        city: '',
        state: 'Rajasthan',
        zipCode: '',
        phone: '',
        email: '',
        orderNotes: '',
        paymentMethod: 'cod' // cod, bank, paypal
    });

    useEffect(() => {
        setIsClient(true);

        // 1. Load cart items
        try {
            const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartItems(storedCart);
        } catch (e) {
            console.error("Failed to parse cart", e);
        }

        // 2. Load applied coins from ShopCart
        try {
            const storedAppliedCoins = JSON.parse(localStorage.getItem('appliedCoins') || 'null');
            if (storedAppliedCoins && storedAppliedCoins.discount > 0) {
                setCoinDiscountInfo(storedAppliedCoins);
            }
        } catch (e) {
            console.error("Failed to parse applied coins", e);
        }

        // 3. Check login and load user addresses
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            setIsLoggedIn(true);
            const fetchAddresses = async () => {
                try {
                    setLoadingAddresses(true);
                    const res = await AddressService.getAddresses();
                    if (res.status && res.addresses && res.addresses.length > 0) {
                        setSavedAddresses(res.addresses);
                        // Auto-select default or first address
                        const defaultAddr = res.addresses.find(a => a.isDefault) || res.addresses[0];
                        if (defaultAddr && defaultAddr._id) {
                            setSelectedAddressId(defaultAddr._id);
                            applyAddressToForm(defaultAddr);
                        }
                    } else {
                        setSelectedAddressId('new');
                    }
                } catch (err) {
                    console.warn("Could not load user addresses", err);
                    setSelectedAddressId('new');
                } finally {
                    setLoadingAddresses(false);
                }
            };
            fetchAddresses();
        } else {
            setIsLoggedIn(false);
            setLoadingAddresses(false);
            setSelectedAddressId('new');
        }
    }, []);

    const applyAddressToForm = (addr: UserAddress) => {
        const nameParts = (addr.fullName || '').trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        setFormData(prev => ({
            ...prev,
            firstName: firstName || prev.firstName,
            lastName: lastName || prev.lastName,
            street: addr.street || '',
            city: addr.city || '',
            state: addr.state || 'Rajasthan',
            zipCode: addr.zipCode || '',
            country: addr.country || 'India',
            phone: addr.phone || prev.phone
        }));
    };

    const handleSelectSavedAddress = (addrId: string) => {
        setSelectedAddressId(addrId);
        if (addrId === 'new') {
            setFormData(prev => ({
                ...prev,
                street: '',
                apartment: '',
                city: '',
                zipCode: ''
            }));
        } else {
            const found = savedAddresses.find(a => a._id === addrId);
            if (found) {
                applyAddressToForm(found);
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Subtotal
    const subtotal = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + parseFloat(String(item.price || 0)) * (item.quantity || 1), 0);
    }, [cartItems]);

    // Coin Discount
    const coinDiscount = coinDiscountInfo?.discount || 0;
    const coinsUsed = coinDiscountInfo?.coins || 0;

    // Final Total
    const finalTotal = Math.max(0, subtotal - coinDiscount + shippingCost);

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (cartItems.length === 0) {
            toast.error("Your cart is empty!");
            return;
        }

        if (!formData.street || !formData.city || !formData.zipCode) {
            toast.error("Please fill in your delivery street address, city, and ZIP code.");
            return;
        }

        // If user entered a new address and opted to save it to their profile
        if (isLoggedIn && selectedAddressId === 'new' && saveNewAddressToProfile) {
            try {
                await AddressService.addAddress({
                    type: 'home',
                    fullName: `${formData.firstName} ${formData.lastName}`.trim(),
                    phone: formData.phone,
                    street: formData.apartment ? `${formData.street}, ${formData.apartment}` : formData.street,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: formData.country,
                    isDefault: savedAddresses.length === 0
                });
            } catch (err) {
                console.warn("Could not save new address to profile", err);
            }
        }

        toast.success("Order placed successfully! Thank you for shopping with us.");
        // Clear cart
        localStorage.removeItem('cart');
        localStorage.removeItem('appliedCoins');
        window.dispatchEvent(new Event('cartUpdated'));

        // Redirect to confirmation or orders
        setTimeout(() => {
            window.location.href = "/account-orders";
        }, 1500);
    };

    if (!isClient) return null;

    return (
        <div className="page-content bg-light">
            <CommanBanner parentText="Home" mainText="Shop Checkout" currentText="Shop Checkout" image={IMAGES.BackBg1.src} />
            <div className="content-inner-1">
                <div className="container">
                    <div className="row shop-checkout">
                        <div className="col-xl-8">
                            <h4 className="title m-b15">Billing & Delivery Details</h4>

                            {!isLoggedIn && (
                                <Accordion className="dz-accordion accordion-sm mb-4" id="accordionFaq" defaultActiveKey={"0"}>
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header className="accordion-header" id="headingOne">
                                            Returning customer? Click here to log in
                                            <span className="toggle-close"></span>
                                        </Accordion.Header>
                                        <Accordion.Body className="accordion-body">
                                            <p className="m-b10">
                                                Log in to access your saved addresses and reward coin balance directly at checkout.
                                            </p>
                                            <Link href="/login" className="btn btn-primary btn-sm">
                                                Log In to Account
                                            </Link>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            )}

                            {/* SAVED ADDRESS SELECTOR */}
                            {isLoggedIn && (
                                <div className="mb-4 p-3 bg-white rounded border">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                            <span>📍</span> Select Shipping Address
                                        </h6>
                                        <Link href="/account-address" className="btn btn-link p-0 small text-decoration-none">
                                            Manage Addresses in Profile →
                                        </Link>
                                    </div>

                                    {loadingAddresses ? (
                                        <div className="text-muted small py-2">
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Loading saved addresses...
                                        </div>
                                    ) : savedAddresses.length > 0 ? (
                                        <div className="row g-2 mb-3">
                                            {savedAddresses.map((addr) => {
                                                const isSelected = selectedAddressId === addr._id;
                                                return (
                                                    <div key={addr._id} className="col-md-6">
                                                        <div
                                                            className={`p-3 rounded border h-100 cursor-pointer transition-all ${isSelected ? 'border-primary' : 'border-light-subtle'}`}
                                                            style={{
                                                                backgroundColor: isSelected ? '#f0f7ff' : '#fafafa',
                                                                cursor: 'pointer',
                                                                boxShadow: isSelected ? '0 2px 8px rgba(13, 110, 253, 0.15)' : 'none'
                                                            }}
                                                            onClick={() => handleSelectSavedAddress(addr._id || '')}
                                                        >
                                                            <div className="d-flex align-items-center justify-content-between mb-2">
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <input
                                                                        type="radio"
                                                                        name="selectedAddress"
                                                                        checked={isSelected}
                                                                        onChange={() => handleSelectSavedAddress(addr._id || '')}
                                                                        className="form-check-input mt-0"
                                                                    />
                                                                    <Badge
                                                                        bg={addr.type === 'home' ? 'primary' : addr.type === 'office' ? 'warning' : 'info'}
                                                                        style={{ fontSize: '10px' }}
                                                                    >
                                                                        {addr.type === 'home' ? '🏠 Home' : addr.type === 'office' ? '🏢 Office' : '📍 Other'}
                                                                    </Badge>
                                                                </div>
                                                                {addr.isDefault && (
                                                                    <Badge bg="success" style={{ fontSize: '10px' }}>★ Default</Badge>
                                                                )}
                                                            </div>

                                                            {addr.fullName && (
                                                                <div className="fw-bold small text-dark mb-1">{addr.fullName}</div>
                                                            )}
                                                            <div className="text-muted small mb-1">{addr.street}</div>
                                                            <div className="text-muted small">
                                                                {addr.city}, {addr.state} - {addr.zipCode}
                                                            </div>
                                                            {addr.phone && (
                                                                <div className="text-dark small mt-1">📞 {addr.phone}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* Deliver to a different address card */}
                                            <div className="col-md-6">
                                                <div
                                                    className={`p-3 rounded border h-100 cursor-pointer d-flex flex-column justify-content-center align-items-center text-center ${selectedAddressId === 'new' ? 'border-primary bg-primary-subtle' : 'border-light-subtle bg-white'}`}
                                                    style={{ cursor: 'pointer', minHeight: '120px' }}
                                                    onClick={() => handleSelectSavedAddress('new')}
                                                >
                                                    <div className="d-flex align-items-center gap-2 mb-1">
                                                        <input
                                                            type="radio"
                                                            name="selectedAddress"
                                                            checked={selectedAddressId === 'new'}
                                                            onChange={() => handleSelectSavedAddress('new')}
                                                            className="form-check-input mt-0"
                                                        />
                                                        <span className="fw-semibold small">Deliver to a new address</span>
                                                    </div>
                                                    <small className="text-muted">Enter a custom address below</small>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-muted small mb-3">
                                            No saved addresses found in your profile. Fill in the details below and we can save it for you!
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ADDRESS FORM */}
                            <form className="row" onSubmit={handlePlaceOrder}>
                                <div className="col-md-6">
                                    <div className="form-group m-b25">
                                        <label className="label-title">First Name <span className='text-danger'>*</span></label>
                                        <input
                                            name="firstName"
                                            required
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className="form-control"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group m-b25">
                                        <label className="label-title">Last Name</label>
                                        <input
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className="form-control"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group m-b25">
                                        <label className="label-title">Company Name (optional)</label>
                                        <input
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleInputChange}
                                            className="form-control"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="m-b25 value-select">
                                        <label className="label-title">Country / Region <span className='text-danger'>*</span></label>
                                        <Form.Select
                                            name="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                        >
                                            <option value="India">India</option>
                                            <option value="Nepal">Nepal</option>
                                            <option value="UK">UK</option>
                                            <option value="USA">USA</option>
                                        </Form.Select>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group m-b25">
                                        <label className="label-title">Street Address <span className='text-danger'>*</span></label>
                                        <input
                                            name="street"
                                            required
                                            value={formData.street}
                                            onChange={handleInputChange}
                                            className="form-control m-b15"
                                            placeholder="House number, Street name"
                                        />
                                        <input
                                            name="apartment"
                                            value={formData.apartment}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="Apartment, suite, unit, etc. (optional)"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group m-b25">
                                        <label className="label-title">Town / City <span className='text-danger'>*</span></label>
                                        <input
                                            name="city"
                                            required
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="City"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group m-b25">
                                        <label className="label-title">State <span className='text-danger'>*</span></label>
                                        <input
                                            name="state"
                                            required
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="State"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group m-b25">
                                        <label className="label-title">ZIP / Postal Code <span className='text-danger'>*</span></label>
                                        <input
                                            name="zipCode"
                                            required
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="ZIP code"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group m-b25">
                                        <label className="label-title">Phone <span className='text-danger'>*</span></label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="Phone number"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group m-b25">
                                        <label className="label-title">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="Email address"
                                        />
                                    </div>
                                </div>

                                {isLoggedIn && selectedAddressId === 'new' && (
                                    <div className="col-md-12 m-b25">
                                        <div className="custom-control custom-checkbox">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="saveAddressCheckbox"
                                                checked={saveNewAddressToProfile}
                                                onChange={(e) => setSaveNewAddressToProfile(e.target.checked)}
                                            />
                                            <label className="form-check-label ms-2" htmlFor="saveAddressCheckbox">
                                                Save this address to my profile addresses
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <div className="col-md-12 m-b25">
                                    <div className="form-group">
                                        <label className="label-title">Order Notes (optional)</label>
                                        <textarea
                                            id="comments"
                                            name="orderNotes"
                                            value={formData.orderNotes}
                                            onChange={handleInputChange}
                                            placeholder="Notes about your order, e.g. special delivery instructions."
                                            className="form-control"
                                            cols={90}
                                            rows={3}
                                        ></textarea>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* ORDER DETAIL SIDEBAR */}
                        <div className="col-xl-4 side-bar">
                            <h4 className="title m-b15">Your Order</h4>
                            <div className="order-detail sticky-top">
                                {cartItems.length === 0 ? (
                                    <div className="text-center py-4">
                                        <div className="text-muted small mb-2">No items in your cart</div>
                                        <Link href="/products" className="btn btn-secondary btn-sm">
                                            Shop Now
                                        </Link>
                                    </div>
                                ) : (
                                    cartItems.map((item, idx) => (
                                        <div key={idx} className="cart-item style-1">
                                            <div className="dz-media">
                                                {item.image ? (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name || item.title || "product"}
                                                        width={60}
                                                        height={60}
                                                        style={{ objectFit: 'cover' }}
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <Image src={IMAGES.ShopCardPic1} alt="placeholder" />
                                                )}
                                            </div>
                                            <div className="dz-content">
                                                <h6 className="title mb-0">
                                                    {item.name || item.title}
                                                    {item.quantity > 1 ? ` x${item.quantity}` : ''}
                                                </h6>
                                                <span className="price">
                                                    ₹{(parseFloat(String(item.price)) * (item.quantity || 1)).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}

                                <table className="w-100">
                                    <tbody>
                                        <tr className="subtotal">
                                            <td>Subtotal</td>
                                            <td className="price text-end">₹{subtotal.toFixed(2)}</td>
                                        </tr>

                                        {coinDiscount > 0 && (
                                            <tr style={{ backgroundColor: '#f0fff4' }}>
                                                <td className="text-success fw-bold">
                                                    🪙 Reward Coins (🪙 {coinsUsed})
                                                </td>
                                                <td className="price text-end text-success fw-bold">
                                                    -₹{coinDiscount.toFixed(2)}
                                                </td>
                                            </tr>
                                        )}

                                        <tr className="title">
                                            <td colSpan={2}><h6 className="title font-weight-500 mb-0">Shipping</h6></td>
                                        </tr>
                                        <tr className="shipping">
                                            <td>
                                                <div className="custom-control custom-checkbox">
                                                    <input
                                                        className="form-check-input radio"
                                                        type="radio"
                                                        name="shippingType"
                                                        id="shipFree"
                                                        checked={shippingCost === 0}
                                                        onChange={() => setShippingCost(0)}
                                                    />
                                                    <label className="form-check-label ms-1" htmlFor="shipFree">
                                                        Free shipping
                                                    </label>
                                                </div>
                                                <div className="custom-control custom-checkbox">
                                                    <input
                                                        className="form-check-input radio"
                                                        type="radio"
                                                        name="shippingType"
                                                        id="shipFlat"
                                                        checked={shippingCost === 25}
                                                        onChange={() => setShippingCost(25)}
                                                    />
                                                    <label className="form-check-label ms-1" htmlFor="shipFlat">
                                                        Flat Rate (Express)
                                                    </label>
                                                </div>
                                            </td>
                                            <td className="price text-end">
                                                {shippingCost === 0 ? '₹0.00' : '₹25.00'}
                                            </td>
                                        </tr>
                                        <tr className="total border-top">
                                            <td><strong>Total</strong></td>
                                            <td className="price text-end">
                                                <h5 className="mb-0 fw-bold">₹{finalTotal.toFixed(2)}</h5>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* PAYMENT METHODS */}
                                <div className="accordion dz-accordion accordion-sm mt-3" id="accordionFaq1">
                                    <div className="accordion-item">
                                        <div className="accordion-header" id="heading1">
                                            <div className="accordion-button collapsed custom-control custom-checkbox border-0">
                                                <input
                                                    className="form-check-input radio"
                                                    type="radio"
                                                    name="paymentMethod"
                                                    id="payCod"
                                                    checked={formData.paymentMethod === 'cod'}
                                                    onChange={() => setFormData(p => ({ ...p, paymentMethod: 'cod' }))}
                                                />
                                                <label className="form-check-label ms-2 fw-semibold" htmlFor="payCod">
                                                    Cash on Delivery
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="accordion-item">
                                        <div className="accordion-header" id="heading2">
                                            <div className="accordion-button collapsed custom-control custom-checkbox border-0">
                                                <input
                                                    className="form-check-input radio"
                                                    type="radio"
                                                    name="paymentMethod"
                                                    id="payBank"
                                                    checked={formData.paymentMethod === 'bank'}
                                                    onChange={() => setFormData(p => ({ ...p, paymentMethod: 'bank' }))}
                                                />
                                                <label className="form-check-label ms-2 fw-semibold" htmlFor="payBank">
                                                    Direct Bank Transfer
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="accordion-item">
                                        <div className="accordion-header" id="heading3">
                                            <div className="accordion-button collapsed custom-control custom-checkbox border-0">
                                                <input
                                                    className="form-check-input radio"
                                                    type="radio"
                                                    name="paymentMethod"
                                                    id="payOnline"
                                                    checked={formData.paymentMethod === 'online'}
                                                    onChange={() => setFormData(p => ({ ...p, paymentMethod: 'online' }))}
                                                />
                                                <label className="form-check-label ms-2 fw-semibold" htmlFor="payOnline">
                                                    Online Payment
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <p className="text small mt-3">
                                    Your personal data will be used to process your order and support your experience throughout this website.
                                </p>

                                <button
                                    type="button"
                                    onClick={handlePlaceOrder}
                                    className="btn btn-secondary w-100"
                                >
                                    PLACE ORDER
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}