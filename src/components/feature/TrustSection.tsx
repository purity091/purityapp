// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { ShieldCheck, Star, Trophy, Users, Verified } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';

export const TrustSection: React.FC = () => {
    const { t, language } = useLanguage();
    const [summary, setSummary] = useState({ average: 0, count: 0 });
    useEffect(() => {
        let active = true;
        void supabase.rpc('get_public_review_summary').then(result => {
            if (active && !result.error && Array.isArray(result.data) && result.data[0]) setSummary({ average: Number(result.data[0].average_rating || 0), count: Number(result.data[0].review_count || 0) });
        });
        return () => { active = false; };
    }, []);
    return (
    <section className="bg-white py-8 md:py-20">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12 lg:gap-14">
                <div className="flex flex-col justify-center lg:col-span-7">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex w-fit items-center gap-1.5 rounded-md bg-primary-50 px-2.5 py-0.5 text-[10px] font-black uppercase text-primary-800 md:gap-2 md:px-3 md:py-1 md:text-[11px]"
                    >
                        <Trophy size={13} className="text-primary-700" />
                        {t('trustBadge')}
                    </motion.div>

                    <h2 className="mt-3 max-w-2xl text-2xl font-black leading-tight text-gray-950 sm:text-4xl md:mt-5 md:text-5xl">
                        {t('pureExcellence')}
                        <span className="block text-primary-700">{t('redefinedDubai')}</span>
                    </h2>

                    <p className="mt-3 max-w-2xl text-[13px] font-semibold leading-6 text-gray-700 md:mt-4 md:text-base md:leading-7">
                        {t('trustDescription')}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2 md:mt-7 md:gap-3">
                        <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-2 text-[10px] font-extrabold text-gray-800 shadow-sm md:gap-2 md:px-3.5 md:py-2.5 md:text-xs">
                            <Verified size={15} className="text-primary-700" />
                            {t('eliteCertified')}
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-2 text-[10px] font-extrabold text-gray-800 shadow-sm md:gap-2 md:px-3.5 md:py-2.5 md:text-xs">
                            <ShieldCheck size={15} className="text-primary-700" />
                            {t('insuredService')}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 lg:col-span-5 lg:grid-cols-1 lg:gap-3">
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 shadow-sm md:gap-4 md:rounded-xl md:p-5">
                        <div className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-white text-primary-700 md:h-12 md:w-12 md:rounded-lg">
                            <Users size={18} className="md:h-[23px] md:w-[23px]" />
                        </div>
                        <div>
                            <div className="text-xl font-black text-gray-950 md:text-3xl">{summary.count}</div>
                            <div className="mt-0.5 text-[9px] font-extrabold uppercase text-gray-600 md:text-xs">{language === 'fr' ? 'Avis vérifiés' : language === 'hi' ? 'सत्यापित समीक्षाएं' : 'Verified reviews'}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-gray-900 p-3 text-white shadow-sm md:gap-4 md:rounded-xl md:p-5">
                        <div className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-white/10 text-amber-300 md:h-12 md:w-12 md:rounded-lg">
                            <Star size={18} className="md:h-[23px] md:w-[23px]" fill="currentColor" />
                        </div>
                        <div>
                            <div className="text-xl font-black text-white md:text-3xl">{summary.count ? `${summary.average.toFixed(2)} / 5.0` : '— / 5.0'}</div>
                            <div className="mt-0.5 text-[9px] font-bold uppercase text-gray-300 md:text-xs">{language === 'fr' ? 'Note clients vérifiée' : language === 'hi' ? 'सत्यापित ग्राहक रेटिंग' : 'Verified customer rating'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    );
};
