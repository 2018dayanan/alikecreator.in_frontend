// src/services/orderService.ts

import { handleAuthResponse } from "./apiClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface CreateOrderPayload {
    items: Array<{
        productId?: string;
        merchantId?: string;
        title: string;
        price: number;
        quantity: number;
        image?: string;
    }>;
    totalAmount: number;
    paymentMethod: 'Wallet' | 'COD' | 'NetBanking' | 'Card' | 'UPI';
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        phone: string;
    };
    coinsUsed?: number;
    coinDiscount?: number;
    notes?: string;
}

const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

export const OrderService = {
    createOrder: async (orderData: CreateOrderPayload) => {
        const token = getAuthToken();
        if (!token) throw new Error("You must be logged in to place an order");

        const response = await fetch(`${API_BASE_URL}/user/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });

        return await handleAuthResponse(response);
    },

    getMyOrders: async () => {
        const token = getAuthToken();
        if (!token) return { status: false, data: [] };

        const response = await fetch(`${API_BASE_URL}/user/orders`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await handleAuthResponse(response);
    }
};
