import React from 'react';
import { Calendar, CheckCircle2, Clock, MapPin, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBookings } from '../context/BookingContext';
import { CustomerAccountTabs } from '../components/feature/CustomerAccountTabs';

export const BookingsPage: React.FC = () => {
    const { bookings, loading } = useBookings();

    return (
        <div className="min-h-screen bg-slate-50 px-4 pb-8 pt-5 md:px-5 md:pb-12 md:pt-8" dir="ltr">
            <div className="mx-auto w-full max-w-5xl">
            <CustomerAccountTabs />
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-5 md:mb-8">
                <div><p className="text-xs font-bold uppercase text-primary-700">Appointments</p><h1 className="mt-1 text-2xl font-semibold text-slate-950 md:text-3xl">My bookings</h1><p className="mt-1 text-sm text-slate-500">Review your upcoming and previous service requests.</p></div>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">{bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}</span>
            </div>

            {loading && bookings.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">Loading your bookings...</div>
            ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                <span className="rounded-xl bg-primary-50 p-3 text-primary-700"><Calendar size={24} /></span>
                <h2 className="mt-4 text-lg font-semibold text-slate-950">No bookings yet</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">You haven't booked a service yet. Explore our services and schedule your first appointment.</p>
                <Link to="/" className="mt-5 inline-flex h-10 items-center rounded-lg bg-primary-700 px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-800">Browse services</Link>
            </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map(booking => (
                    <article key={booking.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h2 className="truncate text-base font-semibold text-slate-950">{booking.serviceName}</h2>
                                    <p className="mt-1 text-xs text-slate-400">Booking #{booking.id.slice(0, 6)}</p>
                                </div>
                                <StatusBadge status={booking.status} />
                            </div>
                            <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600 sm:grid-cols-2">
                                <span className="flex items-center gap-2"><Calendar size={16} className="text-slate-400" /> <span><small className="block text-xs text-slate-400">Date</small><strong className="mt-0.5 block font-medium text-slate-800">{booking.date}</strong></span></span>
                                <span className="flex items-center gap-2"><Clock size={16} className="text-slate-400" /> <span><small className="block text-xs text-slate-400">Time</small><strong className="mt-0.5 block font-medium text-slate-800">{booking.time}</strong></span></span>
                            </div>
                            {booking.address && <p className="mt-4 flex items-start gap-2 text-sm text-slate-600"><MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" /> <span>{booking.address}</span></p>}
                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                                <div>
                                    <span className="block text-xs text-slate-400">Total</span>
                                    <strong className="mt-0.5 block text-sm font-semibold text-slate-950">{booking.totalPrice.toFixed(2)} AED</strong>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-semibold">
                                    <Link
                                        to="/"
                                        state={{ serviceId: booking.serviceId }}
                                        className="inline-flex h-9 items-center rounded-lg border border-slate-300 px-3 text-slate-700 hover:bg-slate-50"
                                    >
                                        Book again
                                    </Link>
                                    <a
                                        href={`https://wa.me/971544556106?text=${encodeURIComponent(`Hello, I have a question about booking ${booking.id}.`)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-white hover:bg-emerald-700"
                                    >
                                        <MessageCircle size={14} /> WhatsApp
                                    </a>
                                </div>
                            </div>
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
