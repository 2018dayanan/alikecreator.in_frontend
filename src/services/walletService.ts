// src/services/walletService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3087/api/v1';

const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

export const getMyWallet = async () => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/user/wallet`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });

    const data = await response.json();
    if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to fetch wallet');
    }
    return data;
};

export const getMyTransactions = async (params: { walletType?: string; transactionType?: string; page?: number; limit?: number } = {}) => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const queryParams = new URLSearchParams();
    if (params.walletType) queryParams.append('walletType', params.walletType);
    if (params.transactionType) queryParams.append('transactionType', params.transactionType);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/user/wallet/transactions${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });

    const data = await response.json();
    if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to fetch transactions');
    }
    return data;
};

export const submitRechargeRequest = async (formData: FormData) => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/user/wallet/recharge`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
            // Note: Don't set Content-Type for FormData, browser will set it with boundary
        },
        body: formData
    });

    const data = await response.json();
    if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to submit recharge request');
    }
    return data;
};

export const getMyRechargeRequests = async (params: { status?: string; page?: number; limit?: number } = {}) => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/user/wallet/recharge-history${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });

    const data = await response.json();
    if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to fetch recharge requests');
    }
    return data;
};
