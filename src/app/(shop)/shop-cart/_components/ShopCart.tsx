"use client"
import Link from 'next/link'
import CommanBanner from "@/components/CommanBanner";
import IMAGES from "@/constant/theme";
import { useEffect, useState, useMemo } from "react";
import Image from 'next/image';
import { getMyWallet } from "@/services/walletService";
import { ProductService, getActiveSubdomain } from "@/services/productService";

export default function ShopCart() {
    const [shopItem, setShopItem] = useState<any[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userWalletCoins, setUserWalletCoins] = useState<number | null>(null);
    const [useCoins, setUseCoins] = useState<boolean>(true); // Enabled by default if user has coins

    // Load and enrich cart
    useEffect(() => {
        setIsClient(true);
        const loadCart = async () => {
            const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');

            // Check if any items are missing maxRedeemableCoins and backfill them from API
            const needsEnrichment = storedCart.some((item: any) => item.maxRedeemableCoins === undefined);
            if (needsEnrichment && storedCart.length > 0) {
                try {
                    const subdomain = getActiveSubdomain();
                    const prodRes = await ProductService.getPublicProducts(subdomain, 1, 100);
                    const allProds = prodRes.data || prodRes.products || [];
                    const enriched = storedCart.map((item: any) => {
                        if (item.maxRedeemableCoins !== undefined) return item;
                        const match = allProds.find((p: any) => String(p._id || p.id) === String(item.id || item._id));
                        return {
                            ...item,
                            maxRedeemableCoins: match ? (match.maxRedeemableCoins || 0) : 0,
                            rewardCoins: match ? (match.rewardCoins || null) : (item.rewardCoins || null)
                        };
                    });
                    setShopItem(enriched);
                    localStorage.setItem('cart', JSON.stringify(enriched));
                    return;
                } catch (e) {
                    console.warn("Could not enrich cart products", e);
                }
            }
            setShopItem(storedCart);
        };

        loadCart();
        window.addEventListener('cartUpdated', loadCart);
        return () => window.removeEventListener('cartUpdated', loadCart);
    }, []);

    // Check user login and fetch wallet coins
    useEffect(() => {
        const fetchWallet = async () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            if (token) {
                setIsLoggedIn(true);
                try {
                    const walletRes = await getMyWallet();
                    if (walletRes && walletRes.data) {
                        setUserWalletCoins(walletRes.data.walletCoin ?? 0);
                    }
                } catch (e) {
                    console.warn("Could not load user wallet", e);
                }
            } else {
                setIsLoggedIn(false);
            }
        };
        fetchWallet();
    }, []);

    const saveCart = (items: any[]) => {
        setShopItem(items);
        localStorage.setItem('cart', JSON.stringify(items));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const handleRemove = (index: number) => {
        const newItems = shopItem.filter((_, i) => i !== index);
        saveCart(newItems);
    };

    function handleIncrease(ind: number) {
        const updateData = [...shopItem];
        updateData[ind] = {
            ...updateData[ind],
            quantity: (updateData[ind].quantity || 1) + 1,
        };
        saveCart(updateData);
    }

    function handledDecrease(ind: number) {
        const updateData = [...shopItem];
        const newQty = (updateData[ind].quantity || 1) - 1;
        updateData[ind] = {
            ...updateData[ind],
            quantity: newQty > 0 ? newQty : 1,
        };
        saveCart(updateData);
    }

    // Subtotal before coin discount
    const subtotal = useMemo(() => {
        return shopItem.reduce((acc, item) => acc + parseFloat(item.price || 0) * (item.quantity || 1), 0);
    }, [shopItem]);

    // 1. Take max reward coins from each product (e.g. Product 1: 10, Product 2: 20)
    const productCoinBreakdown = useMemo(() => {
        return shopItem.map((item) => {
            const unitCoins = Number(item.maxRedeemableCoins) || 0;
            const qty = item.quantity || 1;
            const itemTotalCoins = unitCoins * qty;
            return {
                id: item.id || item._id,
                name: item.name || item.title || 'Product',
                unitCoins,
                qty,
                totalCoins: itemTotalCoins,
                discount: itemTotalCoins // 1 Coin = ₹1 reduction
            };
        });
    }, [shopItem]);

    // 2. Sum up coins allowed across all products (e.g. 10 + 20 = 30 coins)
    const totalProductCoinsAllowed = useMemo(() => {
        return productCoinBreakdown.reduce((sum, item) => sum + item.totalCoins, 0);
    }, [productCoinBreakdown]);

    // 3. User's available coins in their wallet account
    const userCoins = isLoggedIn && userWalletCoins !== null ? userWalletCoins : 0;

    // 4. Actual coins to deduct from user's account:
    // MUST have coins in user account! Limited by product allowance, wallet coins, and subtotal.
    const actualCoinsToDeduct = useMemo(() => {
        if (!useCoins) return 0;
        if (!isLoggedIn || userCoins <= 0) return 0;
        return Math.min(userCoins, totalProductCoinsAllowed, Math.floor(subtotal));
    }, [useCoins, isLoggedIn, userCoins, totalProductCoinsAllowed, subtotal]);

    // 5. Final price reduction (1 Coin = ₹1.00)
    const coinDiscount = actualCoinsToDeduct;
    const finalTotal = Math.max(0, subtotal - coinDiscount);

    // Save coin discount preference for checkout
    const handleProceedToCheckout = () => {
        if (typeof window !== 'undefined') {
            if (useCoins && actualCoinsToDeduct > 0) {
                localStorage.setItem('appliedCoins', JSON.stringify({
                    coins: actualCoinsToDeduct,
                    discount: coinDiscount,
                    subtotal: subtotal,
                    finalTotal: finalTotal
                }));
            } else {
                localStorage.removeItem('appliedCoins');
            }
        }
    };

    if (!isClient) return null;

    return (
        <div className="page-content bg-light">
            <CommanBanner parentText="Home" currentText="Shop Cart" mainText="Shop Cart" image={IMAGES.BackBg1.src} />
            <section className="content-inner shop-account">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8">
                            <div className="table-responsive">
                                <table className="table check-tbl">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th></th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th className="text-center">Max Coin Off</th>
                                            <th>Subtotal</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shopItem.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="text-center py-5">
                                                    <h5 className="text-muted mb-3">Your cart is empty</h5>
                                                    <Link href="/products" className="btn btn-secondary btn-sm">
                                                        Browse Products
                                                    </Link>
                                                </td>
                                            </tr>
                                        ) : (
                                            shopItem.map((data, ind) => {
                                                const itemUnitCoins = Number(data.maxRedeemableCoins) || 0;
                                                const itemTotalCoins = itemUnitCoins * (data.quantity || 1);

                                                return (
                                                    <tr key={ind}>
                                                        <td className="product-item-img">
                                                            {data.image ? <Image src={data.image} alt="/" width={100} height={100} style={{ objectFit: 'cover' }} unoptimized /> : null}
                                                        </td>
                                                        <td className="product-item-name">
                                                            <div className="fw-semibold">{data.name || data.title}</div>
                                                            {itemUnitCoins > 0 ? (
                                                                <div className="mt-1">
                                                                    <span
                                                                        className="badge"
                                                                        style={{
                                                                            backgroundColor: '#fff3cd',
                                                                            color: '#856404',
                                                                            border: '1px solid #ffeeba',
                                                                            fontSize: '11px',
                                                                            fontWeight: 500,
                                                                            padding: '2px 6px'
                                                                        }}
                                                                    >
                                                                        🪙 Max {itemUnitCoins} coins/unit
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="mt-1">
                                                                    <span className="text-muted" style={{ fontSize: '11px' }}>
                                                                        No coin discount
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="product-item-price">₹{data.price}</td>
                                                        <td className="product-item-quantity">
                                                            <div className="quantity btn-quantity style-1 me-3">
                                                                <div className="input-group bootstrap-touchspin">
                                                                    <span className="input-group-addon bootstrap-touchspin-prefix" style={{ display: "none" }}></span>
                                                                    <input type="text" value={data.quantity || 1} name="demo_vertical2" className="form-control" style={{ display: "block" }} readOnly />
                                                                    <span className="input-group-addon bootstrap-touchspin-postfix" style={{ display: "none" }}></span>
                                                                    <span className="input-group-btn-vertical">
                                                                        <button className="btn btn-default bootstrap-touchspin-up" type="button"
                                                                            onClick={() => handleIncrease(ind)}
                                                                        >
                                                                            <i className="fa-solid fa-plus" />
                                                                        </button>
                                                                        <button className="btn btn-default bootstrap-touchspin-down" type="button"
                                                                            onClick={() => handledDecrease(ind)}
                                                                        >
                                                                            <i className="fa-solid fa-minus" />
                                                                        </button>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="product-item-coins text-center align-middle">
                                                            {itemTotalCoins > 0 ? (
                                                                <div>
                                                                    <span
                                                                        className="badge"
                                                                        style={{
                                                                            backgroundColor: '#e6fffa',
                                                                            color: '#234e52',
                                                                            border: '1px solid #b2f5ea',
                                                                            fontSize: '11px',
                                                                            fontWeight: 600
                                                                        }}
                                                                    >
                                                                        🪙 {itemTotalCoins}
                                                                    </span>
                                                                    <div className="text-success small fw-bold mt-1">
                                                                        -₹{itemTotalCoins.toFixed(2)}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted small">—</span>
                                                            )}
                                                        </td>
                                                        <td className="product-item-totle">₹{(parseFloat(data.price) * (data.quantity || 1)).toFixed(2)}</td>
                                                        <td className="product-item-close">
                                                            <Link href="#" onClick={(e) => { e.preventDefault(); handleRemove(ind); }}><i className="ti-close" /></Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="row shop-form m-t30">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <div className="input-group mb-0">
                                            <input name="dzEmail" required type="text" className="form-control" placeholder="Coupon Code" />
                                            <div className="input-group-addon">
                                                <button name="submit" value="Submit" type="submit" className="btn coupon">
                                                    Apply Coupon
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 text-end">
                                    <Link href="/products" className="btn btn-outline-secondary me-2">CONTINUE SHOPPING</Link>
                                    <Link href="/shop-cart" className="btn btn-secondary">UPDATE CART</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <h4 className="title mb15">Cart Total</h4>
                            <div className="cart-detail">

                                {/* 🪙 REWARD COINS PER-PRODUCT BREAKDOWN & REDUCTION */}
                                {totalProductCoinsAllowed > 0 && (
                                    <div
                                        className="p-3 mb-3 rounded"
                                        style={{
                                            backgroundColor: '#fffdf5',
                                            border: '1px solid #f6d365',
                                            boxShadow: '0 2px 6px rgba(246, 211, 101, 0.15)'
                                        }}
                                    >
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <span style={{ fontSize: '1.4rem' }}>🪙</span>
                                                <div>
                                                    <h6 className="mb-0 fw-bold text-dark">Reward Coins</h6>
                                                    <small className="text-muted" style={{ fontSize: '11px' }}>1 Coin = ₹1.00 Price Reduction</small>
                                                </div>
                                            </div>
                                            <span
                                                className="badge"
                                                style={{
                                                    backgroundColor: '#ffeaa7',
                                                    color: '#634a00',
                                                    border: '1px solid #fdcb6e',
                                                    fontSize: '11px',
                                                    fontWeight: 700
                                                }}
                                            >
                                                Cart Limit: 🪙 {totalProductCoinsAllowed}
                                            </span>
                                        </div>

                                        {/* User Wallet Account Status */}
                                        {isLoggedIn ? (
                                            <>
                                                <div className="d-flex justify-content-between align-items-center py-2 px-2 rounded mb-2 small" style={{ backgroundColor: '#ffffff', border: '1px dashed #dcdde1' }}>
                                                    <span className="text-muted">In Your Account (walletCoin):</span>
                                                    <strong className={userCoins > 0 ? "text-success" : "text-danger"}>
                                                        🪙 {userWalletCoins !== null ? userWalletCoins : '...'} Coins
                                                    </strong>
                                                </div>

                                                {userCoins > 0 ? (
                                                    <div>
                                                        <div className="form-check form-switch my-2">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                role="switch"
                                                                id="applyProductCoinsSwitch"
                                                                checked={useCoins}
                                                                onChange={(e) => setUseCoins(e.target.checked)}
                                                            />
                                                            <label className="form-check-label fw-semibold small text-dark" htmlFor="applyProductCoinsSwitch">
                                                                Redeem Coins from Account
                                                            </label>
                                                        </div>

                                                        {useCoins && (
                                                            <div className="small text-success fw-semibold mb-2">
                                                                ✓ Deducting 🪙 {actualCoinsToDeduct} coins to reduce final price by ₹{coinDiscount.toFixed(2)}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="small text-muted p-2 rounded mb-2" style={{ backgroundColor: '#f8f9fa' }}>
                                                        ⚠️ You need coins in your account to redeem this discount. Earn reward coins on purchases to use on future orders!
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="p-2 rounded mb-2" style={{ backgroundColor: '#ffffff', border: '1px solid #eee' }}>
                                                <div className="small text-muted mb-1">
                                                    You must have coins in your account to redeem this discount.
                                                </div>
                                                <Link href="/login" className="btn btn-outline-dark btn-sm w-100 mt-1">
                                                    Log in to Use Account Coins
                                                </Link>
                                            </div>
                                        )}

                                        {/* Per-Product Breakdown */}
                                        <div className="p-2 rounded mt-2" style={{ backgroundColor: '#ffffff', border: '1px solid #fae392' }}>
                                            <div className="small fw-bold text-muted mb-1 pb-1 border-bottom d-flex justify-content-between">
                                                <span>Product Max Coins:</span>
                                                <span>Limit</span>
                                            </div>
                                            {productCoinBreakdown.map((item, idx) => (
                                                <div key={idx} className="d-flex justify-content-between align-items-center py-1 small">
                                                    <span className="text-truncate me-2" style={{ maxWidth: '160px' }} title={item.name}>
                                                        {item.name} {item.qty > 1 ? `(x${item.qty})` : ''}
                                                    </span>
                                                    <span className={item.totalCoins > 0 ? "text-muted text-nowrap" : "text-muted text-nowrap"}>
                                                        {item.totalCoins > 0 ? `🪙 ${item.totalCoins} (max ₹${item.totalCoins.toFixed(2)})` : '0'}
                                                    </span>
                                                </div>
                                            ))}
                                            <div className="d-flex justify-content-between align-items-center pt-2 mt-1 border-top fw-bold small text-dark">
                                                <span>Total Max Allowed:</span>
                                                <span className="text-dark">🪙 {totalProductCoinsAllowed} (₹{totalProductCoinsAllowed.toFixed(2)})</span>
                                            </div>
                                            {actualCoinsToDeduct > 0 && (
                                                <div className="d-flex justify-content-between align-items-center pt-1 fw-bold small text-success">
                                                    <span>Deducted from Account:</span>
                                                    <span>-₹{coinDiscount.toFixed(2)} (🪙 {actualCoinsToDeduct})</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <Link href="#" className="btn btn-outline-secondary w-100 m-b20">Bank Offer 5% Cashback</Link>

                                <div className="icon-bx-wraper style-4 m-b15">
                                    <div className="icon-bx">
                                        <i className="flaticon flaticon-ship"></i>
                                    </div>
                                    <div className="icon-content">
                                        <span className="font-14">FREE</span>
                                        <h6 className="dz-title">Enjoy The Product</h6>
                                    </div>
                                </div>
                                <div className="icon-bx-wraper style-4 m-b20">
                                    <div className="icon-bx">
                                        <Image src={IMAGES.ShopIconBox} alt="/" />
                                    </div>
                                    <div className="icon-content">
                                        <h6 className="dz-title">Fast Delivery</h6>
                                        <p>Secure checkout and prompt doorstep shipment</p>
                                    </div>
                                </div>

                                <div className="save-text mb-3">
                                    <i className="icon feather icon-check-circle"></i>
                                    <span className="m-l10">
                                        {actualCoinsToDeduct > 0
                                            ? `You save ₹${coinDiscount.toFixed(2)} using 🪙 ${actualCoinsToDeduct} coins from your account!`
                                            : totalProductCoinsAllowed > 0
                                                ? `Eligible for up to ₹${totalProductCoinsAllowed.toFixed(2)} discount if you have coins in your account!`
                                                : `You will save ₹0 on this order`}
                                    </span>
                                </div>

                                <table className="table-bordered w-100 mb-3" style={{ borderCollapse: 'collapse' }}>
                                    <tbody>
                                        <tr>
                                            <td className="p-2 text-muted">Subtotal</td>
                                            <td className="p-2 text-end fw-semibold">₹{subtotal.toFixed(2)}</td>
                                        </tr>
                                        {actualCoinsToDeduct > 0 && (
                                            <tr style={{ backgroundColor: '#f0fff4' }}>
                                                <td className="p-2 text-success fw-semibold">
                                                    <div>🪙 Coins Redeemed</div>
                                                    <small className="text-muted" style={{ fontSize: '11px' }}>
                                                        Deducted from your account (🪙 {actualCoinsToDeduct})
                                                    </small>
                                                </td>
                                                <td className="p-2 text-end text-success fw-bold">
                                                    -₹{coinDiscount.toFixed(2)}
                                                </td>
                                            </tr>
                                        )}
                                        <tr className="total border-top">
                                            <td className="p-2">
                                                <h6 className="mb-0 fw-bold">Final Total</h6>
                                            </td>
                                            <td className="p-2 text-end price">
                                                <h5 className="mb-0 fw-bold text-dark">₹{finalTotal.toFixed(2)}</h5>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <Link
                                    href="/shop-checkout"
                                    className="btn btn-secondary w-100"
                                    onClick={handleProceedToCheckout}
                                >
                                    PLACE ORDER
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}