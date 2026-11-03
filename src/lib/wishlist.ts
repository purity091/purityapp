const LS_WISHLIST_KEY = 'purity_wishlist';

export const wishlistStorageKey = (userId?: string) => userId ? `${LS_WISHLIST_KEY}_${userId}` : LS_WISHLIST_KEY;

export const readWishlist = (key = LS_WISHLIST_KEY): string[] => {
    try {
        const value = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
    } catch {
        return [];
    }
};

export const writeWishlist = (ids: string[], key = LS_WISHLIST_KEY) => {
    try {
        localStorage.setItem(key, JSON.stringify(ids));
    } catch {
        // Local cache is optional; the account data remains in Supabase.
    }
    window.dispatchEvent(new Event('purity:wishlist-updated'));
};
