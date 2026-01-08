import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Award, ShieldCheck, UserCheck, Star, Zap, CheckCircle2 } from 'lucide-react';

export const HappinessSection: React.FC = () => {
    const commitmentPoints = [
        {
            icon: <Star />,
            title: "Elite Rating",
            desc: "UAE premium leader.",
            color: "text-amber-500",
            bg: "bg-amber-50",
            glow: "group-hover:shadow-amber-500/20"
        },
        {
            icon: <Award />,
            title: "Full Commitment",
            desc: "Expertise for your comfort.",
            color: "text-indigo-500",
            bg: "bg-indigo-50",
            glow: "group-hover:shadow-indigo-500/20"
        },
        {
            icon: <ShieldCheck />,
            title: "Guarantee",
            desc: "Satisfaction or corection.",
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            glow: "group-hover:shadow-emerald-500/20"
        },
        {
            icon: <ShieldCheck />,
            title: "Fully Insured",
            desc: "Sanctuary protected.",
            color: "text-rose-500",
            bg: "bg-rose-50",
            glow: "group-hover:shadow-rose-500/20"
        },
        {
            icon: <UserCheck />,
            title: "Experts Only",
            desc: "Background checked pros.",
            color: "text-blue-500",
            bg: "bg-blue-50",
            glow: "group-hover:shadow-blue-500/20"
        },
        {
            icon: <Zap />,
            title: "Top Quality",
            desc: "Consistent excellence.",
            color: "text-orange-500",
            bg: "bg-orange-50",
            glow: "group-hover:shadow-orange-500/20"
        }
    ];

    return (
        <section id="happiness" className="py-20 md:py-32 relative overflow-hidden bg-[#fdfdff] scroll-mt-24">
            {/* Architectural Grid & Decorative Blurs */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] bg-primary-100/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-[-10%] w-[50%] h-[50%] bg-teal-100/20 rounded-full blur-[120px]" />

                {/* Smooth Transition Mask - Bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#fcfdff] to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto px-5 md:px-8 relative z-10">
                <div className="text-center mb-12 md:mb-20 space-y-4 md:space-y-8">
                    <motion.div
                        /* @ts-ignore */
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-gray-100 shadow-sm"
                    >
                        <Heart size={14} className="text-rose-500" fill="currentColor" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Our Commitment</span>
                    </motion.div>

                    <h2 className="text-4xl md:text-8xl font-black text-gray-900 tracking-tighter leading-[1] max-w-4xl mx-auto">
                        Your Happiness Is <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-primary-600 to-rose-500">
                            Our First Priority.
                        </span>
                    </h2>

                    <p className="text-base md:text-2xl text-gray-500 leading-relaxed font-medium max-w-xl mx-auto px-4">
                        We don't just clear dust—we clear the path for your <span className="text-indigo-600">well-being and total joy</span>.
                    </p>
                </div>

                {/* Compact Feature Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8 mb-12 md:mb-20">
                    {commitmentPoints.map((point, index) => (
                        <motion.div
                            key={index}
                            /* @ts-ignore */
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            viewport={{ once: true }}
                            className={`group p-4 md:p-8 rounded-3xl md:rounded-[40px] bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 ${point.glow}`}
                        >
                            <div className="flex flex-col items-center text-center space-y-3 md:space-y-6">
                                <div className={`w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-3xl ${point.bg} flex items-center justify-center ${point.color} transition-all duration-500`}>
                                    {React.cloneElement(point.icon as React.ReactElement<any>, {
                                        size: (typeof window !== 'undefined' && window.innerWidth < 768) ? 24 : 40,
                                        strokeWidth: 2.5
                                    })}
                                </div>
                                <div className="space-y-1 md:space-y-2">
                                    <h4 className="font-black text-gray-900 text-xs md:text-xl tracking-tight leading-tight">{point.title}</h4>
                                    <p className="hidden md:block text-sm text-gray-400 font-bold leading-relaxed px-2">
                                        {point.desc}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Compact CTA */}
                <motion.div
                    /* @ts-ignore */
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="max-w-md mx-auto"
                >
                    <button className="w-full group relative p-[2px] rounded-2xl md:rounded-full overflow-hidden transition-all active:scale-[0.98]">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-primary-500 to-rose-500" />
                        <div className="relative bg-gray-900 rounded-[14px] md:rounded-full px-6 py-4 flex items-center justify-center gap-3 group-hover:bg-transparent transition-colors duration-300">
                            <span className="text-white font-black text-sm md:text-lg tracking-tight">Book My Experience</span>
                            <Zap size={18} className="text-white animate-pulse" fill="currentColor" />
                        </div>
                    </button>
                    <p className="text-center mt-4 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Join 50,000+ Happy Homes &middot; 5-Star Service
                    </p>
                </motion.div>
            </div>
        </section>
    );
};
