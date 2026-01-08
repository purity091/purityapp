import React from 'react';
import { Star, CheckCircle2, MessageSquare, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

const REVIEWS = [
    {
        id: 1,
        name: "Ahmed Mansour",
        role: "Home Owner, Dubai",
        text: "The most professional cleaning team I've ever dealt with. They treated my home like a 5-star hotel. Absolutely flawless service!",
        rating: 5,
        color: "from-blue-600 to-blue-400",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed",
        delay: 0
    },
    {
        id: 2,
        name: "Sarah Williams",
        role: "Property Manager",
        text: "Purity connects directly to my needs. It's the perfect tool for our business to show reviews and gain our customers trust. Life-changing!",
        rating: 5,
        color: "from-green-600 to-green-400",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        delay: 0.1
    },
    {
        id: 3,
        name: "Khalid Al-Dubai",
        role: "Villa Owner",
        text: "Intuitive, functional, and very reliable. The 'Premium Home Care' package is worth every dirham. My family is very happy.",
        rating: 5,
        color: "from-orange-600 to-orange-400",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Khalid",
        delay: 0.2
    },
    {
        id: 4,
        name: "Elena Rodriguez",
        role: "Interior Designer",
        text: "As an expert in aesthetics, I'm picky. Purity's attention to detail in their deep cleaning is outstanding. Highly recommended!",
        rating: 4,
        color: "from-purple-600 to-purple-400",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
        delay: 0.15
    },
    {
        id: 5,
        name: "Mohammed Ibrahim",
        role: "Business Consultant",
        text: "Verified safety and elite professionalism. Knowing they are background-checked gives me peace of mind every single time.",
        rating: 5,
        color: "from-cyan-600 to-cyan-400",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammed",
        delay: 0.25
    },
    {
        id: 6,
        name: "Jessica Chen",
        role: "Busy Professional",
        text: "The Hot Packages are incredible value. Fast booking, amazing results, and the team is so respectful of my workspace.",
        rating: 5,
        color: "from-rose-600 to-rose-400",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
        delay: 0.3
    }
];

export const GoogleReviews = () => {
    return (
        <section id="reviews" className="py-24 relative overflow-hidden px-0 bg-[#f8fafc] scroll-mt-24">
            {/* Architectural Background & Smooth Transitions */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-500/5 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-500/5 rounded-full blur-[150px]" />

                {/* Smooth Transitions */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#fcfdff] to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50/50 to-transparent" />
            </div>

            {/* Floating Patterns */}
            <div className="absolute top-1/4 left-10 opacity-[0.03] rotate-12 hidden lg:block">
                <div className="grid grid-cols-6 gap-4">
                    {[...Array(24)].map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-gray-900 rounded-full" />
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col items-center text-center mb-20 space-y-6">
                    {/* Trust Badge */}
                    {/* @ts-ignore */}
                    <MotionDiv
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl shadow-gray-200/50 border border-white"
                    >
                        <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center border border-gray-100 p-1.5">
                            <svg viewBox="0 0 24 24" className="w-full h-full"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                        </div>
                        <div className="flex flex-col items-start">
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={10} fill="#FBBC05" className="text-[#FBBC05]" />
                                ))}
                            </div>
                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest mt-0.5">4.9/5 Rating</span>
                        </div>
                    </MotionDiv>

                    <div className="space-y-4 max-w-2xl">
                        <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none">
                            Our Community <br />
                            <span className="relative">
                                <span className="relative z-10 text-primary-500 italic">Loves Us.</span>
                                {/* Stylistic underline */}
                                {/* @ts-ignore */}
                                <MotionDiv
                                    initial={{ width: 0 }}
                                    whileInView={{ width: '100%' }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="absolute -bottom-2 left-0 h-3 bg-primary-100 -z-10 rounded-full"
                                />
                            </span>
                        </h2>
                        <p className="text-gray-500 font-medium text-lg leading-relaxed px-4">
                            Discover why thousands of residents in Dubai and Al Ain choose Purity for their elite home care needs. Real reviews from real people.
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Column 1 */}
                    <div className="space-y-8">
                        {[REVIEWS[0], REVIEWS[3]].map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>

                    {/* Column 2 - Staggered */}
                    <div className="space-y-8 lg:mt-16">
                        {[REVIEWS[1], REVIEWS[4]].map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>

                    {/* Column 3 */}
                    <div className="space-y-8">
                        {[REVIEWS[2], REVIEWS[5]].map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                </div>

                {/* Footer Action */}
                {/* @ts-ignore */}
                <div className="mt-24 flex flex-col md:flex-row items-center justify-center gap-6">
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg shadow-gray-200/50">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="user" />
                            </div>
                        ))}
                        <div className="w-12 h-12 rounded-full border-4 border-white bg-gray-900 flex items-center justify-center text-white text-[10px] font-black shadow-lg">
                            +50K
                        </div>
                    </div>
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Join the Purity Sanctuary Community</p>
                </div>
            </div>
        </section>
    );
};

const ReviewCard = ({ review }: { review: any }) => (
    /* @ts-ignore */
    <MotionDiv
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: review.delay }}
        viewport={{ once: true }}
        whileHover={{ y: -10 }}
        className="group/card relative bg-white rounded-xl p-10 border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] transition-all duration-700 overflow-hidden flex flex-col justify-between"
    >
        {/* Quote Icon Decoration */}
        <div className="absolute top-8 right-8 text-gray-50 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700">
            <Quote size={80} fill="currentColor" />
        </div>

        <div className="relative z-10 space-y-8">
            {/* Architectural Rating */}
            <div className="flex items-center justify-between">
                <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={14}
                            fill={i < review.rating ? "currentColor" : "none"}
                            className={i < review.rating ? `bg-gradient-to-br ${review.color} bg-clip-text text-transparent opacity-100` : "text-gray-100"}
                        />
                    ))}
                </div>
                {/* Google Verify Badge Style */}
                <div className="flex items-center gap-1.5 opacity-40 grayscale group-hover/card:grayscale-0 group-hover/card:opacity-100 transition-all">
                    <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Google Verified</span>
                </div>
            </div>

            {/* Review Sentiment */}
            <p className="text-gray-600 font-medium leading-[1.8] text-lg tracking-tight">
                {review.text.split(' ').map((word: string, i: number) => (
                    <span key={i} className={i < 3 ? "text-gray-900 font-black" : ""}>{word} </span>
                ))}
            </p>
        </div>

        {/* User Identity - High-End Layout */}
        <div className="relative z-10 flex items-center gap-5 mt-10">
            <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${review.color} blur-md opacity-20 rounded-2xl group-hover/card:scale-120 transition-transform`} />
                <div className="relative w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 p-1 overflow-hidden shadow-sm">
                    <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-50">
                    <CheckCircle2 size={12} className="text-primary-500" />
                </div>
            </div>

            <div className="flex flex-col">
                <h4 className="font-black text-gray-900 text-sm tracking-tight">{review.name}</h4>
                <div className="flex items-center gap-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {review.role}
                    </p>
                    <div className="w-1 h-1 bg-gray-200 rounded-full" />
                    <MessageSquare size={10} className="text-gray-300" />
                </div>
            </div>
        </div>
    </MotionDiv>
);
