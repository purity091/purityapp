import React from 'react';
import { Bell, CalendarDays, CheckCircle2, Clock3, MapPin, Plus, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';
import { CustomerAccountTabs } from '../components/feature/CustomerAccountTabs';
import { useLanguage } from '../context/LanguageContext';

export const CustomerDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const { bookings, notifications, unreadNotificationCount } = useBookings();
    const { t } = useLanguage();
    const upcoming = bookings
        .filter(booking => booking.status !== 'cancelled' && booking.date >= today())
        .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))[0];
    const active = bookings.filter(booking => ['pending', 'confirmed'].includes(booking.status)).length;
    const completed = bookings.filter(booking => booking.status === 'completed').length;

    return (
        <div className="min-h-screen bg-slate-50 px-4 pb-8 pt-5 md:px-5 md:pb-12 md:pt-8" dir="ltr">
            <div className="mx-auto w-full max-w-5xl">
            <CustomerAccountTabs />
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-200 pb-5 md:mb-8">
                <div>
                    <p className="text-xs font-bold uppercase text-primary-700">{t('overview')}</p>
                    <h1 className="mt-1 text-2xl font-semibold text-slate-950 md:text-3xl">{t('hello')}, {user?.fullName || t('there')}!</h1>
                    <p className="mt-1 text-sm text-slate-500">{t('dashboardDescription')}</p>
                </div>
                <Link to="/profile" aria-label={t('openProfile')} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"><UserRound size={17} /></Link>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-2 md:mb-8 md:gap-4">
                <Stat label={t('allBookings')} value={bookings.length} />
                <Stat label={t('active')} value={active} accent />
                <Stat label={t('completed')} value={completed} />
            </div>

            <div className="mb-6 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)] md:mb-8">
                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 md:px-6"><span className="flex items-center gap-2 text-sm font-semibold text-slate-900"><CalendarDays size={16} className="text-primary-700" /> {t('nextService')}</span><Link to="/bookings" className="text-xs font-semibold text-primary-700 hover:text-primary-900">{t('viewAll')}</Link></div>
                    {upcoming ? <div className="p-5 md:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-medium text-slate-500">{t('upcomingBooking')}</p><h2 className="mt-1 text-xl font-semibold text-slate-950 md:text-2xl">{upcoming.serviceName}</h2></div><StatusBadge status={upcoming.status} /></div><div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 text-sm text-slate-600 sm:grid-cols-3"><span className="flex items-start gap-2"><CalendarDays size={16} className="mt-0.5 shrink-0 text-slate-400" /> <span><small className="block text-xs text-slate-400">{t('dateLabel')}</small><strong className="mt-0.5 block font-medium text-slate-800">{upcoming.date}</strong></span></span><span className="flex items-start gap-2"><Clock3 size={16} className="mt-0.5 shrink-0 text-slate-400" /> <span><small className="block text-xs text-slate-400">{t('timeLabel')}</small><strong className="mt-0.5 block font-medium text-slate-800">{upcoming.time}</strong></span></span><span className="flex min-w-0 items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" /> <span className="min-w-0"><small className="block text-xs text-slate-400">{t('location')}</small><strong className="mt-0.5 block truncate font-medium text-slate-800">{upcoming.address || t('mapLocationSelected')}</strong></span></span></div><p className="mt-5 text-xs text-slate-400">{t('bookingNumber')} #{upcoming.id.slice(0, 6)}</p></div> : <div className="p-6 md:p-8"><h2 className="text-xl font-semibold text-slate-950">{t('readyCleanerHome')}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{t('bookNextService')}</p><Link to="/" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-800"><Plus size={16} /> {t('bookAService')}</Link></div>}
                </section>

                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><span className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Bell size={16} className="text-primary-700" /> {t('updates')}</span><Link to="/notifications" className="text-xs font-semibold text-primary-700 hover:text-primary-900">{t('seeAll')}</Link></div>
                    <div className="p-5 md:p-6"><strong className="block text-3xl font-semibold text-slate-950">{unreadNotificationCount}</strong><p className="mt-1 text-xs text-slate-500">{t('unreadNotifications')}</p><div className="mt-5 space-y-4 border-t border-slate-100 pt-4">{notifications.slice(0, 2).map(notification => <div key={notification.id} className="flex gap-2.5"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.readAt ? 'bg-slate-300' : 'bg-primary-600'}`} /><p className="line-clamp-2 text-xs leading-5 text-slate-600">{notification.message}</p></div>)}{notifications.length === 0 && <p className="text-sm text-slate-400">{t('noUpdatesYet')}</p>}</div></div>
                </section>
            </div>
            </div>
        </div>
    );
};

const today = () => {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
};
const Stat: React.FC<{ label: string; value: number; accent?: boolean }> = ({ label, value, accent }) => <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:p-4"><span className="block truncate text-[9px] font-semibold uppercase text-slate-500 md:text-[10px]">{label}</span><strong className={`mt-1 block text-2xl font-semibold ${accent ? 'text-primary-700' : 'text-slate-950'}`}>{value}</strong></div>;
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles = status === 'confirmed' ? 'border-blue-200 bg-blue-50 text-blue-700' : status === 'completed' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : status === 'cancelled' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700';
    return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${styles}`}><CheckCircle2 size={12} /> {status}</span>;
};
