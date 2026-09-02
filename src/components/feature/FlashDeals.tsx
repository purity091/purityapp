import React, { useRef, useState } from 'react';
import { Flame, Star, ChevronLeft, ChevronRight, Heart, Gift, Navigation } from 'lucide-react';
import { Service } from '../../types';
import { packages } from '../../data/packages';
import { readWishlist, toggleWishlist } from '../../lib/wishlist';
import { SafeImage } from '../ui/SafeImage';

interface FlashDealsProps {
    onSelect: (service: Service) => void;
}

export const FlashDeals: React.FC<FlashDealsProps> = ({ onSelect }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth > 600 ? clientWidth * 0.5 : clientWidth * 0.8;
            const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <section id="offers" className="w-full relative space-y-2.5 py-2 mb-4 group/section scroll-mt-20 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-end px-1">
                <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        Hot Packages <Flame className="text-amber-500" size={22} fill="currentColor" />
                    </h3>
                </div>

                {/* Countdown Header */}
                <div className="hidden sm:flex items-center gap-3 bg-gray-900 text-white px-3.5 py-1.5 rounded-xl border border-gray-800 shadow-sm">
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-black text-white leading-none">02</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">Hrs</span>
                    </div>
                    <span className="text-gray-600 font-bold text-xs">:</span>
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-black text-white leading-none">45</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">Min</span>
                    </div>
                    <span className="text-gray-600 font-bold text-xs">:</span>
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-black text-amber-400 leading-none animate-pulse">12</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">Sec</span>
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            <div className="hidden lg:block">
                <button
                    type="button"
                    onClick={() => scroll('left')}
                    aria-label="Scroll hot packages left"
                    className="absolute left-0 top-[55%] -translate-y-1/2 z-30 w-9 h-9 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 active:scale-95 transition-all text-gray-700 hover:text-primary-700 opacity-0 group-hover/section:opacity-100"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    type="button"
                    onClick={() => scroll('right')}
                    aria-label="Scroll hot packages right"
                    className="absolute right-0 top-[55%] -translate-y-1/2 z-30 w-9 h-9 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 active:scale-95 transition-all text-gray-700 hover:text-primary-700 opacity-0 group-hover/section:opacity-100"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Carousel Container */}
            <div
                ref={scrollRef}
                className="flex w-full overflow-x-auto overscroll-x-contain gap-4 px-1 snap-x snap-mandatory no-scrollbar pb-4"
            >
                {packages.map((deal) => {
                    const discount = deal.originalPrice && deal.originalPrice > 0
                        ? Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100)
                        : 30;

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
                            aria-label={`Book ${deal.name}`}
                            className="group relative flex w-[82vw] max-w-[270px] flex-none snap-start flex-col gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 sm:w-[310px]"
                        >
                            {/* 1. Image Container (Aspect-Video 16:9 ratio) */}
                            <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 border border-gray-200/90 shadow-sm">
                                <SafeImage
                                    src={deal.image}
                                    alt={deal.name}
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />

                                {/* Top-Left Badge */}
                                <span className="absolute left-2.5 top-2.5 flex items-center gap-1 bg-white border border-gray-300 text-gray-900 text-[11px] font-black px-2 py-0.5 rounded-md shadow-md">
                                    <Gift size={12} className="text-pink-600" />
                                    <span className="truncate max-w-[120px] text-gray-900">{deal.offerTag}</span>
                                </span>

                                {/* Top-Right Wishlist Button */}
                                <WishlistButton serviceId={String(deal.id)} serviceName={deal.name} />
                            </div>

                            {/* 2. Content Info - High Contrast Typography */}
                            <div className="flex flex-1 flex-col gap-1 overflow-hidden px-0.5">
                                {/* Merchant Name */}
                                <div className="hidden" aria-hidden="true">
                                    <span className="text-xs font-bold text-gray-700">Purity Home Dubai · <span className="text-gray-900 font-extrabold">{deal.category}</span></span>
                                </div>

                                {/* Title */}
                                <h3 className="line-clamp-2 text-sm sm:text-base font-black text-gray-900 leading-snug group-hover:underline decoration-gray-900">
                                    {deal.name}
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
                                                className={i <= Math.round(deal.rating) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}
                                            />
                                        ))}
                                    </div>
                                    <span className="font-black text-xs text-gray-900">{deal.rating}</span>
                                    <span className="text-xs font-bold text-gray-700">({deal.soldCount})</span>
                                </div>

                                {/* Pricing Block */}
                                <div className="mt-1 flex flex-col gap-0.5">
                                    <div className="flex items-baseline gap-1.5 flex-wrap">
                                        {/* Original price */}
                                        <span className="text-xs text-gray-500 font-bold line-through decoration-gray-400">
                                            AED {deal.originalPrice}
                                        </span>

                                        {/* Sell price */}
                                        <span className="text-base font-black text-emerald-700">
                                            AED {deal.price}
                                        </span>

                                        {/* Discount badge */}
                                        <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded-sm">
                                            -{discount}%
                                        </span>
                                    </div>
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
    const [isWishlisted, setIsWishlisted] = useState(() => readWishlist().includes(serviceId));

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        const next = toggleWishlist(serviceId);
        setIsWishlisted(next.includes(serviceId));
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={isWishlisted ? `Remove ${serviceName} from wishlist` : `Add ${serviceName} to wishlist`}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute right-2.5 top-2.5 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all group/heart"
        >
            <Heart size={15} className={isWishlisted ? 'text-red-600 fill-red-600' : 'text-gray-900 group-hover/heart:text-red-600 group-hover/heart:fill-red-600 transition-colors'} />
        </button>
    );
};
