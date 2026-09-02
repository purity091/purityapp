import React, { useRef, useState } from 'react';
import { Star, TrendingUp, ChevronLeft, ChevronRight, Heart, Gift, Navigation } from 'lucide-react';
import { Service } from '../../types';
import { readWishlist, toggleWishlist } from '../../lib/wishlist';
import { SafeImage } from '../ui/SafeImage';

interface DiscoveryGridProps {
    services: Service[];
    onSelect: (service: Service) => void;
    title?: string;
}

export const DiscoveryGrid: React.FC<DiscoveryGridProps> = ({ services, onSelect, title }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

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
        <section className="space-y-2.5 mb-4 relative">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary-50 rounded-lg">
                        <TrendingUp size={16} className="text-primary-600" />
                    </div>
                    <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">{title || 'Discover the Best'}</h3>
                    <span className="text-xs font-black text-gray-700 bg-gray-200/80 rounded-full px-2.5 py-0.5 ml-1">{services.length}</span>
                </div>

                {/* Desktop scroll arrows */}
                <div className="hidden lg:flex items-center gap-2">
                    <button type="button" aria-label={`Scroll ${title || 'services'} left`} onClick={() => scroll('left')} className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100 text-gray-700 hover:text-primary-700 transition-all active:scale-95">
                        <ChevronLeft size={16} />
                    </button>
                    <button type="button" aria-label={`Scroll ${title || 'services'} right`} onClick={() => scroll('right')} className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100 text-gray-700 hover:text-primary-700 transition-all active:scale-95">
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
            <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {services.map(service => (
                    <GrouponCard key={service.id} service={service} onSelect={onSelect} isGrid />
                ))}
            </div>
        </section>
    );
};

/* ─── High Contrast Groupon Card Component ─── */
const GrouponCard = ({ service, onSelect, isGrid = false }: { service: Service; onSelect: (s: Service) => void; isGrid?: boolean }) => {
    const discount = service.originalPrice && service.originalPrice > service.price
        ? Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100)
        : 25;

    const originalPrice = service.originalPrice || Math.round(service.price * 1.35);
    const [isWishlisted, setIsWishlisted] = useState(() => readWishlist().includes(service.id));

    const handleWishlist = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        const next = toggleWishlist(service.id);
        setIsWishlisted(next.includes(service.id));
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
            aria-label={`Book ${service.name}`}
            className={`group relative flex cursor-pointer flex-col gap-2 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 ${
                isGrid ? 'w-full' : 'flex-none w-[82vw] max-w-[270px] snap-start sm:w-[310px]'
            }`}
        >
            {/* 1. Image Container (Aspect-Video 16:9 ratio) */}
            <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 border border-gray-200/90 shadow-sm">
                <SafeImage
                    src={service.image}
                    alt={service.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top-Left Badge - High Contrast */}
                <span className="absolute left-2.5 top-2.5 flex items-center gap-1 bg-white border border-gray-300 text-gray-900 text-[11px] font-black px-2 py-0.5 rounded-md shadow-md">
                    <Gift size={12} className="text-pink-600" />
                    <span className="truncate max-w-[120px] text-gray-900">{service.offerTag || 'Popular Deal'}</span>
                </span>

                {/* Top-Right Wishlist Button */}
                <button
                    onClick={handleWishlist}
                    aria-label={isWishlisted ? `Remove ${service.name} from wishlist` : `Add ${service.name} to wishlist`}
                    title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    className="absolute right-2.5 top-2.5 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all group/heart"
                >
                    <Heart size={15} className={isWishlisted ? 'text-red-600 fill-red-600' : 'text-gray-900 group-hover/heart:text-red-600 group-hover/heart:fill-red-600 transition-colors'} />
                </button>
            </div>

            {/* 2. Content Info - High Contrast Typography */}
            <div className="flex flex-1 flex-col gap-1 overflow-hidden px-0.5">
                {/* Merchant Name */}
                <div className="hidden" aria-hidden="true">
                    <span className="text-xs font-bold text-gray-700">Purity Home Dubai · <span className="text-gray-900 font-extrabold">{service.category}</span></span>
                </div>

                {/* Deal Title */}
                <h3 className="line-clamp-2 text-sm sm:text-base font-black text-gray-900 leading-snug group-hover:underline decoration-gray-900">
                    {service.name}
                </h3>

                {/* Location */}
                <div className="flex flex-row justify-between items-center gap-x-2 text-xs font-bold text-gray-800">
                    <span className="truncate">Dubai, UAE</span>
                    <span className="flex items-center gap-1 text-xs font-extrabold text-gray-700 underline decoration-dotted">
                        <Navigation size={10} className="rotate-90 text-gray-600" />
                        Dubai Central
                    </span>
                </div>

                {/* Rating Row */}
                <div className="inline-flex items-center gap-1 mt-0.5">
                    <div className="flex items-center gap-0.5 text-amber-500">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                                key={i}
                                size={12}
                                className={i <= Math.round(service.rating) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}
                            />
                        ))}
                    </div>
                    <span className="font-black text-xs text-gray-900">{service.rating}</span>
                    <span className="text-xs font-bold text-gray-700">({service.soldCount || 120})</span>
                </div>

                {/* Pricing Block (Groupon Exact Style with Ultra-High Contrast) */}
                <div className="mt-1 flex flex-col gap-0.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                        {/* Original Price */}
                        <span className="text-xs text-gray-500 font-bold line-through decoration-gray-400">
                            AED {originalPrice}
                        </span>

                        {/* Sell Price */}
                        <span className="text-base font-black text-emerald-700">
                            AED {service.price}
                        </span>

                        {/* Discount Badge */}
                        <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded-sm">
                            -{discount}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
