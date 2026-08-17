// src/services/productService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
     * Fetch all public products
     */
    getPublicProducts: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/public/products`);
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
     * Fetch products by category
     */
    getProductsByCategory: async (categoryId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/public/categories/${categoryId}/products`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching products for category ${categoryId}:`, error);
            throw error;
        }
    }
};
