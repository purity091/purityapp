// @ts-nocheck
import React, { useRef } from 'react';
import { Star, ShoppingBag, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Service } from '../../types';

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
            // Scroll by one card width approx
            const scrollAmount = clientWidth > 600 ? clientWidth * 0.5 : clientWidth * 0.8;
            const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <section className="space-y-6 mb-12 group relative">
            <div className="flex items-center justify-between px-0">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary-50 rounded-lg">
                        <TrendingUp size={18} className="text-primary-600" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">{title || 'Discover the Best'}</h3>
                </div>
            </div>

            {/* Desktop Navigation Arrows */}
            <div className="hidden lg:block">
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-[-20px] top-[60%] -translate-y-1/2 z-20 w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 active:scale-95 transition-all text-gray-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 group-hover:left-[-15px]"
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-[-20px] top-[60%] -translate-y-1/2 z-20 w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 active:scale-95 transition-all text-gray-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 group-hover:right-[-15px]"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-5 px-0 snap-x snap-mandatory no-scrollbar pb-6"
            >
                {services.map(service => (
                    <div
                        key={service.id}
                        onClick={() => onSelect(service)}
                        className="flex-none w-[280px] sm:w-[320px] bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col group/card active:scale-[0.99] cursor-pointer snap-start"
                    >
                        {/* Image Area */}
                        <div className="relative h-48 sm:h-56 overflow-hidden">
                            <img
                                src={service.image}
                                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700"
                                alt={service.name}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90" />

                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                                {service.offerTag && (
                                    <span className="bg-rose-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm bg-opacity-95 uppercase tracking-wider">
                                        {service.offerTag}
                                    </span>
                                )}
                                {service.isPopular && (
                                    <span className="bg-yellow-400 text-gray-900 text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-wider">
                                        <Star size={9} fill="currentColor" /> Featured
                                    </span>
                                )}
                            </div>

                            <div className="absolute bottom-4 left-4 text-white max-w-[85%] text-left" dir="ltr">
                                <p className="text-[9px] font-bold opacity-90 uppercase tracking-widest mb-0.5 text-primary-200">{service.category}</p>
                                <h4 className="text-lg font-black leading-tight drop-shadow-md">{service.name}</h4>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                            <div className="space-y-4">
                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-medium">
                                    {service.description}
                                </p>

                                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 bg-gray-50/50 p-2.5 rounded-xl border border-gray-50">
                                    <div className="flex items-center gap-1.5">
                                        <Star size={12} className="text-yellow-500" fill="currentColor" />
                                        <span className="text-gray-900 font-black text-xs">{service.rating}</span>
                                    </div>
                                    <div className="w-px h-3 bg-gray-200"></div>
                                    <div className="flex items-center gap-1.5">
                                        <ShoppingBag size={12} className="text-primary-500" />
                                        <span className="text-gray-900 font-black text-xs">{service.soldCount}+</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Starting</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-primary-600 tracking-tight">{service.price}</span>
                                        <span className="text-[10px] text-primary-600 font-bold uppercase">AED</span>
                                        {service.priceUnit && (
                                            <span className="text-[10px] text-gray-400 font-bold ml-0.5 whitespace-nowrap">
                                                / {service.priceUnit.replace('per ', '')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button className="bg-primary-600 text-white px-5 py-3 rounded-xl font-black text-[11px] shadow-lg shadow-primary-600/20 active:bg-primary-700 active:scale-95 transition-all hover:bg-primary-700 uppercase tracking-tighter">
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Spacer for scroll end */}
                <div className="flex-none w-px" />
            </div>
        </section>
    );
};
