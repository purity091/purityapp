import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface WishlistContextValue {
    wishlistIds: string[];
    loading: boolean;
    toggleWishlist: (itemId: string) => Promise<{ success: boolean; error?: string }>;
    refreshWishlist: () => Promise<void>;
}

interface WishlistRow {
    item_id: string;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

const getErrorMessage = (error: { message?: string } | null | undefined) => error?.message || 'Could not update your wishlist.';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const customerId = user?.role === 'customer' ? user.id : undefined;
    const [wishlistIds, setWishlistIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const requestIdRef = useRef(0);

    const refreshWishlist = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        if (!isSupabaseConfigured() || !customerId) {
            setWishlistIds([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('wishlist_items')
                .select('item_id')
                .eq('user_id', customerId)
                .is('deleted_at', null)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching wishlist:', error);
                setWishlistIds([]);
                return;
            }

            const remoteIds = ((data || []) as WishlistRow[]).map(row => row.item_id);
            if (requestId !== requestIdRef.current) return;
            const uniqueIds = [...new Set(remoteIds)];
            setWishlistIds(uniqueIds);
        } catch (error) {
            console.error('Could not refresh wishlist:', error);
        } finally {
            if (requestId === requestIdRef.current) setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        void refreshWishlist();
    }, [refreshWishlist]);

    const toggleWishlist = async (itemId: string) => {
        const previousIds = wishlistIds;
        const nextIds = previousIds.includes(itemId)
            ? previousIds.filter(id => id !== itemId)
            : [...previousIds, itemId];

        if (!isSupabaseConfigured() || !customerId) {
            return { success: false, error: 'Please sign in with your customer account first.' };
        }

        setWishlistIds(nextIds);

        try {
            const result = await supabase.rpc('set_wishlist_item', {
                p_item_id: itemId,
                p_saved: !previousIds.includes(itemId),
            });

            if (result.error) throw result.error;
            return { success: true };
        } catch (error) {
            console.error('Error updating wishlist:', error);
            setWishlistIds(previousIds);
            return { success: false, error: getErrorMessage(error as { message?: string }) };
        }
    };

    return <WishlistContext.Provider value={{ wishlistIds, loading, toggleWishlist, refreshWishlist }}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
    return context;
};
