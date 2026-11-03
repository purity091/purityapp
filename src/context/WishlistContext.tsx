import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { readWishlist, wishlistStorageKey, writeWishlist } from '../lib/wishlist';
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
    const storageKey = wishlistStorageKey(customerId);
    const [wishlistIds, setWishlistIds] = useState<string[]>(() => readWishlist());
    const [loading, setLoading] = useState(false);
    const requestIdRef = useRef(0);

    const refreshWishlist = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        const cachedIds = readWishlist(storageKey);
        setWishlistIds(cachedIds);

        if (!isSupabaseConfigured() || !customerId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('wishlist_items')
                .select('item_id')
                .eq('user_id', customerId)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching wishlist:', error);
                return;
            }

            const remoteIds = ((data || []) as WishlistRow[]).map(row => row.item_id);
            const guestIds = readWishlist();
            const idsToMigrate = guestIds.filter(id => !remoteIds.includes(id));

            if (idsToMigrate.length > 0) {
                const { error: migrationError } = await supabase
                    .from('wishlist_items')
                    .upsert(idsToMigrate.map(itemId => ({ user_id: customerId, item_id: itemId })), { onConflict: 'user_id,item_id' });

                if (!migrationError) {
                    remoteIds.push(...idsToMigrate);
                    writeWishlist([], wishlistStorageKey());
                } else {
                    console.error('Error migrating local wishlist:', migrationError);
                }
            }

            if (requestId !== requestIdRef.current) return;
            const uniqueIds = [...new Set(remoteIds)];
            setWishlistIds(uniqueIds);
            writeWishlist(uniqueIds, storageKey);
        } catch (error) {
            console.error('Could not refresh wishlist:', error);
        } finally {
            if (requestId === requestIdRef.current) setLoading(false);
        }
    }, [customerId, storageKey]);

    useEffect(() => {
        void refreshWishlist();
    }, [refreshWishlist]);

    const toggleWishlist = async (itemId: string) => {
        const previousIds = wishlistIds;
        const nextIds = previousIds.includes(itemId)
            ? previousIds.filter(id => id !== itemId)
            : [...previousIds, itemId];

        setWishlistIds(nextIds);
        writeWishlist(nextIds, storageKey);

        if (!isSupabaseConfigured() || !customerId) return { success: true };

        try {
            const result = previousIds.includes(itemId)
                ? await supabase.from('wishlist_items').delete().eq('user_id', customerId).eq('item_id', itemId)
                : await supabase.from('wishlist_items').upsert({ user_id: customerId, item_id: itemId }, { onConflict: 'user_id,item_id' });

            if (result.error) throw result.error;
            return { success: true };
        } catch (error) {
            console.error('Error updating wishlist:', error);
            setWishlistIds(previousIds);
            writeWishlist(previousIds, storageKey);
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
