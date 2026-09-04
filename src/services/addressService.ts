// src/services/addressService.ts

import { handleAuthResponse } from "./apiClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface UserAddress {
    _id?: string;
    type: 'home' | 'office' | 'other';
    fullName?: string;
    phone?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
    isDefault?: boolean;
}

const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

export const AddressService = {
    getAddresses: async (): Promise<{ status: boolean; addresses: UserAddress[]; message?: string }> => {
        const token = getAuthToken();
        if (!token) return { status: false, addresses: [] };

        const response = await fetch(`${API_BASE_URL}/user/addresses`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await handleAuthResponse(response);
    },

    addAddress: async (address: UserAddress): Promise<{ status: boolean; address: UserAddress; addresses: UserAddress[]; message?: string }> => {
        const token = getAuthToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/user/addresses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(address)
        });

        return await handleAuthResponse(response);
    },

    updateAddress: async (addressId: string, address: Partial<UserAddress>): Promise<{ status: boolean; address: UserAddress; addresses: UserAddress[]; message?: string }> => {
        const token = getAuthToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/user/addresses/${addressId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(address)
        });

        return await handleAuthResponse(response);
    },

    deleteAddress: async (addressId: string): Promise<{ status: boolean; addresses: UserAddress[]; message?: string }> => {
        const token = getAuthToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/user/addresses/${addressId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await handleAuthResponse(response);
    },

    setDefaultAddress: async (addressId: string): Promise<{ status: boolean; addresses: UserAddress[]; message?: string }> => {
        const token = getAuthToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/user/addresses/${addressId}/default`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await handleAuthResponse(response);
    }
};
