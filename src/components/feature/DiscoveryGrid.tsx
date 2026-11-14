import React, { useRef } from 'react';
import { Star, TrendingUp, ChevronLeft, ChevronRight, Heart, Gift, Navigation } from 'lucide-react';
import { Service } from '../../types';
import { SafeImage } from '../ui/SafeImage';
import { getPricePresentation, getPriceUnitLabel } from '../../lib/pricing';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';

interface DiscoveryGridProps {
    services: Service[];
    onSelect: (service: Service) => void;
    title?: string;
}

export const DiscoveryGrid: React.FC<DiscoveryGridProps> = ({ services, onSelect, title }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { t } = useLanguage();

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.8;
            scrollRef.current.scrollTo({
                left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="relative mb-5 space-y-3">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary-50 rounded-lg">
                        <TrendingUp size={16} className="text-primary-600" />
                    </div>
                    <h3 className="text-lg font-extrabold text-gray-900">{title || t('discoverBest')}</h3>
                    <span className="text-xs font-black text-gray-700 bg-gray-200/80 rounded-full px-2.5 py-0.5 ml-1">{services.length}</span>
                </div>

                {/* Desktop scroll arrows */}
                <div className="hidden lg:flex items-center gap-2">
                    <button type="button" aria-label={t('scrollLeft')} onClick={() => scroll('left')} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm transition-all hover:bg-gray-100 hover:text-primary-700 active:scale-95">
                        <ChevronLeft size={16} />
                    </button>
                    <button type="button" aria-label={t('scrollRight')} onClick={() => scroll('right')} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm transition-all hover:bg-gray-100 hover:text-primary-700 active:scale-95">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* ── MOBILE: horizontal scroll carousel ── */}
            <div ref={scrollRef} className="md:hidden flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-4">
                {services.map(service => (
                    <GrouponCard key={service.id} service={service} onSelect={onSelect} />
                ))}
                <div className="flex-none w-px" />
            </div>

            {/* ── DESKTOP: 4-column compact Groupon-style grid ── */}
            <div className="hidden gap-4 md:grid md:grid-cols-3 lg:grid-cols-4">
                {services.map(service => (
                    <GrouponCard key={service.id} service={service} onSelect={onSelect} isGrid />
                ))}
            </div>
        </section>
    );
};

/* ─── High Contrast Groupon Card Component ─── */
const GrouponCard = ({ service, onSelect, isGrid = false }: { service: Service; onSelect: (s: Service) => void; isGrid?: boolean }) => {
    const { originalPrice, discount } = getPricePresentation(service);
    const { wishlistIds, toggleWishlist } = useWishlist();
    const { language, t } = useLanguage();
    const isWishlisted = wishlistIds.includes(service.id);

    const handleWishlist = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        void toggleWishlist(service.id);
    };

    return (
        <div
            onClick={() => onSelect(service)}
            onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return;
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(service);
                }
            }}
            role="button"
            tabIndex={0}
            aria-label={`${t('confirmBookNow')}: ${service.name}`}
                    className={`group relative flex cursor-pointer flex-col gap-3 rounded-2xl bg-white p-2.5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 ${
                isGrid ? 'w-full' : 'flex-none w-[82vw] max-w-[270px] snap-start sm:w-[310px]'
            }`}
        >
            {/* 1. Image Container (Aspect-Video 16:9 ratio) */}
            <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 shadow-sm">
                <SafeImage
                    src={service.image}
                    alt={service.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top-Left Badge - High Contrast */}
                <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11px] font-black text-gray-900 shadow-md">
                    <Gift size={12} className="text-pink-600" />
                    <span className="truncate max-w-[120px] text-gray-900">{service.offerTag || t('popularDeal')}</span>
                </span>

                {/* Top-Right Wishlist Button */}
                <button
                    onClick={handleWishlist}
                    aria-label={isWishlisted ? `${t('removeFromWishlist')}: ${service.name}` : `${t('addToWishlist')}: ${service.name}`}
                    title={isWishlisted ? t('removeFromWishlist') : t('addToWishlist')}
                    className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-all hover:scale-110 active:scale-95 group/heart"
                >
                    <Heart size={15} className={isWishlisted ? 'text-red-600 fill-red-600' : 'text-gray-900 group-hover/heart:text-red-600 group-hover/heart:fill-red-600 transition-colors'} />
                </button>
            </div>

            {/* 2. Content Info - High Contrast Typography */}
            <div className="flex flex-1 flex-col gap-1 overflow-hidden px-1 pb-1">
                {/* Merchant Name */}
                <div className="hidden" aria-hidden="true">
                    <span className="text-xs font-bold text-gray-700">Purity Home Dubai · <span className="text-gray-900 font-extrabold">{service.category}</span></span>
                </div>

                {/* Deal Title */}
                <h3 className="line-clamp-2 text-sm font-black leading-snug text-slate-950 decoration-slate-950 group-hover:underline sm:text-base">
                    {service.name}
                </h3>

                {/* Location */}
                <div className="flex flex-row items-center justify-between gap-x-2 text-xs font-semibold text-slate-700">
                    <span className="truncate">Dubai</span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-600 underline decoration-dotted">
                        <Navigation size={10} className="rotate-90 text-slate-500" />
                        {t('centralDubai')}
                    </span>
                </div>

                {/* Rating Row */}
                <div className="inline-flex items-center gap-1 mt-0.5">
                    {service.reviewCount ? <>
                        <div className="flex items-center gap-0.5 text-amber-500" aria-label={`${service.rating} / 5`}>
                            {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={12} className={i <= Math.round(service.rating) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'} />)}
                        </div>
                        <span className="text-xs font-black text-slate-950">{service.rating.toFixed(1)}</span>
                        <span className="text-xs font-semibold text-slate-600">({service.reviewCount})</span>
                    </> : <span className="text-[11px] font-semibold text-slate-500">{language === 'fr' ? 'Aucun avis vérifié' : language === 'hi' ? 'अभी कोई सत्यापित समीक्षा नहीं' : 'No verified reviews yet'}</span>}
                </div>

                {/* Pricing Block (Groupon Exact Style with Ultra-High Contrast) */}
                <div className="mt-1 flex flex-col gap-0.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                        {/* Original Price */}
                        {originalPrice && <span className="text-xs font-semibold text-slate-500 line-through decoration-slate-400">AED {originalPrice}</span>}

                        {/* Sell Price */}
                        <span className="text-base font-black text-emerald-700">AED {service.price}</span>

                        <span className="text-[11px] font-semibold text-slate-700">{getPriceUnitLabel(service, language)}</span>

                        {/* Discount Badge */}
                        {discount > 0 && <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-black text-emerald-800">-{discount}%</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};
