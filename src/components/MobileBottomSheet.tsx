"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const MobileBottomSheet = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            if (token) {
                setIsLoggedIn(true);
            }
        };
        checkAuth();
    }, []);

    const handleWalletClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isLoggedIn) {
            router.push('/wallet');
        } else {
            router.push('/login');
        }
    };

    const handleSearchClick = (e: React.MouseEvent) => {
        e.preventDefault();
        router.push('/search-photo');
    };

    const toggleSheet = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div 
            className="d-block d-lg-none bg-white shadow-lg border-top" 
            style={{ 
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1040,
                borderTopLeftRadius: '24px', 
                borderTopRightRadius: '24px',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isExpanded ? 'translateY(0)' : 'translateY(calc(100% - 30px))',
            }}
        >
            {/* Top Bar / Handle */}
            <div 
                onClick={toggleSheet}
                className="w-100 d-flex justify-content-center align-items-center"
                style={{ height: '30px', cursor: 'pointer' }}
            >
                <div style={{ width: '40px', height: '5px', backgroundColor: '#e0e0e0', borderRadius: '10px' }}></div>
            </div>

            {/* Content */}
            <div className="d-flex justify-content-around align-items-center pb-3 pt-1">
                <div onClick={handleWalletClick} className="text-center text-decoration-none" style={{ cursor: 'pointer' }}>
                    <div className="d-flex flex-column align-items-center">
                        <i className="iconly-Light-Wallet text-primary" style={{ fontSize: '26px' }}></i>
                        <span style={{ fontSize: '12px', fontWeight: 500, marginTop: '4px', color: '#333' }}>Wallet</span>
                    </div>
                </div>
                <div onClick={handleSearchClick} className="text-center text-decoration-none" style={{ cursor: 'pointer' }}>
                    <div className="d-flex flex-column align-items-center">
                        <i className="iconly-Light-Camera text-primary" style={{ fontSize: '26px' }}></i>
                        <span style={{ fontSize: '12px', fontWeight: 500, marginTop: '4px', color: '#333' }}>Search Photo</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileBottomSheet;
