// src/services/productService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3087/api/v1';

/**
 * Automatically extracts the merchant subdomain from:
 * 1. Explicit parameter (if supplied)
 * 2. URL search query: ?subdomain=daya
 * 3. Hostname: daya.localhost, daya.example.com
 */
export const getActiveSubdomain = (explicitSubdomain?: string): string | undefined => {
    if (explicitSubdomain && explicitSubdomain.trim()) {
        return explicitSubdomain.trim().toLowerCase();
    }
    if (typeof window !== 'undefined') {
        // 1. Check URL query param (?subdomain=xxx)
        const urlParams = new URLSearchParams(window.location.search);
        const querySubdomain = urlParams.get('subdomain');
        if (querySubdomain && querySubdomain.trim()) {
            return querySubdomain.trim().toLowerCase();
        }

        // 2. Check Hostname (e.g. daya.localhost or daya.mystore.com)
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        if (parts.length > 1) {
            const firstPart = parts[0].toLowerCase().trim();
            // Ignore www, localhost, and IP addresses
            if (
                firstPart !== 'www' && 
                firstPart !== 'localhost' && 
                firstPart !== '127' && 
                !/^\d+$/.test(firstPart)
            ) {
                return firstPart;
            }
        }
    }
    return undefined;
};

export const ProductService = {
    /**
     * Fetch all public categories (with automatic subdomain filter)
     */
    getPublicCategories: async (subdomain?: string) => {
        try {
            const activeSubdomain = getActiveSubdomain(subdomain);
            const url = activeSubdomain 
                ? `${API_BASE_URL}/public/categories?subdomain=${encodeURIComponent(activeSubdomain)}`
                : `${API_BASE_URL}/public/categories`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching categories:", error);
            throw error;
        }
    },

    /**
     * Fetch all public products (with automatic subdomain filter)
     */
    getPublicProducts: async (subdomain?: string) => {
        try {
            const activeSubdomain = getActiveSubdomain(subdomain);
            const url = activeSubdomain 
                ? `${API_BASE_URL}/public/products?subdomain=${encodeURIComponent(activeSubdomain)}`
                : `${API_BASE_URL}/public/products`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching products:", error);
            throw error;
        }
    },

    /**
     * Fetch products by category (with automatic subdomain filter)
     */
    getProductsByCategory: async (categoryId: string, subdomain?: string) => {
        try {
            const activeSubdomain = getActiveSubdomain(subdomain);
            const url = activeSubdomain
                ? `${API_BASE_URL}/public/categories/${categoryId}/products?subdomain=${encodeURIComponent(activeSubdomain)}`
                : `${API_BASE_URL}/public/categories/${categoryId}/products`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching products for category ${categoryId}:`, error);
            throw error;
        }
    },

    /**
     * Fetch random products (with automatic subdomain filter)
     */
    getRandomProducts: async (limit: number = 10, subdomain?: string) => {
        try {
            const activeSubdomain = getActiveSubdomain(subdomain);
            const url = activeSubdomain
                ? `${API_BASE_URL}/public/products/random?limit=${limit}&subdomain=${encodeURIComponent(activeSubdomain)}`
                : `${API_BASE_URL}/public/products/random?limit=${limit}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching random products:", error);
            throw error;
        }
    },

    /**
     * Fetch merchant store details by subdomain
     */
    getMerchantBySubdomain: async (subdomain?: string) => {
        try {
            const activeSubdomain = getActiveSubdomain(subdomain);
            if (!activeSubdomain) {
                return null;
            }
            const response = await fetch(`${API_BASE_URL}/public/merchant/subdomain/${encodeURIComponent(activeSubdomain)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching merchant store by subdomain:", error);
            throw error;
        }
    },

    /**
     * Fetch active public carousel banners by subdomain
     */
    getPublicCarousels: async (subdomain?: string) => {
        try {
            const activeSubdomain = getActiveSubdomain(subdomain);
            const url = activeSubdomain
                ? `${API_BASE_URL}/public/carousels?subdomain=${encodeURIComponent(activeSubdomain)}`
                : `${API_BASE_URL}/public/carousels`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching public carousels:", error);
            return { success: false, data: [] };
        }
    },

    /**
     * Fetch active public Discover / Latest Collection products by subdomain
     */
    getPublicDiscover: async (subdomain?: string) => {
        try {
            const activeSubdomain = getActiveSubdomain(subdomain);
            const url = activeSubdomain
                ? `${API_BASE_URL}/public/discover?subdomain=${encodeURIComponent(activeSubdomain)}`
                : `${API_BASE_URL}/public/discover`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching public discover collection:", error);
            return { success: false, data: [] };
        }
    },

    /**
     * Fetch active public news articles (with optional merchant subdomain filter, search & pagination)
     */
    getPublicNews: async (subdomain?: string, page = 1, limit = 10, search = '') => {
        try {
            const activeSubdomain = getActiveSubdomain(subdomain);
            let url = `${API_BASE_URL}/public/news?page=${page}&limit=${limit}`;
            if (activeSubdomain) {
                url += `&subdomain=${encodeURIComponent(activeSubdomain)}`;
            }
            if (search) {
                url += `&search=${encodeURIComponent(search)}`;
            }
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching public news:", error);
            return { success: false, data: [] };
        }
    },

    /**
     * Fetch single public news article by ID
     */
    getPublicNewsById: async (id: string) => {
        try {
            const url = `${API_BASE_URL}/public/news/${id}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching public news by id:", error);
            return { success: false, data: null };
        }
    }
};
