import React from 'react';
import { Flame, Star, Heart, Gift, Navigation, ArrowUpRight } from 'lucide-react';
import { Service } from '../../types';
import { SafeImage } from '../ui/SafeImage';
import { useCatalog } from '../../context/CatalogContext';
import { useWishlist } from '../../context/WishlistContext';
import { getPricePresentation, getPriceUnitLabel } from '../../lib/pricing';
import { useLanguage } from '../../context/LanguageContext';

interface FlashDealsProps {
    onSelect: (service: Service) => void;
}

export const FlashDeals: React.FC<FlashDealsProps> = ({ onSelect }) => {
    const { packages } = useCatalog();
    const { language, t } = useLanguage();

    return (
        <section id="offers" aria-labelledby="hot-packages-title" className="mb-7 w-full scroll-mt-20 bg-white py-5 sm:py-6">
            <div className="mb-5 px-1">
                <div className="min-w-0">
                    <h2 id="hot-packages-title" className="flex items-center gap-2 text-xl font-black text-gray-900 sm:text-2xl">
                        {t('hotPackages')}
                        <Flame className="shrink-0 text-amber-400" size={22} fill="currentColor" aria-hidden="true" />
                    </h2>
                    <p className="mt-1 max-w-xl text-xs font-medium leading-5 text-gray-500 sm:text-sm">
                        {t('packagesDescription')}
                    </p>
                </div>
            </div>

            <div className="flex w-full gap-4 overflow-x-auto overscroll-x-contain px-1 pb-2 snap-x snap-mandatory no-scrollbar">
                {packages.map((deal) => {
                    const { originalPrice, discount } = getPricePresentation(deal);

                    return (
                        <div
                            key={deal.id}
                            onClick={() => onSelect(deal)}
                            onKeyDown={(event) => {
                                if (event.target !== event.currentTarget) return;
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    onSelect(deal);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label={`${t('confirmBookNow')}: ${deal.name}`}
                            className="group relative flex w-[82vw] max-w-[282px] flex-none snap-start flex-col gap-3 rounded-2xl bg-white p-2.5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-[310px]"
                        >
                            {/* 1. Image Container (Aspect-Video 16:9 ratio) */}
                            <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 shadow-sm">
                                <SafeImage
                                    src={deal.image}
                                    alt={deal.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />

                                {/* Top-Left Badge */}
                                <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-lg bg-white/95 px-2 py-1 text-[10px] font-black text-slate-900 shadow-md backdrop-blur-sm">
                                    <Gift size={12} className="text-primary-600" aria-hidden="true" />
                                    <span className="max-w-[120px] truncate">{deal.offerTag}</span>
                                </span>

                                {/* Top-Right Wishlist Button */}
                                <WishlistButton serviceId={String(deal.id)} serviceName={deal.name} />
                            </div>

                            {/* 2. Content Info - High Contrast Typography */}
                            <div className="flex flex-1 flex-col gap-1 overflow-hidden px-1 pb-1">
                                {/* Merchant Name */}
                                <div className="hidden" aria-hidden="true">
                                    <span className="text-xs font-bold text-gray-700">Purity Home Dubai · <span className="text-gray-900 font-extrabold">{deal.category}</span></span>
                                </div>

                                {/* Title */}
                                <h3 className="line-clamp-2 text-sm font-black leading-snug text-slate-950 decoration-slate-950 group-hover:underline sm:text-base">
                                    {deal.name}
                                </h3>

                                {/* Location */}
                                <div className="flex flex-row items-center justify-between gap-x-2 text-xs font-semibold text-slate-600">
                                    <span className="truncate">Dubai</span>
                                    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                                        <Navigation size={10} className="rotate-90 text-primary-500" aria-hidden="true" />
                                        {t('centralDubai')}
                                    </span>
                                </div>

                                {/* Rating Row */}
                                <div className="inline-flex items-center gap-1 mt-0.5">
                                    {deal.reviewCount ? <>
                                        <div className="flex items-center gap-0.5 text-amber-500" aria-label={`${deal.rating} / 5`}>
                                            {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={12} className={i <= Math.round(deal.rating) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'} />)}
                                        </div>
                                        <span className="text-xs font-black text-slate-950">{deal.rating.toFixed(1)}</span>
                                        <span className="text-xs font-semibold text-slate-600">({deal.reviewCount})</span>
                                    </> : <span className="text-[11px] font-semibold text-slate-500">{language === 'fr' ? 'Aucun avis vérifié' : language === 'hi' ? 'अभी कोई सत्यापित समीक्षा नहीं' : 'No verified reviews yet'}</span>}
                                </div>

                                {/* Pricing Block */}
                                <div className="mt-1 flex flex-col gap-1">
                                    <div className="flex items-baseline gap-1.5 flex-wrap">
                                        {/* Original price */}
                                        {originalPrice && <span className="text-xs font-semibold text-slate-500 line-through decoration-slate-400">AED {originalPrice}</span>}

                                        {/* Sell price */}
                                        <span className="text-base font-black text-emerald-700">AED {deal.price}</span>

                                        <span className="text-[11px] font-semibold text-slate-700">{getPriceUnitLabel(deal, language)}</span>

                                        {/* Discount badge */}
                                        {discount > 0 && <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-black text-emerald-800">-{discount}%</span>}
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-700">
                                        {t('viewPackage')} <ArrowUpRight size={13} aria-hidden="true" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Scroll End Spacer */}
                <div className="flex-none w-px" />
            </div>
        </section>
    );
};

const WishlistButton = ({ serviceId, serviceName }: { serviceId: string; serviceName: string }) => {
    const { wishlistIds, toggleWishlist } = useWishlist();
    const { t } = useLanguage();
    const isWishlisted = wishlistIds.includes(serviceId);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        void toggleWishlist(serviceId);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={isWishlisted ? `${t('removeFromWishlist')}: ${serviceName}` : `${t('addToWishlist')}: ${serviceName}`}
            title={isWishlisted ? t('removeFromWishlist') : t('addToWishlist')}
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-all hover:scale-110 active:scale-95 group/heart"
        >
            <Heart size={15} className={isWishlisted ? 'text-red-600 fill-red-600' : 'text-gray-900 group-hover/heart:text-red-600 group-hover/heart:fill-red-600 transition-colors'} />
        </button>
    );
};
