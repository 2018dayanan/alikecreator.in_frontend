"use client";

import React, { useEffect, useState } from "react";
import CommanBanner from "@/components/CommanBanner";
import IMAGES from "@/constant/theme";
import CommanSidebar from "@/elements/MyAccount/CommanSidebar";
import { UserService, UserProfile } from "@/services/userService";
import { Spinner } from "react-bootstrap";
import toast from "react-hot-toast";

export default function AccountProfile() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Form inputs
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);

    // Avatar state
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await UserService.getMyProfile();
                if (res.status && res.user) {
                    const userData = res.user;
                    setUser(userData);

                    const nameParts = (userData.name || "").trim().split(" ");
                    setFirstName(nameParts[0] || "");
                    setLastName(nameParts.slice(1).join(" ") || "");
                    setEmail(userData.email || "");
                    setMobile(userData.mobile || "");
                    if (userData.profile_picture) {
                        setPreviewUrl(userData.profile_picture);
                    }
                }
            } catch (err: any) {
                console.error("Error fetching profile:", err);
                toast.error(err.message || "Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const fileHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files ? e.target.files[0] : null;
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!firstName.trim()) {
            toast.error("First name is required");
            return;
        }

        if (!mobile.trim()) {
            toast.error("Mobile number is required");
            return;
        }

        if (newPassword) {
            if (newPassword.length < 6) {
                toast.error("Password must be at least 6 characters long");
                return;
            }
            if (newPassword !== confirmPassword) {
                toast.error("Passwords do not match");
                return;
            }
        }

        try {
            setUpdating(true);
            const formData = new FormData();
            const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
            formData.append("name", fullName);
            formData.append("mobile", mobile.trim());
            if (email.trim()) {
                formData.append("email", email.trim());
            }
            if (file) {
                formData.append("profile_picture", file);
            }
            if (newPassword.trim()) {
                formData.append("newPassword", newPassword.trim());
            }

            const res = await UserService.updateProfile(formData);

            if (res.status && res.user) {
                setUser(res.user);
                if (res.user.profile_picture) {
                    setPreviewUrl(res.user.profile_picture);
                }
                setNewPassword("");
                setConfirmPassword("");
                setFile(null);

                // Update cached user in localStorage if exists
                try {
                    const storedUser = localStorage.getItem("user");
                    if (storedUser) {
                        const parsed = JSON.parse(storedUser);
                        const merged = { ...parsed, ...res.user };
                        localStorage.setItem("user", JSON.stringify(merged));
                    }
                } catch (e) {
                    // ignore
                }

                toast.success(res.message || "Profile updated successfully!");
            } else {
                toast.error(res.message || "Failed to update profile");
            }
        } catch (err: any) {
            console.error("Update profile error:", err);
            toast.error(err.message || "Failed to update profile. Please try again.");
        } finally {
            setUpdating(false);
        }
    };

    const getAvatarBackground = () => {
        if (previewUrl) return `url(${previewUrl})`;
        if (user?.profile_picture) return `url(${user.profile_picture})`;
        return `url(${IMAGES.ProfilePic3.src})`;
    };

    return (
        <div className="page-content bg-light">
            <CommanBanner image={IMAGES.BackBg1.src} mainText="Profile" parentText="Home" currentText="Account Profile" />
            <div className="content-inner-1">
                <div className="container">
                    <div className="row">
                        <CommanSidebar />
                        <section className="col-xl-9 account-wrapper">
                            <div className="account-card">
                                {loading ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-2 text-muted small">Loading your profile...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="profile-edit">
                                            <div className="avatar-upload d-flex align-items-center">
                                                <div className="position-relative">
                                                    <div className="avatar-preview thumb">
                                                        <div
                                                            id="imagePreview"
                                                            style={{
                                                                backgroundImage: getAvatarBackground(),
                                                                backgroundSize: "cover",
                                                                backgroundPosition: "center",
                                                                borderRadius: "50%",
                                                                width: "100px",
                                                                height: "100px"
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="change-btn thumb-edit d-flex align-items-center flex-wrap">
                                                        <input
                                                            type="file"
                                                            className="form-control d-none"
                                                            onChange={fileHandler}
                                                            id="imageUpload"
                                                            accept=".png, .jpg, .jpeg, .webp"
                                                        />
                                                        <label htmlFor="imageUpload" className="btn btn-light ms-0" title="Upload new avatar">
                                                            <i className="fa-solid fa-camera" />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="clearfix">
                                                <h2 className="title mb-0">{user?.name || "My Account"}</h2>
                                                <span className="text text-primary">{user?.email || user?.mobile}</span>
                                                {user?.unique_id && (
                                                    <div className="text-muted small mt-1">
                                                        ID: <span className="font-monospace fw-semibold">{user.unique_id}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <form className="row" onSubmit={handleSubmit}>
                                            <div className="col-lg-6">
                                                <div className="form-group m-b25">
                                                    <label className="label-title">First Name <span className="text-danger">*</span></label>
                                                    <input
                                                        type="text"
                                                        name="firstName"
                                                        required
                                                        value={firstName}
                                                        onChange={(e) => setFirstName(e.target.value)}
                                                        className="form-control"
                                                        placeholder="First Name"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="form-group m-b25">
                                                    <label className="label-title">Last Name</label>
                                                    <input
                                                        type="text"
                                                        name="lastName"
                                                        value={lastName}
                                                        onChange={(e) => setLastName(e.target.value)}
                                                        className="form-control"
                                                        placeholder="Last Name"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="form-group m-b25">
                                                    <label className="label-title">Email Address</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="form-control"
                                                        placeholder="your-email@example.com"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="form-group m-b25">
                                                    <label className="label-title">Mobile Phone <span className="text-danger">*</span></label>
                                                    <input
                                                        type="tel"
                                                        name="mobile"
                                                        required
                                                        value={mobile}
                                                        onChange={(e) => setMobile(e.target.value)}
                                                        className="form-control"
                                                        placeholder="Mobile number"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="form-group m-b25">
                                                    <label className="label-title">New Password (leave blank to keep unchanged)</label>
                                                    <input
                                                        type="password"
                                                        name="newPassword"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        className="form-control"
                                                        placeholder="••••••••"
                                                        autoComplete="new-password"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="form-group m-b25">
                                                    <label className="label-title">Confirm New Password</label>
                                                    <input
                                                        type="password"
                                                        name="confirmPassword"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="form-control"
                                                        placeholder="••••••••"
                                                        autoComplete="new-password"
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-12 d-flex flex-wrap justify-content-between align-items-center mt-2">
                                                <div className="form-group mb-3 mb-sm-0">
                                                    <div className="custom-control custom-checkbox text-black">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="basic_checkbox_1"
                                                            checked={subscribeNewsletter}
                                                            onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                                                        />
                                                        <label className="form-check-label ms-2" htmlFor="basic_checkbox_1">
                                                            Subscribe me to Newsletter & updates
                                                        </label>
                                                    </div>
                                                </div>
                                                <button
                                                    className="btn btn-primary d-flex align-items-center gap-2"
                                                    type="submit"
                                                    disabled={updating}
                                                >
                                                    {updating ? (
                                                        <>
                                                            <Spinner animation="border" size="sm" />
                                                            <span>Saving Changes...</span>
                                                        </>
                                                    ) : (
                                                        "Update Profile"
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}