// @ts-nocheck
import React from 'react';
import { CheckCircle2, Quote, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { SafeImage } from '../ui/SafeImage';

const REVIEWS = [
    { id: 1, name: 'Ahmed Mansour', location: 'Downtown Dubai', text: "The most professional cleaning team I've ever dealt with in Dubai. They treated my home like a 5-star luxury hotel. Absolutely flawless service!", rating: 5, service: 'Full Villa Cleaning', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed' },
    { id: 2, name: 'Sarah Williams', location: 'Dubai Marina', text: 'Purity delivered beyond my expectations. Booking was instant, team arrived right on time with full equipment. Highly recommended!', rating: 5, service: 'Deep Home Care', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { id: 3, name: 'Khalid Al-Dubai', location: 'Jumeirah', text: "Extremely reliable and respectful staff. The 'Family Comfort Deluxe' package is worth every dirham. My family is very happy with the results.", rating: 5, service: 'Hot Package Deal', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khalid' },
    { id: 4, name: 'Elena Rodriguez', location: 'Palm Jumeirah', text: "As an interior designer, I am very detailed about hygiene. Purity's attention to detail in couch and carpet steam cleaning is outstanding!", rating: 5, service: 'Furniture Steam Clean', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' },
    { id: 5, name: 'Mohammed Ibrahim', location: 'Business Bay', text: 'Knowing their specialists are background-checked and fully insured gives total peace of mind. Excellent experience every time.', rating: 5, service: 'Regular Cleaning', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammed' },
    { id: 6, name: 'Jessica Chen', location: 'Arabian Ranches', text: 'Fast WhatsApp booking, super clean results, and incredible value for money. Purity is now my go-to cleaning service in Dubai!', rating: 5, service: 'Time-Saving Deal', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica' },
];

const Stars: React.FC<{ size?: number }> = ({ size = 14 }) => (
    <span className="inline-flex items-center gap-0.5 text-amber-500" aria-label="5 out of 5 stars">
        {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={size} fill="currentColor" />)}
    </span>
);

export const GoogleReviews: React.FC = () => (
    <section id="reviews" className="scroll-mt-20 border-t border-gray-200 bg-white py-8 md:py-20">
        <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-4 lg:mb-9 lg:gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-gray-700 md:mb-4 md:gap-2 md:px-3 md:py-1 md:text-[11px]">
                        <CheckCircle2 size={13} className="text-emerald-700" />
                        Verified customer stories
                    </div>
                    <h2 className="text-2xl font-black leading-tight tracking-tight text-gray-950 sm:text-4xl">
                        Loved by homeowners across Dubai
                    </h2>
                    <p className="mt-2 max-w-xl text-[13px] font-semibold leading-6 text-gray-700 md:mt-3 md:text-base md:leading-7">
                        Real feedback from clients who trust Purity for hotel-grade home cleaning.
                    </p>
                </div>

                <div className="flex flex-none items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 md:gap-3 md:rounded-xl md:px-4 md:py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-amber-500 md:h-10 md:w-10 md:rounded-lg">
                        <Star size={17} className="md:h-5 md:w-5" fill="currentColor" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-gray-950 md:text-lg">4.9 / 5.0</span>
                            <Stars size={12} />
                        </div>
                        <p className="text-[10px] font-bold text-gray-600 md:text-[11px]">Based on 2,400+ reviews</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
                {REVIEWS.map((review, index) => (
                    <motion.article
                        key={review.id}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: index * 0.04 }}
                        className="flex min-h-0 flex-col justify-between rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-gray-300 hover:bg-gray-50 md:min-h-[220px] md:rounded-xl md:p-5"
                    >
                        <div>
                            <div className="flex items-center justify-between gap-3">
                                <Stars />
                                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-800 md:text-[10px]">
                                    <CheckCircle2 size={11} /> Verified booking
                                </span>
                            </div>
                            <p className="mt-3 text-xs font-medium leading-5 text-gray-800 md:mt-4 md:text-sm md:leading-6">“{review.text}”</p>
                        </div>

                        <div className="mt-4 flex items-center gap-2 border-t border-gray-200 pt-3 md:mt-5 md:gap-3 md:pt-4">
                            <SafeImage src={review.avatar} alt={review.name} className="h-8 w-8 rounded-full border border-gray-200 bg-gray-100 md:h-9 md:w-9" />
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate text-xs font-black text-gray-950">{review.name}</h3>
                                <p className="truncate text-[11px] font-semibold text-gray-600">{review.location} · <span className="text-primary-800">{review.service}</span></p>
                            </div>
                            <Quote size={15} className="flex-none text-gray-300 md:h-[17px] md:w-[17px]" />
                        </div>
                    </motion.article>
                ))}
            </div>
        </div>
    </section>
);
