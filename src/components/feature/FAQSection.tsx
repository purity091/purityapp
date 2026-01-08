import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, MessageCircle, Sparkles, ArrowUpRight } from 'lucide-react';

interface FAQItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
    index: number;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick, index }) => {
    return (
        <motion.div
            /* @ts-ignore */
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`group relative border-b border-gray-100 last:border-none transition-all duration-500 ${isOpen ? 'bg-primary-50/30' : ''}`}
        >
            <button
                onClick={onClick}
                className="w-full py-7 md:py-9 px-4 md:px-8 flex items-center justify-between text-left transition-all relative z-10"
            >
                <div className="flex items-center gap-5 md:gap-8">
                    <span className={`text-xs md:text-sm font-black transition-colors duration-500 ${isOpen ? 'text-primary-600' : 'text-gray-300'}`}>
                        0{index + 1}
                    </span>
                    <span className={`text-lg md:text-2xl font-black tracking-tight leading-tight transition-all duration-500 ${isOpen ? 'text-gray-900 translate-x-2' : 'text-gray-600 group-hover:text-gray-900'}`}>
                        {question}
                    </span>
                </div>

                <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border transition-all duration-500 ${isOpen ? 'bg-primary-600 border-primary-500 text-white rotate-90 shadow-lg shadow-primary-500/20' : 'border-gray-200 text-gray-300 group-hover:border-primary-500 group-hover:text-primary-600'}`}>
                    <ChevronRight size={20} strokeWidth={3} />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        /* @ts-ignore */
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="pb-10 md:pb-12 pl-16 md:pl-28 pr-8 md:pr-12">
                            <p className="text-gray-500 text-base md:text-lg leading-relaxed font-medium max-w-2xl border-l-2 border-primary-500/20 pl-6">
                                {answer}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/[0.02] to-primary-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        </motion.div>
    );
};

export const FAQSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            question: "Nationality of cleaners?",
            answer: "Our elite cleaning specialists are primarily from the Philippines, selected for their meticulous attention to detail."
        },
        {
            question: "Same cleaner every time?",
            answer: "Stability is key. We strive to assign the same specialist to your home for every visit to maintain a personalized rhythm."
        },
        {
            question: "Does it include laundry?",
            answer: "Standard protocols focus on deep surface sanitization. Laundry and professional ironing can be integrated upon request."
        },
        {
            question: "Are cleaning tools included?",
            answer: "Appointments use your home tools. For a hands-off experience, our team can arrive fully equipped upon prior arrangement."
        },
        {
            question: "Minimum service duration?",
            answer: "To ensure the 'Purity Gold Standard' is met, we maintain a minimum engagement period of 3 hours per visit."
        },
        {
            question: "Which areas do you cover?",
            answer: "We cover Bur Dubai and its surrounding premium residential districts. Contact us to verify your specific zone."
        }
    ];

    return (
        <section id="faq" className="py-20 md:py-32 bg-[#fcfdff] relative overflow-hidden scroll-mt-24">
            {/* High-End Background Effects - Softened for Light Mode Transitions */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-blue-50/50 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-indigo-50/30 rounded-full blur-[100px]" />
                <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

                {/* Smooth Transitions */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#fdfdff] to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f8fafc] to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto px-5 relative z-10">
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 md:gap-24">

                    {/* Header - Scaled for Light Mode */}
                    <div className="lg:col-span-5 space-y-6 md:space-y-10">
                        <div className="space-y-4 md:space-y-6">
                            <motion.div
                                /* @ts-ignore */
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 px-3 py-1.5 rounded-xl"
                            >
                                <Sparkles size={14} className="text-primary-600" />
                                <span className="text-[9px] font-black text-primary-600 uppercase tracking-[0.3em]">Knowledge Base</span>
                            </motion.div>

                            <h2 className="text-4xl md:text-8xl font-black text-gray-900 tracking-tighter leading-[0.9]">
                                Essential <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 italic">Insights.</span>
                            </h2>

                            <p className="text-base md:text-xl text-gray-500 font-medium leading-relaxed max-w-sm">
                                Your journey should be effortless. We’ve refined every detail for total transparency.
                            </p>
                        </div>

                        {/* Concierge Support Card */}
                        <motion.div
                            /* @ts-ignore */
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="hidden lg:block p-8 md:p-10 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[40px] shadow-2xl shadow-primary-500/20 relative overflow-hidden group"
                        >
                            <div className="relative z-10 space-y-6">
                                <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white">
                                    <MessageCircle size={28} />
                                </div>
                                <h4 className="text-2xl font-black text-white tracking-tight leading-tight">Need a Concierge?</h4>
                                <p className="text-white/70 font-medium">Our lifestyle coordinators are available 24/7 on WhatsApp for custom requests.</p>
                                <a
                                    href="https://wa.me/971544556106"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-full font-black text-sm hover:gap-5 transition-all w-full justify-center shadow-lg"
                                >
                                    Chat with Us <ArrowUpRight size={18} />
                                </a>
                            </div>
                        </motion.div>
                    </div>

                    {/* Accordion - Light Mode Glass */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-3xl md:rounded-[40px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden divide-y divide-gray-100">
                            {faqs.map((faq, index) => (
                                <FAQItem
                                    key={index}
                                    index={index}
                                    question={faq.question}
                                    answer={faq.answer}
                                    isOpen={openIndex === index}
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                />
                            ))}
                        </div>

                        {/* Mobile-Only CTA Card */}
                        <div className="lg:hidden mt-8">
                            <a
                                href="https://wa.me/971544556106"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-6 bg-primary-600 rounded-3xl shadow-xl shadow-primary-600/20"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
                                        <MessageCircle size={20} />
                                    </div>
                                    <span className="text-white font-black">24/7 Support</span>
                                </div>
                                <ArrowUpRight size={20} className="text-white" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
