"use client";
import React, { useEffect, useState } from "react";
import CommanBanner from "@/components/CommanBanner";
import IMAGES from "@/constant/theme";
import CommanSidebar from "@/elements/MyAccount/CommanSidebar";
import Link from "next/link";
import { getMyWallet, getMyTransactions } from "@/services/walletService";

export default function AccountWallet() {
    const [wallet, setWallet] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("balance"); // 'balance' or 'coin'

    useEffect(() => {
        const fetchWalletData = async () => {
            try {
                setLoading(true);
                const walletData = await getMyWallet();
                if (walletData.status) {
                    setWallet(walletData.data);
                }

                const txData = await getMyTransactions({ walletType: filter });
                if (txData.status) {
                    setTransactions(txData.data);
                }
            } catch (error) {
                console.error("Error fetching wallet data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWalletData();
    }, [filter]);

    return (
        <div className="page-content bg-light">
            <CommanBanner image={IMAGES.BackBg1.src} mainText="Wallet" parentText="Home" currentText="Wallet" />
            <div className="content-inner-1">
                <div className="container">
                    <div className="row">
                        <CommanSidebar />
                        <section className="col-xl-9 account-wrapper">
                            <div className="account-card">
                                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                                    <h2 className="title mb-0">My Wallet</h2>
                                    <Link href="/account-wallet/recharge" className="btn btn-primary">
                                        Recharge Wallet
                                    </Link>
                                </div>

                                {loading && !wallet ? (
                                    <p>Loading wallet...</p>
                                ) : wallet ? (
                                    <div className="row mb-5">
                                        <div className="col-md-6 mb-3">
                                            <div className="card text-center shadow-sm p-4 h-100" style={{ borderTop: "4px solid var(--primary)" }}>
                                                <h5 className="text-muted mb-2">Main Balance</h5>
                                                <h2 className="text-primary font-weight-bold">{wallet.currency} {wallet.walletBalance?.toFixed(2)}</h2>
                                                <span className={`badge ${wallet.status === 'active' ? 'bg-success' : 'bg-danger'} mt-2`}>{wallet.status}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div className="card text-center shadow-sm p-4 h-100" style={{ borderTop: "4px solid #fbc02d" }}>
                                                <h5 className="text-muted mb-2">Reward Coins</h5>
                                                <h2 className="text-warning font-weight-bold">{wallet.walletCoin} Coins</h2>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p>No wallet found.</p>
                                )}

                                <div className="mb-4">
                                    <h4 className="title mb-3">Transaction History</h4>
                                    <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className={`nav-link ${filter === 'balance' ? 'active' : ''}`}
                                                onClick={() => setFilter('balance')}
                                                type="button">
                                                Main Balance
                                            </button>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className={`nav-link ${filter === 'coin' ? 'active' : ''}`}
                                                onClick={() => setFilter('coin')}
                                                type="button">
                                                Reward Coins
                                            </button>
                                        </li>
                                    </ul>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-hover border">
                                        <thead className="bg-light">
                                            <tr>
                                                <th>Date</th>
                                                <th>Transaction ID</th>
                                                <th>Source</th>
                                                <th>Type</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading && transactions.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="text-center py-4">Loading transactions...</td>
                                                </tr>
                                            ) : transactions.length > 0 ? (
                                                transactions.map((tx: any) => (
                                                    <tr key={tx._id}>
                                                        <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                                                        <td>{tx.transactionNumber || '-'}</td>
                                                        <td className="text-capitalize">{tx.source.replace('_', ' ')}</td>
                                                        <td>
                                                            <span className={`badge ${tx.transactionType === 'credit' ? 'bg-success' : 'bg-danger'}`}>
                                                                {tx.transactionType}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {tx.transactionType === 'credit' ? '+' : '-'}
                                                            {tx.walletType === 'balance' ? `${wallet?.currency} ${tx.amount.toFixed(2)}` : `${tx.amount} Coins`}
                                                        </td>
                                                        <td className="text-capitalize">{tx.status}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="text-center py-4">No transactions found for {filter}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
