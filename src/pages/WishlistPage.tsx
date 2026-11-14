import React, { useMemo, useState } from 'react';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CustomerAccountTabs } from '../components/feature/CustomerAccountTabs';
import { SafeImage } from '../components/ui/SafeImage';
import { useCatalog } from '../context/CatalogContext';
import { useWishlist } from '../context/WishlistContext';
import { getPricePresentation, getPriceUnitLabel } from '../lib/pricing';
import { Service } from '../types';
import { useLanguage } from '../context/LanguageContext';

export const WishlistPage: React.FC = () => {
    const { services, packages, loading } = useCatalog();
    const { wishlistIds, loading: wishlistLoading, toggleWishlist } = useWishlist();
    const { t } = useLanguage();
    const [actionError, setActionError] = useState('');

    const savedItems = useMemo(() => {
        const catalog = [...services, ...packages];
        return wishlistIds
            .map(id => catalog.find(item => item.id === id))
            .filter((item): item is Service => Boolean(item));
    }, [packages, services, wishlistIds]);

    const removeItem = async (serviceId: string) => {
        setActionError('');
        const result = await toggleWishlist(serviceId);
        if (!result.success) setActionError(result.error || 'Could not update your wishlist.');
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 pb-8 pt-5 md:px-5 md:pb-12 md:pt-8" dir="ltr">
            <div className="mx-auto w-full max-w-5xl">
                <CustomerAccountTabs />
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-5 md:mb-8">
                    <div>
                        <p className="mb-1 text-xs font-semibold uppercase text-rose-600">Saved for later</p>
                        <h1 className="text-2xl font-semibold text-slate-950 md:text-3xl">Wishlist</h1>
                        <p className="mt-1 text-sm text-slate-500">{t('packagesDescription')}</p>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">{savedItems.length} saved</span>
                </div>

                {actionError && <p role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{actionError}</p>}

                {(loading || wishlistLoading) && savedItems.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">{t('available')}...</div>
                ) : savedItems.length === 0 ? (
                    <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                        <span className="rounded-xl bg-rose-50 p-3 text-rose-600"><Heart size={24} /></span>
                        <h2 className="mt-4 text-lg font-semibold text-slate-950">{t('wishlist')}</h2>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{t('packagesDescription')}</p>
                        <Link to="/" className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"><ShoppingBag size={16} /> {t('services')}</Link>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {savedItems.map(item => <SavedItemCard key={item.id} item={item} onRemove={removeItem} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

const SavedItemCard: React.FC<{ item: Service; onRemove: (id: string) => void | Promise<void> }> = ({ item, onRemove }) => {
    const { originalPrice, discount } = getPricePresentation(item);
    const { language, t } = useLanguage();

    return (
        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md">
            <div className="relative aspect-[16/10] bg-slate-100">
                <SafeImage src={item.image} alt={item.name} className="h-full w-full object-cover" />
                <span className="absolute left-3 top-3 rounded-md border border-white/80 bg-white/95 px-2 py-1 text-[10px] font-semibold text-slate-700 shadow-sm">{item.offerTag || item.category}</span>
                <button type="button" onClick={() => onRemove(item.id)} aria-label={`${t('removeFromWishlist')}: ${item.name}`} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-white/95 text-rose-600 shadow-sm transition hover:bg-rose-50"><Trash2 size={15} /></button>
            </div>
            <div className="p-4">
                <h2 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-950">{item.name}</h2>
                <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">{item.description}</p>
                <div className="mt-4 flex flex-wrap items-baseline gap-1.5 border-t border-slate-100 pt-3">
                    {originalPrice && <span className="text-xs font-medium text-slate-400 line-through">AED {originalPrice}</span>}
                    <strong className="text-base font-bold text-emerald-700">AED {item.price}</strong>
                    <span className="text-[11px] font-medium text-slate-600">{getPriceUnitLabel(item, language)}</span>
                    {discount > 0 && <span className="rounded-md border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">-{discount}%</span>}
                </div>
                <Link to="/" state={{ serviceId: item.id }} className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 text-xs font-semibold text-white transition hover:bg-slate-800"><ShoppingBag size={14} /> {t('confirmBookNow')}</Link>
            </div>
        </article>
    );
};
