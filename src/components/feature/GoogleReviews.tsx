// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { CheckCircle2, Quote, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { SafeImage } from '../ui/SafeImage';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';

interface PublicReview {
    id: string;
    display_name: string;
    service_name: string;
    rating: number;
    review_text: string | null;
}

interface ReviewSummary {
    average_rating: number;
    review_count: number;
}

const Stars: React.FC<{ rating: number; size?: number }> = ({ rating, size = 14 }) => (
    <span className="inline-flex items-center gap-0.5 text-amber-500" aria-label={`${rating.toFixed(1)} / 5`}>
        {[1, 2, 3, 4, 5].map(star => <Star key={star} size={size} fill={star <= Math.round(rating) ? 'currentColor' : 'none'} className={star <= Math.round(rating) ? 'text-amber-500' : 'text-gray-300'} />)}
    </span>
);

const reviewCopy = (language: string) => language === 'fr'
    ? {
        count: (value: number) => `${value} avis vérifiés`,
        empty: 'Les avis vérifiés apparaîtront après les premières réservations terminées.',
        unavailable: 'Les avis sont temporairement indisponibles.',
        loading: 'Chargement des avis...'
    }
    : language === 'hi'
        ? {
            count: (value: number) => `${value} सत्यापित समीक्षाएं`,
            empty: 'पहली पूर्ण बुकिंग के बाद सत्यापित समीक्षाएं दिखाई देंगी।',
            unavailable: 'समीक्षाएं अस्थायी रूप से उपलब्ध नहीं हैं।',
            loading: 'समीक्षाएं लोड हो रही हैं...'
        }
        : {
            count: (value: number) => `${value} verified reviews`,
            empty: 'Verified reviews will appear after completed bookings.',
            unavailable: 'Reviews are temporarily unavailable.',
            loading: 'Loading reviews...'
        };

export const GoogleReviews: React.FC = () => {
    const { t, language } = useLanguage();
    const [reviews, setReviews] = useState<PublicReview[]>([]);
    const [summary, setSummary] = useState<ReviewSummary>({ average_rating: 0, review_count: 0 });
    const [loading, setLoading] = useState(true);
    const [sourceUnavailable, setSourceUnavailable] = useState(false);
    const copy = reviewCopy(language);

    useEffect(() => {
        let active = true;
        const loadReviews = async () => {
            setLoading(true);
            const [reviewsResult, summaryResult] = await Promise.all([
                supabase.from('service_reviews').select('id, display_name, service_name, rating, review_text').eq('status', 'published').eq('verified_booking', true).is('deleted_at', null).order('created_at', { ascending: false }).limit(12),
                supabase.rpc('get_public_review_summary'),
            ]);
            if (!active) return;

            const rows = (reviewsResult.data || []) as PublicReview[];
            if (reviewsResult.error) {
                console.warn('Verified reviews are not available yet.', reviewsResult.error);
                setReviews([]);
                setSummary({ average_rating: 0, review_count: 0 });
                setSourceUnavailable(true);
            } else {
                setReviews(rows);
                setSourceUnavailable(false);
                if (!summaryResult.error && Array.isArray(summaryResult.data) && summaryResult.data[0]) {
                    setSummary({ average_rating: Number(summaryResult.data[0].average_rating || 0), review_count: Number(summaryResult.data[0].review_count || 0) });
                } else {
                    setSummary({ average_rating: rows.length ? Number((rows.reduce((sum, row) => sum + Number(row.rating), 0) / rows.length).toFixed(2)) : 0, review_count: rows.length });
                }
            }
            setLoading(false);
        };
        void loadReviews();
        return () => { active = false; };
    }, []);

    return (
        <section id="reviews" className="scroll-mt-20 bg-white py-8 md:py-20">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col gap-4 lg:mb-9 lg:gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <div className="mb-3 inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2.5 py-0.5 text-[10px] font-black uppercase text-gray-700 md:mb-4 md:gap-2 md:px-3 md:py-1 md:text-[11px]">
                            <CheckCircle2 size={13} className="text-emerald-700" /> {t('verifiedStories')}
                        </div>
                        <h2 className="text-2xl font-black leading-tight text-gray-950 sm:text-4xl">{t('lovedHomeowners')}</h2>
                        <p className="mt-2 max-w-xl text-[13px] font-semibold leading-6 text-gray-700 md:mt-3 md:text-base md:leading-7">{t('reviewDescription')}</p>
                    </div>
                    <div className="flex flex-none items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 shadow-sm md:gap-3 md:rounded-xl md:px-4 md:py-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-amber-500 md:h-10 md:w-10 md:rounded-lg"><Star size={17} className="md:h-5 md:w-5" fill={summary.review_count ? 'currentColor' : 'none'} /></div>
                        <div>
                            <div className="flex items-center gap-2"><span className="text-sm font-black text-gray-950 md:text-lg">{summary.review_count ? `${summary.average_rating.toFixed(2)} / 5.0` : '— / 5.0'}</span>{summary.review_count > 0 && <Stars rating={summary.average_rating} size={12} />}</div>
                            <p className="text-[10px] font-bold text-gray-600 md:text-[11px]">{summary.review_count ? copy.count(summary.review_count) : (sourceUnavailable ? copy.unavailable : copy.empty)}</p>
                        </div>
                    </div>
                </div>

                {loading ? <div className="rounded-xl bg-gray-50 p-10 text-center text-sm font-semibold text-gray-500">{copy.loading}</div> : reviews.length === 0 ? <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm font-semibold text-gray-500">{sourceUnavailable ? copy.unavailable : copy.empty}</div> : (
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
                        {reviews.map((review, index) => <motion.article key={review.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: index * 0.04 }} className="flex min-h-0 flex-col justify-between rounded-lg bg-gray-50 p-3 shadow-sm transition-colors hover:bg-gray-100 md:min-h-[220px] md:rounded-xl md:p-5">
                            <div>
                                <div className="flex items-center justify-between gap-3"><Stars rating={Number(review.rating)} /><span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-800 md:text-[10px]"><CheckCircle2 size={11} /> {t('verifiedBooking')}</span></div>
                                {review.review_text && <p className="mt-3 text-xs font-medium leading-5 text-gray-800 md:mt-4 md:text-sm md:leading-6">“{review.review_text}”</p>}
                            </div>
                            <div className="mt-4 flex items-center gap-2 pt-3 md:mt-5 md:gap-3 md:pt-4"><SafeImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(review.display_name)}`} alt={review.display_name} className="h-8 w-8 rounded-full bg-gray-100 md:h-9 md:w-9" /><div className="min-w-0 flex-1"><h3 className="truncate text-xs font-black text-gray-950">{review.display_name}</h3><p className="truncate text-[11px] font-semibold text-gray-600"><span className="text-primary-800">{review.service_name}</span></p></div><Quote size={15} className="flex-none text-gray-300 md:h-[17px] md:w-[17px]" /></div>
                        </motion.article>)}
                    </div>
                )}
            </div>
        </section>
    );
};
