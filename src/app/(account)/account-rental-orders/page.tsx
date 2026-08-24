"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import CommanBanner from "@/components/CommanBanner";
import CommanLayout from "@/components/CommanLayout";
import CommanSidebar from "@/elements/MyAccount/CommanSidebar";
import { Spinner, Alert, Badge } from "react-bootstrap";
import IMAGES from "@/constant/theme";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface RentalOrder {
    _id: string;
    totalAmount: number;
    securityDeposit: number;
    rentalPrice: number;
    rewardCoinsEarned: number;
    rentalDuration: string;
    rentalStartDate: string;
    rentalEndDate: string;
    orderStatus: string;
    paymentStatus: string;
    createdAt: string;
    productId: {
        _id: string;
        title: string;
        image: string;
    };
}

export default function AccountRentalOrdersPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [orders, setOrders] = useState<RentalOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            router.push("/login");
        } else {
            setToken(storedToken);
            setIsAuthorized(true);
        }
    }, [router]);

    useEffect(() => {
        if (!isAuthorized) return;

        const fetchRentalOrders = async () => {
            try {
                const res = await fetch(`${API_URL}/user/rental/orders`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await res.json();
                
                if (data.status) {
                    setOrders(data.data);
                } else {
                    setError(data.message || "Failed to fetch rental orders");
                }
            } catch (err) {
                setError("A network error occurred while fetching orders.");
            } finally {
                setLoading(false);
            }
        };

        fetchRentalOrders();
    }, [isAuthorized, token]);

    if (!isAuthorized) {
        return null; // or spinner
    }

    return (
        <CommanLayout>
            <div className="page-content bg-light">
                <CommanBanner image={IMAGES.BackBg1.src} mainText="Rental Orders" parentText="Home" currentText="Rental Orders" />
                
                <div className="content-inner-1">
                    <div className="container">
                        <div className="row">
                            {/* Sidebar */}
                            <CommanSidebar />
                            
                            {/* Main Content */}
                            <section className="col-xl-9 account-wrapper">
                                <div className="account-card">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h4 className="title mb-0">My Rental Orders</h4>
                                        <Link href="/rental/product" className="btn btn-primary btn-sm rounded-pill">
                                            Rent More Items
                                        </Link>
                                    </div>

                                    {loading ? (
                                        <div className="text-center py-5">
                                            <Spinner animation="border" variant="primary" />
                                        </div>
                                    ) : error ? (
                                        <Alert variant="danger">{error}</Alert>
                                    ) : orders.length === 0 ? (
                                        <div className="text-center py-5 bg-white border rounded">
                                            <i className="fa-solid fa-box-open fa-3x text-muted mb-3"></i>
                                            <h5>You have no rental orders yet.</h5>
                                            <p className="text-muted">Explore our collection and rent items for your special occasions.</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover border align-middle bg-white">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Order ID</th>
                                                        <th>Product</th>
                                                        <th>Rental Period</th>
                                                        <th>Total Paid</th>
                                                        <th>Status</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orders.map((order) => (
                                                        <tr key={order._id}>
                                                            <td>
                                                                <span className="text-muted small">#{order._id.substring(0, 8).toUpperCase()}</span>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <div style={{ width: '40px', height: '40px' }} className="position-relative bg-light rounded overflow-hidden flex-shrink-0">
                                                                        {order.productId?.image ? (
                                                                            <Image src={order.productId.image} alt={order.productId.title || "Product"} fill style={{ objectFit: 'cover' }} />
                                                                        ) : (
                                                                            <i className="fa-solid fa-image text-muted position-absolute top-50 start-50 translate-middle"></i>
                                                                        )}
                                                                    </div>
                                                                    <span className="fw-semibold text-truncate" style={{ maxWidth: '150px' }}>
                                                                        {order.productId?.title || 'Unknown Product'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="small">
                                                                    <div className="fw-semibold text-dark">{new Date(order.rentalStartDate).toLocaleDateString()}</div>
                                                                    <div className="text-muted">to {new Date(order.rentalEndDate).toLocaleDateString()}</div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="fw-semibold">₹{order.totalAmount}</div>
                                                                <div className="small text-muted">Dep: ₹{order.securityDeposit}</div>
                                                            </td>
                                                            <td>
                                                                <Badge bg={
                                                                    order.orderStatus === 'completed' || order.orderStatus === 'returned' ? 'success' :
                                                                    order.orderStatus === 'cancelled' ? 'danger' :
                                                                    order.orderStatus === 'shipped' ? 'info' :
                                                                    'warning'
                                                                } className="text-dark bg-opacity-25 rounded-pill px-3 py-2">
                                                                    {order.orderStatus.toUpperCase()}
                                                                </Badge>
                                                                {order.rewardCoinsEarned > 0 && (
                                                                    <div className="small text-warning mt-1 fw-bold">
                                                                        +{order.rewardCoinsEarned} Coins
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <Link href={`/rental/product?categoryId=${order.productId?._id}`} className="btn btn-outline-dark btn-sm rounded-pill">
                                                                    View
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </CommanLayout>
    );
}
