"use client";
import Link from "next/link";
import IMAGES from "../../constant/theme";
import Image from "next/image";
import { useEffect, useState } from "react";

type MenuItem = {
    title: string;
    url: string;
  };
  
  const accountMenu: MenuItem[] = [
    { title: "Dashboard", url: "/account-dashboard" },
    { title: "Orders", url: "/account-orders" },
    { title: "Downloads", url: "/account-downloads" },
    { title: "Return request", url: "/account-return-request" },
  ];
  
  const accountSettingsMenu: MenuItem[] = [
    { title: "Profile", url: "/account-profile" },
    { title: "Address", url: "/account-address" },
    { title: "Shipping methods", url: "/account-shipping-methods" },
    { title: "Payment Methods", url: "/account-payment-methods" },
    { title: "Review", url: "/account-review" },
];

export default function CommanSidebar(){
    const [user, setUser] = useState<{name?: string; email?: string; profile_picture?: string} | null>(null);

    useEffect(() => {
        // Initially load from local storage if available for instant display
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {}
        }

        // Fetch fresh profile data
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3087/api/v1';
                const response = await fetch(`${API_BASE_URL}/user/myprofile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (data.status && data.user) {
                    setUser(data.user);
                    // Update local storage with fresh data
                    localStorage.setItem("user", JSON.stringify(data.user));
                }
            } catch (error) {
                console.error("Error fetching profile", error);
            }
        };

        fetchProfile();
    }, []);

    return(
        <aside className="col-xl-3">
            <div className="toggle-info">
                <h5 className="title mb-0">Account Navbar</h5>
                <a className="toggle-btn" href="#accountSidebar">Account Menu</a>
            </div>
            <div className="sticky-top account-sidebar-wrapper">
                <div className="account-sidebar" id="accountSidebar">
                    <div className="profile-head">
                        <div className="user-thumb">
                            <Image className="rounded-circle" src={user?.profile_picture || IMAGES.ProfilePic} width={100} height={100} alt="User Profile" />
                        </div>
                        <h5 className="title mb-0">{user?.name || "Loading..."}</h5>
                        <span className="text text-primary">{user?.email || ""}</span>
                    </div>
                    <div className="account-nav">
                        <div className="nav-title bg-light">DASHBOARD</div>
                        <ul>
                            {accountMenu.map((elem, index)=>(
                                <li key={index}><Link href={elem.url}>{elem.title}</Link></li>
                            ))}                            
                        </ul>
                        <div className="nav-title bg-light">ACCOUNT SETTINGS</div>
                        <ul className="account-info-list">
                            {accountSettingsMenu.map((elem, ind)=>(
                                <li key={ind}><Link href={elem.url}>{elem.title}</Link></li>
                            ))}                            
                        </ul>
                    </div>
                </div>
            </div>
        </aside>
    )
} 