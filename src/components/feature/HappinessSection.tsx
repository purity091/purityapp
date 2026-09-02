// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';
import { Award, Heart, ShieldCheck, Star, UserCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HappinessSection: React.FC = () => {
    const navigate = useNavigate();
    const commitmentPoints = [
        { icon: <Star size={21} className="text-amber-600" fill="currentColor" />, title: '5-Star Elite Rating', desc: 'Top-rated cleaning leadership in Dubai.', bg: 'bg-amber-50 border-amber-200' },
        { icon: <Award size={21} className="text-indigo-700" />, title: 'Full Commitment', desc: 'Dedicated expertise for ultimate home comfort.', bg: 'bg-indigo-50 border-indigo-200' },
        { icon: <ShieldCheck size={21} className="text-emerald-700" />, title: 'Satisfaction Guarantee', desc: 'Complete re-clean if anything is not 100% perfect.', bg: 'bg-emerald-50 border-emerald-200' },
        { icon: <ShieldCheck size={21} className="text-rose-700" />, title: 'Fully Insured', desc: 'Your home is protected at all times.', bg: 'bg-rose-50 border-rose-200' },
        { icon: <UserCheck size={21} className="text-blue-700" />, title: 'Background-Checked Pros', desc: 'Verified, trained, and hotel-grade staff.', bg: 'bg-blue-50 border-blue-200' },
        { icon: <Zap size={21} className="text-amber-700" fill="currentColor" />, title: 'Unmatched Quality', desc: 'Consistent excellence for every visit.', bg: 'bg-amber-50 border-amber-200' },
    ];

    const scrollTo = (id: string) => {
        const target = document.getElementById(id);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        navigate('/', { state: { scrollTo: id } });
    };

    return (
        <section id="happiness" className="scroll-mt-20 border-t border-gray-200 bg-white py-8 md:py-20">
            <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:px-8">
                {/* Message and CTA */}
                <div className="lg:col-span-4 lg:pt-3">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-3 inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-800 md:mb-5 md:gap-2 md:px-3 md:py-1 md:text-[11px]"
                    >
                        <Heart size={13} className="text-rose-700" fill="currentColor" />
                        Our commitment
                    </motion.div>

                    <h2 className="max-w-lg text-3xl font-black leading-tight tracking-tight text-gray-950 sm:text-4xl">
                        Your Happiness Is
                        <span className="block text-primary-700">Our First Priority.</span>
                    </h2>
                    <p className="mt-3 max-w-lg text-[13px] font-semibold leading-6 text-gray-700 md:mt-4 md:text-base md:leading-7">
                        We do not just clean spaces — we deliver peace of mind, hotel-grade hygiene, and absolute satisfaction for your home.
                    </p>

                    <div className="mt-5 max-w-sm md:mt-7">
                        <button
                            type="button"
                            onClick={() => scrollTo('offers')}
                            className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-xs font-extrabold text-white transition-colors hover:bg-black focus:outline-none focus-visible:ring-4 focus-visible:ring-gray-900/20 md:rounded-xl md:px-6 md:py-3.5 md:text-sm"
                        >
                            Book my experience
                            <Zap size={17} className="text-amber-400 transition-transform group-hover:scale-110" fill="currentColor" />
                        </button>
                        <p className="mt-2 text-center text-[10px] font-bold text-gray-600 md:mt-3 md:text-[11px]">
                            Trusted by 50,000+ happy homes in Dubai
                        </p>
                    </div>
                </div>

                {/* Commitment grid */}
                <div className="grid grid-cols-2 gap-2 md:gap-3 lg:col-span-8">
                    {commitmentPoints.map((point, index) => (
                        <motion.div
                            key={point.title}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: index * 0.04 }}
                            viewport={{ once: true }}
                            className="flex min-h-0 items-start gap-2 rounded-lg border border-gray-200 bg-white p-2.5 transition-colors hover:border-gray-300 hover:bg-gray-50 md:min-h-[108px] md:gap-3 md:rounded-xl md:p-4"
                        >
                            <div className={`flex h-8 w-8 flex-none items-center justify-center rounded-md border [&>svg]:h-4 [&>svg]:w-4 md:h-10 md:w-10 md:rounded-lg md:[&>svg]:h-[21px] md:[&>svg]:w-[21px] ${point.bg}`}>
                                {point.icon}
                            </div>
                            <div className="min-w-0 pt-0 md:pt-0.5">
                                <h3 className="text-[11px] font-extrabold leading-4 text-gray-950 md:text-sm md:leading-5">{point.title}</h3>
                                <p className="mt-0.5 text-[10px] font-medium leading-4 text-gray-600 md:mt-1 md:text-xs md:leading-5">{point.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
