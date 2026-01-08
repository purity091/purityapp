import React from 'react';
import { ShieldCheck, Users, Star, Award, CheckCircle2, Trophy, Verified } from 'lucide-react';
import { motion } from 'framer-motion';

export const TrustSection = () => (
    <section className="py-20 md:py-32 relative bg-gray-50/50">
        {/* Background Depth & Smooth Transitions */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary-400/5 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-accent-400/5 rounded-full blur-[120px]" />

            {/* Smooth Transition - Top */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#f8fafc] to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
            <div className="relative group overflow-hidden rounded-[40px] border border-white bg-white/40 backdrop-blur-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)]">
                {/* Glossy Overlay Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

                <div className="relative p-8 sm:p-12 md:p-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Left Side: Editorial Content */}
                    <div className="flex-1 space-y-6 md:space-y-8 text-center lg:text-left">
                        <div className="space-y-3 md:space-y-4">
                            {/* @ts-ignore */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="inline-flex items-center gap-2 md:gap-3 bg-primary-50/80 px-4 py-1.5 md:py-2 rounded-xl border border-primary-100/50 backdrop-blur-md shadow-sm"
                            >
                                <Trophy size={14} className="text-primary-600 md:w-4 md:h-4" />
                                <span className="text-[9px] md:text-[11px] font-black text-primary-700 uppercase tracking-[0.2em] md:tracking-[0.25em]">The Purity Gold Standard</span>
                            </motion.div>

                            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-[0.95] md:leading-[1]">
                                Pure Excellence. <br className="hidden sm:block" />
                                <span className="text-primary-500">Redefined.</span>
                            </h2>
                        </div>

                        <p className="text-base md:text-lg text-gray-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0 border-l-0 lg:border-l-4 border-primary-500/20 pl-0 lg:pl-6 px-2 sm:px-0">
                            Experience a sanctuary maintained by background-checked professionals trained to 5-star international hotel standards. Where elite hospitality meets professional home care.
                        </p>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-3 md:gap-4">
                            <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-gray-400 bg-gray-50 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-gray-100/50">
                                <Verified size={14} className="text-primary-500" />
                                Elite Certified
                            </div>
                            <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-gray-400 bg-gray-50 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-gray-100/50">
                                <ShieldCheck size={14} className="text-primary-500" />
                                Fully Insured
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Architectural Stats Grid */}
                    <div className="flex-1 w-full max-w-xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 relative">

                            {/* Stat 1: Floating Vertical */}
                            {/* @ts-ignore */}
                            <motion.div
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="bg-white p-6 md:p-8 rounded-xl shadow-2xl shadow-gray-200/50 border border-gray-50 flex flex-row sm:flex-col justify-between items-center sm:items-start h-auto sm:h-56 group/card transition-all duration-500"
                            >
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 group-hover/card:bg-primary-600 group-hover/card:text-white transition-all duration-500">
                                    <Users size={24} className="md:w-7 md:h-7" />
                                </div>
                                <div className="text-left">
                                    <div className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">50,000+</div>
                                    <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Happy Clients</div>
                                </div>
                            </motion.div>

                            {/* Stat 2: Large Floating */}
                            {/* @ts-ignore */}
                            <motion.div
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="bg-gradient-to-br from-primary-600 to-primary-400 p-6 md:p-8 rounded-xl shadow-2xl shadow-primary-500/40 text-white flex flex-row sm:flex-col justify-between items-center sm:items-start h-auto sm:h-56 sm:translate-y-8 transition-all duration-500"
                            >
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                                    <Star size={24} className="md:w-7 md:h-7" fill="currentColor" />
                                </div>
                                <div className="text-left">
                                    <div className="text-3xl md:text-5xl font-black tracking-tighter">4.9/5</div>
                                    <div className="text-[10px] md:text-xs font-bold text-white/80 uppercase tracking-widest mt-1">Elite Rating</div>
                                </div>
                            </motion.div>

                            {/* Stat 3: Wide Horizontal */}
                            {/* @ts-ignore */}
                            <motion.div
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="sm:col-span-2 bg-gray-900 p-6 md:p-8 rounded-xl shadow-2xl shadow-black/10 text-white flex items-center justify-between sm:mt-8 group/card transition-all duration-500"
                            >
                                <div className="flex items-center gap-4 md:gap-6">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-accent-500 rounded-xl flex items-center justify-center text-black">
                                        <Award size={24} className="md:w-7 md:h-7" />
                                    </div>
                                    <div>
                                        <div className="text-2xl md:text-3xl font-black tracking-tighter leading-none">100%</div>
                                        <div className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Gold Guarantee</div>
                                    </div>
                                </div>
                                <CheckCircle2 className="text-primary-500 opacity-20 group-hover/card:opacity-100 group-hover/card:scale-110 transition-all duration-500 w-8 h-8 md:w-10 md:h-10" />
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Subtle Watermark Decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.015] -z-10 select-none pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <ShieldCheck className="w-[400px] h-[400px] md:w-[800px] md:h-[800px]" />
                </div>
            </div>
        </div>
    </section>
);
