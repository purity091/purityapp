// @ts-nocheck
import React from 'react';
import { ShieldCheck, Star, Trophy, Users, Verified } from 'lucide-react';
import { motion } from 'framer-motion';

export const TrustSection: React.FC = () => (
    <section className="border-t border-gray-200 bg-white py-8 md:py-20">
        <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12 lg:gap-14">
                <div className="flex flex-col justify-center lg:col-span-7">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex w-fit items-center gap-1.5 rounded-md border border-primary-200 bg-primary-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary-800 md:gap-2 md:px-3 md:py-1 md:text-[11px]"
                    >
                        <Trophy size={13} className="text-primary-700" />
                        The Purity Gold Standard
                    </motion.div>

                    <h2 className="mt-3 max-w-2xl text-2xl font-black leading-tight tracking-tight text-gray-950 sm:text-4xl md:mt-5 md:text-5xl">
                        Pure excellence.
                        <span className="block text-primary-700">Redefined in Dubai.</span>
                    </h2>

                    <p className="mt-3 max-w-2xl text-[13px] font-semibold leading-6 text-gray-700 md:mt-4 md:text-base md:leading-7">
                        Experience a sanctuary maintained by background-checked professionals trained to 5-star international hotel standards. Where elite hospitality meets professional home care.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2 md:mt-7 md:gap-3">
                        <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[10px] font-extrabold text-gray-800 md:gap-2 md:px-3.5 md:py-2.5 md:text-xs">
                            <Verified size={15} className="text-primary-700" />
                            Elite certified staff
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[10px] font-extrabold text-gray-800 md:gap-2 md:px-3.5 md:py-2.5 md:text-xs">
                            <ShieldCheck size={15} className="text-primary-700" />
                            100% insured service
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 lg:col-span-5 lg:grid-cols-1 lg:gap-3">
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 md:gap-4 md:rounded-xl md:p-5">
                        <div className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-white text-primary-700 md:h-12 md:w-12 md:rounded-lg">
                            <Users size={18} className="md:h-[23px] md:w-[23px]" />
                        </div>
                        <div>
                            <div className="text-xl font-black tracking-tight text-gray-950 md:text-3xl">50,000+</div>
                            <div className="mt-0.5 text-[9px] font-extrabold uppercase tracking-wide text-gray-600 md:text-xs">Happy clients</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-gray-900 bg-gray-900 p-3 text-white md:gap-4 md:rounded-xl md:p-5">
                        <div className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-white/10 text-amber-300 md:h-12 md:w-12 md:rounded-lg">
                            <Star size={18} className="md:h-[23px] md:w-[23px]" fill="currentColor" />
                        </div>
                        <div>
                            <div className="text-xl font-black tracking-tight text-white md:text-3xl">4.9 / 5.0</div>
                            <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-gray-300 md:text-xs">Elite Google rating</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);
