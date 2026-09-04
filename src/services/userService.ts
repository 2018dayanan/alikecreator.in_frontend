// src/services/userService.ts

import { handleAuthResponse } from "./apiClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

export interface UserProfile {
    _id: string;
    name: string;
    email?: string;
    mobile: string;
    gender?: string;
    profile_picture?: string;
    unique_id?: string;
    role?: string;
    status?: string;
}

export const UserService = {
    getMyProfile: async (): Promise<{ status: boolean; message?: string; user?: UserProfile }> => {
        const token = getAuthToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/user/myprofile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await handleAuthResponse(response);
    },

    updateProfile: async (data: FormData | Record<string, any>): Promise<{ status: boolean; message?: string; user?: UserProfile }> => {
        const token = getAuthToken();
        if (!token) throw new Error('Not authenticated');

        const isFormData = data instanceof FormData;
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${token}`
        };

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${API_BASE_URL}/user/updateProfile`, {
            method: 'PATCH',
            headers,
            body: isFormData ? data : JSON.stringify(data)
        });

        return await handleAuthResponse(response);
    }
};
