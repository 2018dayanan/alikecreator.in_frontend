"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import CommanBanner from "@/components/CommanBanner";
import IMAGES from "@/constant/theme";
import CommanSidebar from "@/elements/MyAccount/CommanSidebar";
import CommanLayout from "@/components/CommanLayout";
import { OrderService } from "@/services/orderService";
import { Spinner } from "react-bootstrap";

interface OrderItem {
    _id: string;
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    createdAt: string;
    items?: Array<{
        title: string;
        quantity: number;
        price: number;
    }>;
}

export default function AccountOrder() {
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const res = await OrderService.getMyOrders();
                if (res.status && Array.isArray(res.data)) {
                    setOrders(res.data);
                }
            } catch (err) {
                console.error("Error fetching orders:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
                return 'bg-success';
            case 'processing':
            case 'shipped':
                return 'bg-info text-dark';
            case 'cancelled':
                return 'bg-danger';
            default:
                return 'bg-warning text-dark';
        }
    };

    const getPaymentBadge = (method: string, paymentStatus: string) => {
        if (method === 'Wallet') {
            return <span className="badge bg-success ms-1">💰 Wallet ({paymentStatus})</span>;
        }
        return <span className="badge bg-secondary ms-1">{method} ({paymentStatus})</span>;
    };

    return (
        <CommanLayout>
            <div className="page-content bg-light">
                <CommanBanner image={IMAGES.BackBg1.src} mainText="Orders" parentText="Home" currentText="Orders" />
                <div className="content-inner-1">
                    <div className="container">
                        <div className="row">
                            <CommanSidebar />
                            <div className="col-xl-9 account-wrapper">
                                <div className="account-card">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h4 className="mb-0">Order History</h4>
                                        <Link href="/products" className="btn btn-secondary btn-sm">
                                            Continue Shopping
                                        </Link>
                                    </div>

                                    {loading ? (
                                        <div className="text-center py-5">
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            <span>Loading your orders...</span>
                                        </div>
                                    ) : orders.length === 0 ? (
                                        <div className="text-center py-5 border rounded bg-white">
                                            <div style={{ fontSize: '2.5rem' }}>📦</div>
                                            <h6 className="mt-2 mb-1">No orders found</h6>
                                            <p className="text-muted small mb-3">You haven&apos;t placed any orders yet.</p>
                                            <Link href="/products" className="btn btn-secondary btn-sm">
                                                Start Shopping
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="table-responsive table-style-1">
                                            <table className="table check-tbl table-hover mb-3">
                                                <thead>
                                                    <tr>
                                                        <th>Order #</th>
                                                        <th>Date Purchased</th>
                                                        <th>Items</th>
                                                        <th>Total</th>
                                                        <th>Payment</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orders.map((elem) => (
                                                        <tr key={elem._id}>
                                                            <td>
                                                                <span className="fw-semibold font-monospace">
                                                                    #{elem._id.slice(-6).toUpperCase()}
                                                                </span>
                                                            </td>
                                                            <td className="small text-muted">
                                                                {new Date(elem.createdAt).toLocaleDateString("en-IN", {
                                                                    day: "numeric",
                                                                    month: "short",
                                                                    year: "numeric"
                                                                })}
                                                            </td>
                                                            <td className="small">
                                                                {elem.items && elem.items.length > 0 ? (
                                                                    elem.items.map(it => `${it.title} (x${it.quantity})`).join(", ")
                                                                ) : "Items"}
                                                            </td>
                                                            <td className="fw-bold">
                                                                ₹{elem.totalAmount?.toFixed(2)}
                                                            </td>
                                                            <td>
                                                                {getPaymentBadge(elem.paymentMethod, elem.paymentStatus)}
                                                            </td>
                                                            <td>
                                                                <span className={`badge m-0 ${getStatusBadge(elem.orderStatus)}`}>
                                                                    {elem.orderStatus}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}                                            
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CommanLayout>
    );
}