// src/services/favoriteService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface WishlistItem {
    id: string;
    _id?: string;
    productId?: any;
    title: string;
    name?: string;
    price: number;
    originalPrice?: number;
    image: string;
    images?: string[];
    quantity?: number;
    inStock?: boolean;
    purchaseType?: 'internal' | 'external';
    externalLink?: string;
}

const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

export const getLocalWishlist = (): WishlistItem[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem('wishlist');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

export const setLocalWishlist = (items: WishlistItem[]): void => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('wishlist', JSON.stringify(items));
        window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (err) {
        console.error('Error saving local wishlist:', err);
    }
};

export const FavoriteService = {
    /**
     * Fetch user favorites from backend API (with fallback to local storage)
     */
    getFavorites: async (): Promise<{ success: boolean; data: WishlistItem[]; count: number }> => {
        const token = getAuthToken();

        if (token) {
            try {
                const response = await fetch(`${API_BASE_URL}/user/favorites`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success && Array.isArray(result.data)) {
                        const formattedItems: WishlistItem[] = result.data
                            .filter((item: any) => item.productId)
                            .map((item: any) => {
                                const prod = item.productId;
                                const prodId = prod._id || prod.id || item._id;
                                const img = prod.image || (Array.isArray(prod.images) && prod.images[0]) || '';
                                return {
                                    id: prodId,
                                    _id: prodId,
                                    productId: prod,
                                    title: prod.title || prod.name || 'Product',
                                    name: prod.title || prod.name || 'Product',
                                    price: typeof prod.price === 'number' ? prod.price : parseFloat(prod.price || 0),
                                    originalPrice: prod.originalPrice || prod.cutprice || (prod.price ? Math.round(prod.price * 1.2) : 0),
                                    image: img,
                                    images: prod.images || (img ? [img] : []),
                                    quantity: prod.quantity !== undefined ? prod.quantity : 10,
                                    inStock: prod.quantity === null || prod.quantity === undefined || prod.quantity > 0,
                                    purchaseType: prod.purchaseType || 'internal',
                                    externalLink: prod.externalLink || ''
                                };
                            });

                        // Cache in localStorage
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('wishlist', JSON.stringify(formattedItems));
                            window.dispatchEvent(new Event('wishlistUpdated'));
                        }

                        return {
                            success: true,
                            data: formattedItems,
                            count: formattedItems.length
                        };
                    }
                }
            } catch (error) {
                console.error('Error fetching favorites from API, using fallback:', error);
            }
        }

        // Fallback to localStorage for guest or offline
        const local = getLocalWishlist();
        return {
            success: true,
            data: local,
            count: local.length
        };
    },

    /**
     * Toggle favorite item in backend API & local storage
     */
    toggleFavorite: async (product: any): Promise<{ success: boolean; isFavorite: boolean; message: string }> => {
        const prodId = product._id || product.id;
        if (!prodId) {
            return { success: false, isFavorite: false, message: 'Invalid product ID' };
        }

        const token = getAuthToken();
        const localList = getLocalWishlist();
        const existingIndex = localList.findIndex((item) => (item.id === prodId || item._id === prodId));
        const currentlyFavorite = existingIndex !== -1;

        let backendSuccess = false;
        let isFavorite = !currentlyFavorite;

        if (token && /^[0-9a-fA-F]{24}$/.test(prodId)) {
            try {
                const response = await fetch(`${API_BASE_URL}/user/favorites/toggle`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ productId: prodId })
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        backendSuccess = true;
                        isFavorite = result.isFavorite;
                    }
                }
            } catch (err) {
                console.error('Error calling backend favorite toggle:', err);
            }
        }

        // Update local state
        let updatedList: WishlistItem[];
        if (isFavorite) {
            const img = product.image || (Array.isArray(product.images) && product.images[0]) || '';
            const newItem: WishlistItem = {
                id: prodId,
                _id: prodId,
                title: product.title || product.name || 'Product',
                name: product.title || product.name || 'Product',
                price: typeof product.price === 'number' ? product.price : parseFloat(product.price || 0),
                originalPrice: product.originalPrice || product.cutprice || (product.price ? Math.round(product.price * 1.2) : 0),
                image: img,
                images: product.images || (img ? [img] : []),
                quantity: product.quantity !== undefined ? product.quantity : 10,
                inStock: product.quantity === null || product.quantity === undefined || product.quantity > 0,
                purchaseType: product.purchaseType || 'internal',
                externalLink: product.externalLink || ''
            };
            if (!currentlyFavorite) {
                updatedList = [newItem, ...localList];
            } else {
                updatedList = localList;
            }
        } else {
            updatedList = localList.filter((item) => item.id !== prodId && item._id !== prodId);
        }

        setLocalWishlist(updatedList);

        return {
            success: true,
            isFavorite,
            message: isFavorite ? 'Added to wishlist' : 'Removed from wishlist'
        };
    },

    /**
     * Remove an item from wishlist
     */
    removeFavorite: async (productId: string): Promise<boolean> => {
        const token = getAuthToken();
        if (token && /^[0-9a-fA-F]{24}$/.test(productId)) {
            try {
                await fetch(`${API_BASE_URL}/user/favorites/toggle`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ productId })
                });
            } catch (err) {
                console.error('Error removing favorite from backend:', err);
            }
        }

        const localList = getLocalWishlist();
        const updatedList = localList.filter((item) => item.id !== productId && item._id !== productId);
        setLocalWishlist(updatedList);
        return true;
    }
};
