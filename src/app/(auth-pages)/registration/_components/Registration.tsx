"use client";
import Link from "next/link";
import IMAGES from "@/constant/theme";
import PasswordInputBox from "@/components/PasswordInputBox";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "react-bootstrap";
import toast from "react-hot-toast";

export default function Registration() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);


    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);

        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, mobile, password }),
            });

            const data = await response.json();

            if (data.status) {
                toast.success(data.message || "OTP sent successfully");
                setIsOtpSent(true);
            } else {
                toast.error(data.message || "Registration failed");
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);

        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${API_BASE_URL}/auth/verifyOtp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (data.status) {
                toast.success("Registration complete! Redirecting to login...");
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            } else {
                toast.error(data.message || "Invalid OTP");
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-content bg-light">
            <section className="px-3">
                <div className="row">
                    <div className="col-xxl-6 col-xl-6 col-lg-6 start-side-content">
                        <div className="dz-bnr-inr-entry">
                            <h1>Registration</h1>
                            <nav aria-label="breadcrumb text-align-start" className="breadcrumb-row">
                                <ul className="breadcrumb">
                                    <li className="breadcrumb-item"><Link href="/"> Home</Link></li>
                                    <li className="breadcrumb-item">Registration</li>
                                </ul>
                            </nav>
                        </div>
                        <div className="registration-media">
                            <Image src={IMAGES.RegistrationPng3} alt="/" />
                        </div>
                    </div>
                    <div className="col-xxl-6 col-xl-6 col-lg-6 end-side-content justify-content-center">
                        <div className="login-area">
                            <h2 className="text-secondary text-center">Registration Now</h2>
                            <p className="text-center m-b30">Welcome please registration to your account</p>



                            {!isOtpSent ? (
                                <form onSubmit={handleRegister}>
                                    <div className="m-b25">
                                        <label className="label-title">Full Name</label>
                                        <input required className="form-control" placeholder="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
                                    </div>
                                    <div className="m-b25">
                                        <label className="label-title">Email Address</label>
                                        <input required className="form-control" placeholder="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                    </div>
                                    <div className="m-b25">
                                        <label className="label-title">Mobile Number</label>
                                        <input required className="form-control" placeholder="Mobile Number" type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                                    </div>
                                    <div className="m-b40">
                                        <label className="label-title">Password</label>
                                        <div className="secure-input ">
                                            <PasswordInputBox placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <button type="submit" className="btn btn-secondary btnhover text-uppercase me-2" disabled={loading}>
                                            {loading ? <Spinner size="sm" animation="border" /> : "Register"}
                                        </button>
                                        <Link href="/login" className="btn btn-outline-secondary btnhover text-uppercase">Sign In</Link>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp}>
                                    <div className="m-b25">
                                        <label className="label-title">Enter OTP</label>
                                        <input required className="form-control" placeholder="Enter OTP sent to your email" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} />
                                    </div>
                                    <div className="text-center">
                                        <button type="submit" className="btn btn-secondary btnhover text-uppercase me-2" disabled={loading}>
                                            {loading ? <Spinner size="sm" animation="border" /> : "Verify OTP"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}