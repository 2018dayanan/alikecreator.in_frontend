'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MerchantRootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('merchantToken');
    if (token) {
      router.replace('/merchant/dashboard');
    } else {
      router.replace('/merchant/login');
    }
  }, [router]);

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading Merchant Portal...</span>
      </div>
    </div>
  );
}
