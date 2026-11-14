import React from 'react';
import { Bell, CheckCheck, Clock3 } from 'lucide-react';
import { useBookings } from '../context/BookingContext';
import { CustomerAccountTabs } from '../components/feature/CustomerAccountTabs';
import { useLanguage } from '../context/LanguageContext';

export const NotificationsPage: React.FC = () => {
    const { notifications, notificationsLoading, markNotificationRead, markAllNotificationsRead } = useBookings();
    const { t, language } = useLanguage();
    const unread = notifications.filter(notification => !notification.readAt).length;

    return (
        <div className="min-h-screen bg-slate-50 px-4 pb-8 pt-5 md:px-5 md:pb-12 md:pt-8" dir="ltr">
            <div className="mx-auto w-full max-w-5xl">
            <CustomerAccountTabs />
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-5 md:mb-8">
                <div>
                    <p className="mb-1 text-xs font-semibold uppercase text-primary-600">{t('activity')}</p>
                    <h1 className="text-2xl font-semibold text-slate-950 md:text-3xl">{t('notificationsTitle')}</h1>
                    <p className="mt-1 text-sm text-slate-500">{t('notificationsDescription')}</p>
                </div>
                {unread > 0 && <button type="button" onClick={markAllNotificationsRead} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"><CheckCheck size={15} /> {t('markAllRead')}</button>}
            </div>

            {notificationsLoading && notifications.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">{t('loadingNotificationsPage')}</div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                    <div className="rounded-xl bg-primary-50 p-3 text-primary-600"><Bell size={24} /></div>
                    <h2 className="mt-4 text-lg font-semibold text-slate-950">{t('allCaughtUp')}</h2>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{t('notificationsEmptyDescription')}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map(notification => (
                        <button type="button" key={notification.id} onClick={() => markNotificationRead(notification.id)} className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left shadow-sm transition hover:border-primary-300 md:p-5 ${notification.readAt ? 'border-slate-200 bg-white' : 'border-primary-300 bg-primary-50/40'}`}>
                            <span className={`mt-0.5 rounded-lg p-2.5 ${notification.readAt ? 'bg-slate-100 text-slate-500' : 'bg-white text-primary-600'}`}><Bell size={17} /></span>
                            <span className="min-w-0 flex-1">
                                <span className="flex items-start justify-between gap-3"><strong className="text-sm font-semibold text-slate-950">{notification.title}</strong>{!notification.readAt && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-600" aria-label={t('unread')} />}</span>
                                <span className="mt-1 block text-sm leading-6 text-slate-600">{notification.message}</span>
                                <span className="mt-2 flex items-center gap-1 text-xs text-slate-400"><Clock3 size={13} /> {formatDate(notification.createdAt, language)}</span>
                            </span>
                        </button>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
};

const formatDate = (value: string, language: string) => new Intl.DateTimeFormat(language === 'fr' ? 'fr-AE' : language === 'hi' ? 'hi-IN' : 'en-AE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
