import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBookings } from '../context/BookingContext';

export const BookingsPage: React.FC = () => {
    const { bookings, loading } = useBookings();

    return (
        <div className="min-h-screen bg-gray-50 px-4 pb-4 pt-5 md:px-5 md:pb-0 md:pt-8">
            <h2 className="mb-5 text-2xl font-black text-teal-950 md:mb-8 md:text-3xl">My Bookings</h2>

            {loading && bookings.length === 0 ? (
                <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500 md:rounded-[2.5rem] md:p-10">Loading your bookings...</div>
            ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-gray-100/50 bg-white p-6 text-center shadow-sm md:space-y-6 md:rounded-[2.5rem] md:p-8 md:py-20">
                <div className="relative overflow-hidden rounded-full bg-teal-50 p-5 md:p-8">
                    <Clock size={36} className="relative z-10 text-teal-400 md:h-12 md:w-12" />
                    <div className="absolute inset-0 bg-teal-100/50 blur-xl" aria-hidden="true"></div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-black text-gray-800 md:text-xl">No Active Bookings</h3>
                    <p className="mx-auto max-w-[260px] text-xs font-medium leading-relaxed text-gray-400 md:text-sm">
                        You haven't booked any service yet. Discover our offers and start your first clean experience.
                    </p>
                </div>

                <Link
                    to="/"
                    className="rounded-xl bg-teal-600 px-7 py-3 text-xs font-black text-white shadow-lg shadow-teal-600/20 transition-transform hover:bg-teal-700 active:scale-95 md:px-10 md:py-4 md:rounded-2xl md:text-sm"
                >
                    Browse Services
                </Link>
            </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map(booking => (
                    <article key={booking.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:rounded-3xl md:p-5">
                            <div className="flex items-start justify-between gap-3 md:gap-4">
                                <div className="min-w-0">
                                    <h3 className="font-black text-gray-900 truncate">{booking.serviceName}</h3>
                                    <p className="text-xs text-gray-400 mt-1">Order #{booking.id.slice(0, 6)}</p>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {booking.status}
                                </span>
                            </div>
                            <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-3 md:mt-4 md:gap-3">
                                <span className="flex items-center gap-1.5"><Calendar size={14} /> {booking.date}</span>
                                <span className="flex items-center gap-1.5"><Clock size={14} /> {booking.time}</span>
                                <span className="flex items-center gap-1.5"><MapPin size={14} /> {booking.neighborhood}</span>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3 text-sm md:mt-4">
                                <div>
                                    <span className="block text-xs text-gray-500">Total</span>
                                    <strong className="text-teal-700">{booking.totalPrice.toFixed(2)} AED</strong>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] font-bold">
                                    <Link
                                        to="/"
                                        state={{ serviceId: booking.serviceId }}
                                        className="rounded-lg border border-teal-200 px-2.5 py-1.5 text-teal-700 hover:bg-teal-50"
                                    >
                                        Book again
                                    </Link>
                                    <a
                                        href={`https://wa.me/971544556106?text=${encodeURIComponent(`Hello, I have a question about booking ${booking.id}.`)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-white hover:bg-emerald-700"
                                    >
                                        WhatsApp
                                    </a>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};
