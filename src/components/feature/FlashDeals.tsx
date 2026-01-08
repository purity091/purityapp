// @ts-nocheck
import React, { useRef } from 'react';
import { Flame, Zap, Star, ShieldCheck, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Service } from '../../types';
import timeSavingDealImage from '../../assets/images/time-saving-deal.jpg';
import familyComfortImage from '../../assets/images/family-comfort-deluxe.jpg';
import villaCompleteImage from '../../assets/images/villa-cleaning-complete.jpg';

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

    const packages = [
        {
            id: 'offer-welcome',
            name: 'New Customer Welcome Deal',
            price: 99,
            originalPrice: 400,
            image: 'https://images.unsplash.com/photo-1550963295-019d8a8a61c5?auto=format&fit=crop&q=80&w=800',
            category: 'Deep Cleaning',
            rating: 5.0,
            offerTag: 'New Customers Only',
            features: ['4 Hours Deep Cleaning', 'Professional Equipment', 'High-Impact Focus', 'No Commitment'],
            description: 'Try us once with zero risk. A professional deep clean for your apartment or studio at an unbeatable price.'
        },
        {
            id: 'offer-timesaving',
            name: 'Ultimate Time-Saving Deal',
            price: 299,
            originalPrice: 600,
            image: timeSavingDealImage,
            category: 'Value Pack',
            rating: 4.9,
            offerTag: 'Best Value',
            features: ['3 Pro Cleaners', '12 Total Working Hours', 'Professional Materials', 'Flexible Tasks'],
            description: 'Massive value for busy homes. Walk into a cleaner, calmer home without the stress of long-term commitment.'
        },
        {
            id: 'offer-freshness',
            name: 'Total Home Freshness Boost',
            price: 699,
            originalPrice: 1200,
            image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
            category: 'Sanitization',
            rating: 5.0,
            offerTag: 'Deep Hygiene',
            features: ['Steam Machine', 'Sofa & Curtains', 'Bathroom Sanitation', '3 Pro Cleaners'],
            description: 'Elite-level hygiene. Eliminate bacteria and germs while restoring comfort to your upholstered furniture.'
        },
        {
            id: 'pkg-essential',
            name: 'Essential Home Refresh',
            price: 899,
            originalPrice: 1200,
            image: 'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&q=80&w=800',
            category: 'Package',
            rating: 4.8,
            offerTag: 'Best Seller',
            features: ['1 Bedroom Deep Clean', '5-Seat Sofa Care', '1 Large Carpet', '4h Professional'],
            description: 'Perfect for 1-bedroom apartments. Complete control and comfort sanitized to hotel standards.'
        },
        {
            id: 'pkg-family',
            name: 'Family Comfort Deluxe',
            price: 999,
            originalPrice: 1400,
            image: familyComfortImage,
            category: 'Package',
            rating: 4.9,
            offerTag: 'Popular',
            features: ['2 Bedrooms Deep Clean', 'Upholstery Detail', 'Anti-Allergen Treatment', '2 Experts / 4h'],
            description: 'Where family comfort meets hygiene. Specialized for homes with children and pets.'
        },
        {
            id: 'pkg-premium',
            name: 'Premium Home Care',
            price: 1099,
            originalPrice: 1600,
            image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&q=80&w=800',
            category: 'Package',
            rating: 5.0,
            offerTag: 'Recommended',
            features: ['3 Bedrooms Deep Clean', 'Full Kitchen Detox', 'Eco-Safe Materials', 'Top-Tier Specialist'],
            description: 'Elite-level maintenance for 3-bedroom homes wanting absolute perfection.'
        },
        {
            id: 'pkg-villa',
            name: 'Villa Serenity',
            price: 1399,
            originalPrice: 2000,
            image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
            category: 'Villa Package',
            rating: 5.0,
            offerTag: 'Villa Special',
            features: ['Large Villa Interior', 'Patio Sanitation', '4 Professional Team', 'Sanitization Shield'],
            description: 'Complete villa restoration. Every corner, every surface, handled with precision.'
        },
        {
            id: 'offer-villa-complete',
            name: 'Complete Inside & Outside Villa Cleaning',
            price: 2500,
            originalPrice: 4000,
            image: villaCompleteImage,
            category: 'Premium Villa Package',
            rating: 5.0,
            offerTag: 'Exclusive',
            features: ['3 Men (Exterior)', '5 Ladies (Interior)', 'Full Deep Clean', 'Same-Day Service'],
            description: 'Your Villa. Completely Renewed. Total cleanliness inside and out with two specialized teams working simultaneously.'
        }
    ];

    return (
        <section id="offers" className="space-y-8 py-10 mb-12 group relative scroll-mt-24">
            {/* Header with Luxury Styling */}
            <div className="flex justify-between items-end px-0">
                <div className="space-y-2">
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 bg-primary-50 px-3 py-1 rounded-full border border-primary-100/50 w-fit"
                    >
                        <Flame className="text-primary-500 animate-pulse" size={14} fill="currentColor" />
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Active Flash Deals</span>
                    </motion.div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Hot Packages 🔥</h3>
                </div>

                {/* Timer Placeholder UI */}
                <div className="hidden sm:flex items-center gap-4 bg-gray-50/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-gray-100">
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-black text-gray-900 leading-none">02</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Hrs</span>
                    </div>
                    <span className="text-gray-300 font-bold mb-2">:</span>
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-black text-gray-900 leading-none">45</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Min</span>
                    </div>
                    <span className="text-gray-300 font-bold mb-2">:</span>
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-black text-primary-500 leading-none animate-pulse">12</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Sec</span>
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            <div className="hidden lg:block">
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-[-24px] top-[60%] -translate-y-1/2 z-30 w-12 h-12 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-xl hover:bg-white active:scale-95 transition-all text-gray-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 group-hover:left-[-18px]"
                >
                    <ChevronLeft size={28} />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-[-24px] top-[60%] -translate-y-1/2 z-30 w-12 h-12 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-xl hover:bg-white active:scale-95 transition-all text-gray-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 group-hover:right-[-18px]"
                >
                    <ChevronRight size={28} />
                </button>
            </div>

            <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-6 px-0 snap-x snap-mandatory no-scrollbar pb-10"
            >
                {packages.map((deal) => {
                    const discount = Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100);

                    return (
                        <div
                            key={deal.id}
                            onClick={() => onSelect(deal)}
                            className="flex-none w-[300px] sm:w-[380px] bg-white rounded-xl overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] transition-all duration-500 border border-gray-100 flex flex-col group/card active:scale-[0.98] cursor-pointer snap-start relative"
                        >
                            {/* Visual Glow Layer */}
                            <div className="absolute inset-0 bg-primary-500/0 group-hover/card:bg-primary-500/[0.02] transition-colors duration-500 pointer-events-none" />

                            {/* Prominent Discount Badge */}
                            <div className="absolute top-5 right-5 z-20 w-14 h-14 bg-accent-500 rounded-full flex flex-col items-center justify-center shadow-lg shadow-accent-500/40 rotate-12 group-hover/card:rotate-0 transition-transform duration-500 border-2 border-white">
                                <span className="text-[10px] font-black text-black leading-none uppercase">Off</span>
                                <span className="text-base font-black text-black leading-none">{discount}%</span>
                            </div>

                            {/* Elegant Image Section */}
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={deal.image}
                                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-1000"
                                    alt={deal.name}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />

                                <div className="absolute bottom-5 left-6">
                                    <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full mb-2 w-fit">
                                        <ShieldCheck size={12} className="text-primary-200" />
                                        <span className="text-[9px] font-bold text-white uppercase tracking-widest">{deal.offerTag}</span>
                                    </div>
                                    <h4 className="text-2xl font-black text-white leading-tight tracking-tight drop-shadow-lg">{deal.name}</h4>
                                </div>
                            </div>

                            {/* Sophisticated Content Area */}
                            <div className="p-7 space-y-6 bg-white relative">
                                <p className="text-xs text-gray-400 font-medium leading-relaxed italic">
                                    "{deal.description}"
                                </p>

                                {/* Feature List */}
                                <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                                    {deal.features.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-primary-50 rounded-full flex items-center justify-center">
                                                <CheckCircle2 size={10} className="text-primary-500" />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-600 line-clamp-1">{f}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Pricing Architecture */}
                                <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <div>
                                        <span className="block text-[10px] text-gray-300 font-bold line-through ml-1">{deal.originalPrice} AED</span>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-3xl font-black text-gray-900 tracking-tighter">{deal.price}</span>
                                            <span className="text-xs font-black text-primary-500">AED</span>
                                        </div>
                                    </div>

                                    <button className="h-14 w-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-xl shadow-gray-200 group-hover/card:bg-primary-600 group-hover/card:scale-110 transition-all duration-300 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-primary-400/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                        <Zap size={22} fill="currentColor" />
                                    </button>
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
