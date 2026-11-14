import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, Clock, MapPin, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBookings } from '../context/BookingContext';
import { CustomerAccountTabs } from '../components/feature/CustomerAccountTabs';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const BookingsPage: React.FC = () => {
    const { bookings, loading } = useBookings();
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const [reviewedBookingIds, setReviewedBookingIds] = useState<string[]>([]);
    const [reviewingBookingId, setReviewingBookingId] = useState<string | null>(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [reviewBusy, setReviewBusy] = useState(false);
    const [reviewMessage, setReviewMessage] = useState('');
    const [reviewNoticeBookingId, setReviewNoticeBookingId] = useState<string | null>(null);
    const reviewCopy = language === 'fr'
        ? { rate: 'Évaluer ce service', reviewed: 'Évalué', title: 'Votre avis', placeholder: 'Partagez votre expérience (facultatif)', submit: 'Publier l’avis', cancel: 'Annuler', success: 'Merci. Votre avis vérifié a été publié.', failed: 'Impossible d’envoyer votre avis.' }
        : language === 'hi'
            ? { rate: 'इस सेवा को रेट करें', reviewed: 'रेट किया गया', title: 'आपकी समीक्षा', placeholder: 'अपना अनुभव साझा करें (वैकल्पिक)', submit: 'समीक्षा प्रकाशित करें', cancel: 'रद्द करें', success: 'धन्यवाद। आपकी सत्यापित समीक्षा प्रकाशित हो गई है।', failed: 'समीक्षा भेजी नहीं जा सकी।' }
            : { rate: 'Rate this service', reviewed: 'Reviewed', title: 'Your review', placeholder: 'Share your experience (optional)', submit: 'Publish review', cancel: 'Cancel', success: 'Thank you. Your verified review has been published.', failed: 'Could not submit your review.' };

    useEffect(() => {
        if (!user) { setReviewedBookingIds([]); return; }
        let active = true;
        void supabase.from('service_reviews').select('booking_id').eq('user_id', user.id).is('deleted_at', null).then(result => {
            if (active && !result.error) setReviewedBookingIds((result.data || []).map(row => row.booking_id));
        });
        return () => { active = false; };
    }, [user]);

    const submitReview = async (bookingId: string) => {
        setReviewBusy(true);
        setReviewMessage('');
        setReviewNoticeBookingId(null);
        const result = await supabase.rpc('submit_service_review', { p_booking_id: bookingId, p_rating: reviewRating, p_review_text: reviewText, p_language_code: language });
        if (result.error) setReviewMessage(result.error.message || reviewCopy.failed);
        else {
            setReviewedBookingIds(previous => [...previous, bookingId]);
            setReviewingBookingId(null);
            setReviewText('');
            setReviewMessage(reviewCopy.success);
            setReviewNoticeBookingId(bookingId);
        }
        setReviewBusy(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 pb-8 pt-5 md:px-5 md:pb-12 md:pt-8" dir="ltr">
            <div className="mx-auto w-full max-w-5xl">
            <CustomerAccountTabs />
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-5 md:mb-8">
                <div><p className="text-xs font-bold uppercase text-primary-700">{t('appointments')}</p><h1 className="mt-1 text-2xl font-semibold text-slate-950 md:text-3xl">{t('myBookingsTitle')}</h1><p className="mt-1 text-sm text-slate-500">{t('bookingsDescription')}</p></div>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">{bookings.length} {bookings.length === 1 ? t('booking') : t('bookingsPlural')}</span>
            </div>

            {loading && bookings.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">{t('loadingBookings')}</div>
            ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                <span className="rounded-xl bg-primary-50 p-3 text-primary-700"><Calendar size={24} /></span>
                <h2 className="mt-4 text-lg font-semibold text-slate-950">{t('noBookingsYet')}</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{t('firstBookingDescription')}</p>
                <Link to="/" className="mt-5 inline-flex h-10 items-center rounded-lg bg-primary-700 px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-800">{t('browseServices')}</Link>
            </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map(booking => (
                    <article key={booking.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h2 className="truncate text-base font-semibold text-slate-950">{booking.serviceName}</h2>
                                    <p className="mt-1 text-xs text-slate-400">{t('bookingNumber')} #{booking.id.slice(0, 6)}</p>
                                </div>
                                <StatusBadge status={booking.status} />
                            </div>
                            <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600 sm:grid-cols-2">
                                <span className="flex items-center gap-2"><Calendar size={16} className="text-slate-400" /> <span><small className="block text-xs text-slate-400">{t('dateLabel')}</small><strong className="mt-0.5 block font-medium text-slate-800">{booking.date}</strong></span></span>
                                <span className="flex items-center gap-2"><Clock size={16} className="text-slate-400" /> <span><small className="block text-xs text-slate-400">{t('timeLabel')}</small><strong className="mt-0.5 block font-medium text-slate-800">{booking.time}</strong></span></span>
                            </div>
                            {booking.address && <p className="mt-4 flex items-start gap-2 text-sm text-slate-600"><MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" /> <span>{booking.address}</span></p>}
                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                                <div>
                                    <span className="block text-xs text-slate-400">{t('total')}</span>
                                    <strong className="mt-0.5 block text-sm font-semibold text-slate-950">{booking.totalPrice.toFixed(2)} AED</strong>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-semibold">
                                    <Link
                                        to="/"
                                        state={{ serviceId: booking.serviceId }}
                                        className="inline-flex h-9 items-center rounded-lg border border-slate-300 px-3 text-slate-700 hover:bg-slate-50"
                                    >
                                        {t('bookAgain')}
                                    </Link>
                                    <a
                                        href={`https://wa.me/971544556106?text=${encodeURIComponent(`Hello, I have a question about booking ${booking.id}.`)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-white hover:bg-emerald-700"
                                    >
                                        <MessageCircle size={14} /> {t('whatsapp')}
                                    </a>
                                </div>
                            </div>
                            {booking.status === 'completed' && <div className="mt-4 border-t border-slate-100 pt-4">
                                {reviewedBookingIds.includes(booking.id) ? <span className="text-xs font-bold text-emerald-700">{reviewCopy.reviewed}</span> : reviewingBookingId === booking.id ? <div className="rounded-xl bg-primary-50 p-3">
                                    <p className="text-xs font-black text-slate-900">{reviewCopy.title}</p>
                                    <div className="mt-2 flex items-center gap-1" role="radiogroup" aria-label={reviewCopy.title}>{[1, 2, 3, 4, 5].map(value => <button key={value} type="button" onClick={() => setReviewRating(value)} aria-label={`${value} / 5`} className={`text-xl leading-none ${value <= reviewRating ? 'text-amber-500' : 'text-slate-300'}`}>★</button>)}</div>
                                    <textarea value={reviewText} onChange={event => setReviewText(event.target.value)} maxLength={2000} placeholder={reviewCopy.placeholder} className="mt-2 min-h-20 w-full rounded-lg border border-primary-100 bg-white p-2 text-xs outline-none focus:border-primary-500" />
                                    {reviewMessage && <p className="mt-2 text-xs font-semibold text-red-700">{reviewMessage}</p>}
                                    <div className="mt-2 flex flex-wrap gap-2"><button type="button" disabled={reviewBusy} onClick={() => void submitReview(booking.id)} className="rounded-lg bg-primary-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">{reviewCopy.submit}</button><button type="button" onClick={() => setReviewingBookingId(null)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">{reviewCopy.cancel}</button></div>
                                </div> : <button type="button" onClick={() => { setReviewingBookingId(booking.id); setReviewMessage(''); }} className="text-xs font-bold text-primary-700 hover:text-primary-900">{reviewCopy.rate}</button>}
                                {reviewMessage && reviewingBookingId === null && reviewNoticeBookingId === booking.id && <p className="mt-2 text-xs font-semibold text-emerald-700">{reviewMessage}</p>}
                            </div>}
                        </article>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles = status === 'confirmed' ? 'border-blue-200 bg-blue-50 text-blue-700' : status === 'completed' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : status === 'cancelled' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700';
    return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${styles}`}><CheckCircle2 size={12} /> {status}</span>;
};
