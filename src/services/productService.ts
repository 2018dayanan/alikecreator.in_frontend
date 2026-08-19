// src/services/productService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3087/api/v1';

export const ProductService = {
    /**
     * Fetch all public categories
     */
    getPublicCategories: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/public/categories`);
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
     * Fetch all public products (with optional subdomain filter)
     */
    getPublicProducts: async (subdomain?: string) => {
        try {
            const url = subdomain 
                ? `${API_BASE_URL}/public/products?subdomain=${encodeURIComponent(subdomain)}`
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
     * Fetch products by category (with optional subdomain filter)
     */
    getProductsByCategory: async (categoryId: string, subdomain?: string) => {
        try {
            const url = subdomain
                ? `${API_BASE_URL}/public/categories/${categoryId}/products?subdomain=${encodeURIComponent(subdomain)}`
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
     * Fetch random products
     */
    getRandomProducts: async (limit: number = 10, subdomain?: string) => {
        try {
            const url = subdomain
                ? `${API_BASE_URL}/public/products/random?limit=${limit}&subdomain=${encodeURIComponent(subdomain)}`
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
    getMerchantBySubdomain: async (subdomain: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/public/merchant/subdomain/${encodeURIComponent(subdomain)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching merchant store by subdomain:", error);
            throw error;
        }
    }
};
