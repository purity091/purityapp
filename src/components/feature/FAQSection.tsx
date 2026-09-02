// @ts-nocheck
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        { question: 'What is the nationality of the cleaners?', answer: 'Our elite cleaning specialists are primarily from the Philippines, rigorously selected and trained for meticulous attention to detail.' },
        { question: 'Will I get the same cleaner every time?', answer: 'Consistency matters. We prioritize assigning the same specialist to your home for recurring bookings to build familiarity.' },
        { question: 'Does the service include laundry and ironing?', answer: 'Standard appointments focus on deep surface sanitization. Professional laundry and ironing can easily be added upon request.' },
        { question: 'Are cleaning equipment and materials included?', answer: 'By default, we utilize your preferred home materials. If you prefer a completely hands-off experience, we bring top-tier equipment upon request.' },
        { question: 'What is the minimum service duration?', answer: 'To ensure the highest hospitality standards, our minimum service duration is 3 hours per booking.' },
        { question: 'Which areas in Dubai do you cover?', answer: 'We cover all major residential neighborhoods in Dubai, including Downtown, Marina, Palm Jumeirah, Business Bay, Jumeirah, and Villa communities.' },
    ];

    return (
        <section id="faq" className="scroll-mt-20 border-t border-gray-200 bg-white py-8 md:py-20">
            <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-5 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
                <div className="self-start lg:col-span-4 lg:pt-2">
                    <div className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-gray-700 md:gap-2 md:px-3 md:py-1 md:text-[11px]">
                        <HelpCircle size={13} className="text-primary-700" />
                        Clear & honest
                    </div>
                    <h2 className="mt-3 max-w-md text-2xl font-black leading-tight tracking-tight text-gray-950 sm:text-4xl md:mt-5">
                        Answers before you book.
                    </h2>
                    <p className="mt-3 max-w-md text-[13px] font-semibold leading-6 text-gray-700 md:mt-4 md:text-base md:leading-7">
                        Everything you need to know about our home cleaning services in Dubai.
                    </p>
                </div>

                <div className="grid gap-2 lg:col-span-8 sm:grid-cols-2 md:gap-3">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div key={faq.question} className={`h-fit overflow-hidden rounded-lg border bg-white transition-colors md:rounded-xl ${isOpen ? 'border-primary-300' : 'border-gray-200 hover:border-gray-300'}`}>
                                <button
                                    type="button"
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    aria-expanded={isOpen}
                                    className="flex w-full items-center justify-between gap-2 p-3 text-left text-xs font-extrabold text-gray-950 transition-colors hover:text-primary-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/15 md:gap-3 md:p-5 md:text-sm"
                                >
                                    <span className="flex min-w-0 items-start gap-2 md:gap-3">
                                        <span className={`mt-0.5 flex h-4 min-w-4 items-center justify-center rounded text-[9px] font-black md:h-5 md:min-w-5 md:text-[10px] ${isOpen ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <span>{faq.question}</span>
                                    </span>
                                    <ChevronDown size={15} className={`flex-none text-gray-600 transition-transform duration-200 md:h-[17px] md:w-[17px] ${isOpen ? 'rotate-180 text-primary-700' : ''}`} />
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="border-t border-gray-100 px-3 pb-3 pt-2 pl-9 text-[11px] font-medium leading-5 text-gray-700 md:pr-5 md:text-sm md:leading-6">
                                                {faq.answer}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
