"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { FavoriteService, WishlistItem, getLocalWishlist } from "@/services/favoriteService";
import { toast } from "react-toastify";

interface WishlistContextType {
    wishlist: WishlistItem[];
    wishlistCount: number;
    loading: boolean;
    isFavorite: (productId?: string) => boolean;
    toggleFavorite: (product: any) => Promise<boolean>;
    removeFavorite: (productId: string) => Promise<void>;
    refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType>({
    wishlist: [],
    wishlistCount: 0,
    loading: false,
    isFavorite: () => false,
    toggleFavorite: async () => false,
    removeFavorite: async () => {},
    refreshWishlist: async () => {}
});

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(false);

    const refreshWishlist = useCallback(async () => {
        try {
            setLoading(true);
            const res = await FavoriteService.getFavorites();
            if (res.success && Array.isArray(res.data)) {
                setWishlist(res.data);
            } else {
                setWishlist(getLocalWishlist());
            }
        } catch (err) {
            console.error("Error loading wishlist in context:", err);
            setWishlist(getLocalWishlist());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Initial load
        setWishlist(getLocalWishlist());
        refreshWishlist();

        // Listen for updates from any part of the application or other tabs
        const handleWishlistUpdated = () => {
            setWishlist(getLocalWishlist());
        };

        window.addEventListener("wishlistUpdated", handleWishlistUpdated);
        window.addEventListener("storage", handleWishlistUpdated);

        return () => {
            window.removeEventListener("wishlistUpdated", handleWishlistUpdated);
            window.removeEventListener("storage", handleWishlistUpdated);
        };
    }, [refreshWishlist]);

    const isFavorite = useCallback(
        (productId?: string): boolean => {
            if (!productId) return false;
            return wishlist.some((item) => item.id === productId || item._id === productId);
        },
        [wishlist]
    );

    const toggleFavorite = useCallback(
        async (product: any): Promise<boolean> => {
            try {
                const prodId = product._id || product.id;
                if (!prodId) {
                    toast.error("Product information missing");
                    return false;
                }

                const res = await FavoriteService.toggleFavorite(product);
                if (res.success) {
                    if (res.isFavorite) {
                        toast.success(`"${product.title || product.name || 'Product'}" added to wishlist!`);
                    } else {
                        toast.info(`"${product.title || product.name || 'Product'}" removed from wishlist.`);
                    }
                    // Immediate local update
                    setWishlist(getLocalWishlist());
                    return res.isFavorite;
                }
                return false;
            } catch (err) {
                console.error("Error toggling wishlist item:", err);
                toast.error("Could not update wishlist");
                return false;
            }
        },
        []
    );

    const removeFavorite = useCallback(
        async (productId: string) => {
            try {
                await FavoriteService.removeFavorite(productId);
                setWishlist(getLocalWishlist());
                toast.info("Removed from wishlist");
            } catch (err) {
                console.error("Error removing from wishlist:", err);
                toast.error("Could not remove item");
            }
        },
        []
    );

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                wishlistCount: wishlist.length,
                loading,
                isFavorite,
                toggleFavorite,
                removeFavorite,
                refreshWishlist
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
