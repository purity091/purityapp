const LS_WISHLIST_KEY = 'purity_wishlist';

export const readWishlist = (): string[] => {
    try {
        const value = JSON.parse(localStorage.getItem(LS_WISHLIST_KEY) || '[]');
        return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
    } catch {
        return [];
    }
};

export const toggleWishlist = (serviceId: string): string[] => {
    const current = readWishlist();
    const next = current.includes(serviceId) ? current.filter(id => id !== serviceId) : [...current, serviceId];
    localStorage.setItem(LS_WISHLIST_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('purity:wishlist-updated'));
    return next;
};
