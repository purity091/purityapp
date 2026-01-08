// @ts-nocheck
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

const OFFERS = [
    {
        id: 1,
        title: "Royal Summer \nPackages ☀️",
        desc: "Strongest offers on AC cleaning and sterilization available for a limited time.",
        badge: "Save up to 70%",
        gradient: "from-primary-600 via-primary-500 to-primary-400",
        image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600",
        icon: <Sparkles size={16} className="text-accent-500" />
    },
    {
        id: 2,
        title: "Deep Cleaning \nSpecialist ✨",
        desc: "Transform your home with our premium deep cleaning service. Every corner sanitized.",
        badge: "Fixed Price",
        gradient: "from-indigo-600 via-purple-500 to-pink-500",
        image: "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&q=80&w=600",
        icon: <Star size={16} className="text-yellow-400" />
    },
    {
        id: 3,
        title: "Office Care \nMonthly Plan 🏢",
        desc: "Keep your workspace pristine and professional. Dedicated monthly maintenance.",
        badge: "Business Choice",
        gradient: "from-slate-800 via-slate-700 to-primary-600",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
        icon: <ShieldCheck size={16} className="text-teal-400" />
    }
];

export const DealsSlider: React.FC = () => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <section id="offers" className="pb-4 group relative px-0">
            {/* Desktop Navigation Arrows */}
            <div className="hidden lg:block">
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-[-20px] top-[45%] -translate-y-1/2 z-20 w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 active:scale-95 transition-all text-gray-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 group-hover:left-[-15px]"
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-[-20px] top-[45%] -translate-y-1/2 z-20 w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 active:scale-95 transition-all text-gray-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 group-hover:right-[-15px]"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-4 px-0 snap-x snap-mandatory no-scrollbar pb-2"
            >
                {OFFERS.map((offer) => (
                    <motion.div
                        key={offer.id}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className={`flex-none w-[85vw] sm:w-[500px] snap-center bg-gradient-to-br ${offer.gradient} rounded-xl p-6 text-white relative overflow-hidden shadow-lg border border-white/10`}
                    >
                        {/* Content */}
                        <div className="relative z-10 space-y-3 h-full flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    {offer.icon}
                                    <span className="bg-white/20 backdrop-blur-sm text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                        {offer.badge}
                                    </span>
                                </div>
                                <div className="min-h-[80px]">
                                    <h2 className="text-2xl font-bold leading-tight whitespace-pre-line">{offer.title}</h2>
                                    <p className="text-white/80 text-xs font-medium mt-2 max-w-[200px] leading-relaxed line-clamp-2">
                                        {offer.desc}
                                    </p>
                                </div>
                            </div>
                            <button className="w-fit bg-white text-gray-900 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:shadow-md active:scale-95 transition-all">
                                View Deal
                            </button>
                        </div>

                        {/* Image Overlay */}
                        <img
                            src={offer.image}
                            className="absolute right-[-10%] top-[-10%] h-[120%] w-[55%] object-cover opacity-20 mix-blend-overlay rotate-3 pointer-events-none"
                            alt="Service"
                        />

                        {/* Decorative Elements */}
                        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute left-[-10%] bottom-[-10%] w-24 h-24 bg-black/10 rounded-full blur-2xl" />

                        {/* Decorative Pattern */}
                        <div className="absolute right-4 bottom-4 opacity-10">
                            <div className="grid grid-cols-4 gap-1.5">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="w-1 h-1 bg-white rounded-full" />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Pagination/Scroll Hint for Mobile */}
            <div className="flex justify-center gap-1.5 mt-2 md:hidden">
                {OFFERS.map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                ))}
            </div>
        </section>
    );
};
