"use client";
import React, { useEffect, useState } from "react";
import CommanBanner from "@/components/CommanBanner";
import IMAGES from "@/constant/theme";
import CommanSidebar from "@/elements/MyAccount/CommanSidebar";
import Link from "next/link";
import { submitRechargeRequest, getMyRechargeRequests } from "@/services/walletService";

export default function AccountWalletRecharge() {
    const [amount, setAmount] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [userNote, setUserNote] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);

    const fetchRequests = async () => {
        try {
            setFetching(true);
            const data = await getMyRechargeRequests();
            if (data.status) {
                setRequests(data.data);
            }
        } catch (error) {
            console.error("Error fetching recharge requests", error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!amount || !transactionId || !file) {
            alert("Please fill all required fields and upload a screenshot.");
            return;
        }

        const formData = new FormData();
        formData.append("amount", amount);
        formData.append("transactionId", transactionId);
        formData.append("transactionPhoto", file);
        if (userNote) formData.append("userNote", userNote);

        try {
            setLoading(true);
            const res = await submitRechargeRequest(formData);
            if (res.status) {
                alert("Recharge request submitted successfully!");
                // Reset form
                setAmount("");
                setTransactionId("");
                setUserNote("");
                setFile(null);
                // Refresh list
                fetchRequests();
            }
        } catch (error: any) {
            alert(error.message || "Failed to submit request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-content bg-light">
            <CommanBanner image={IMAGES.BackBg1.src} mainText="Recharge Wallet" parentText="Wallet" currentText="Recharge" />
            <div className="content-inner-1">
                <div className="container">
                    <div className="row">
                        <CommanSidebar />
                        <section className="col-xl-9 account-wrapper">
                            <div className="account-card">
                                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                                    <h2 className="title mb-0">Recharge Request</h2>
                                    <Link href="/account-wallet" className="btn btn-outline-primary">
                                        &larr; Back to Wallet
                                    </Link>
                                </div>

                                <div className="row">
                                    <div className="col-lg-5 mb-5">
                                        <div className="card shadow-sm p-4 border-0 bg-light">
                                            <h5 className="mb-3">Submit a Top-up Request</h5>
                                            <form onSubmit={handleSubmit}>
                                                <div className="mb-3">
                                                    <label className="form-label">Amount (INR) <span className="text-danger">*</span></label>
                                                    <input 
                                                        type="number" 
                                                        className="form-control" 
                                                        value={amount} 
                                                        onChange={e => setAmount(e.target.value)}
                                                        placeholder="Enter amount"
                                                        min="1"
                                                        required 
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Transaction ID / UTR <span className="text-danger">*</span></label>
                                                    <input 
                                                        type="text" 
                                                        className="form-control" 
                                                        value={transactionId} 
                                                        onChange={e => setTransactionId(e.target.value)}
                                                        placeholder="e.g. UPI Ref No"
                                                        required 
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Payment Screenshot <span className="text-danger">*</span></label>
                                                    <input 
                                                        type="file" 
                                                        className="form-control" 
                                                        accept=".jpg,.jpeg,.png,.webp"
                                                        onChange={handleFileChange}
                                                        required 
                                                    />
                                                </div>
                                                <div className="mb-4">
                                                    <label className="form-label">Notes (Optional)</label>
                                                    <textarea 
                                                        className="form-control" 
                                                        rows={2}
                                                        value={userNote} 
                                                        onChange={e => setUserNote(e.target.value)}
                                                        placeholder="Any remarks"
                                                    />
                                                </div>
                                                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                                    {loading ? "Submitting..." : "Submit Request"}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                    
                                    <div className="col-lg-7">
                                        <h5 className="mb-3">My Recharge History</h5>
                                        <div className="table-responsive">
                                            <table className="table table-hover border">
                                                <thead className="bg-light">
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Amount</th>
                                                        <th>Ref ID</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {fetching && requests.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="text-center py-4">Loading history...</td>
                                                        </tr>
                                                    ) : requests.length > 0 ? (
                                                        requests.map((req: any) => (
                                                            <tr key={req._id}>
                                                                <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                                                <td>{req.amount}</td>
                                                                <td>{req.transactionId}</td>
                                                                <td>
                                                                    <span className={`badge ${
                                                                        req.status === 'approved' ? 'bg-success' : 
                                                                        req.status === 'rejected' ? 'bg-danger' : 
                                                                        'bg-warning text-dark'
                                                                    }`}>
                                                                        {req.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={4} className="text-center py-4">No recharge requests found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
