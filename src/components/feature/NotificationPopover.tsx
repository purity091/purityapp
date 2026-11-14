// @ts-nocheck
import React from 'react';
import { ArrowRight, Bell, CheckCheck, Clock3, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CustomerNotification } from '../../context/BookingContext';
import { useLanguage } from '../../context/LanguageContext';

interface NotificationPopoverProps {
    notifications: CustomerNotification[];
    notificationsLoading: boolean;
    onMarkRead: (id: string) => void;
    onMarkAllRead: () => void;
    onClose: () => void;
    mobile?: boolean;
    isAuthenticated?: boolean;
    onSignIn?: () => void;
}

const formatDate = (value: string, language: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(language === 'fr' ? 'fr-AE' : language === 'hi' ? 'hi-IN' : 'en-AE', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
    notifications,
    notificationsLoading,
    onMarkRead,
    onMarkAllRead,
    onClose,
    mobile = false,
    isAuthenticated = true,
    onSignIn,
}) => {
    const { t, language } = useLanguage();
    const unread = notifications.filter(notification => !notification.readAt).length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            role="dialog"
            aria-label={t('notifications')}
            className={`${
                mobile ? 'absolute left-3 right-3 top-full mt-2' : 'absolute right-0 top-full z-[70] mt-3 w-80 sm:w-96'
            } overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left shadow-2xl shadow-slate-950/15`}
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-primary-50 px-4 py-3.5">
                <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 text-primary-800">
                        <Bell size={14} />
                    </span>
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-primary-900">{t('notifications')}</p>
                        {isAuthenticated && (
                            <p className="text-[10px] font-semibold text-primary-700">
                                {unread ? `${unread} ${t('unreadUpdates')}` : t('caughtUp')}
                            </p>
                        )}
                    </div>
                </div>
                {isAuthenticated && unread > 0 && (
                    <button
                        type="button"
                        onClick={onMarkAllRead}
                        className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-primary-800 shadow-sm transition hover:bg-primary-100"
                        title={t('markRead')}
                    >
                        <CheckCheck size={12} /> {t('markRead')}
                    </button>
                )}
            </div>

            {/* Content */}
            {!isAuthenticated ? (
                <div className="px-5 py-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                        <Bell size={24} strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-bold text-slate-800">{t('signInToNotifications')}</p>
                    <p className="mt-1 text-xs text-slate-500">{t('notificationDescription')}</p>
                    {onSignIn && (
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                onSignIn();
                            }}
                            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-700 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-primary-800"
                        >
                            <LogIn size={14} /> {t('signIn')}
                        </button>
                    )}
                </div>
            ) : notificationsLoading && notifications.length === 0 ? (
                <div className="p-8 text-center text-xs font-semibold text-slate-500">{t('loadingNotifications')}</div>
            ) : notifications.length === 0 ? (
                <div className="px-5 py-8 text-center">
                    <Bell size={32} className="mx-auto mb-2 text-slate-200" strokeWidth={1} />
                    <p className="text-sm font-bold text-slate-700">{t('noNotifications')}</p>
                    <p className="mt-1 text-xs text-slate-400">{t('notificationEmpty')}</p>
                </div>
            ) : (
                <div className="max-h-72 divide-y divide-slate-50 overflow-y-auto">
                    {notifications.slice(0, 8).map(notification => (
                        <button
                            type="button"
                            key={notification.id}
                            onClick={() => onMarkRead(notification.id)}
                            className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${
                                notification.readAt ? 'bg-white opacity-85' : 'bg-primary-50/40'
                            }`}
                        >
                            <span
                                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                    notification.readAt ? 'bg-slate-100 text-slate-500' : 'bg-primary-100 text-primary-800'
                                }`}
                            >
                                <Bell size={13} />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="flex items-start justify-between gap-2">
                                    <strong className="truncate text-xs font-bold text-slate-900">{notification.title}</strong>
                                    {!notification.readAt && (
                                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-600" />
                                    )}
                                </span>
                                <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-600">{notification.message}</span>
                                <span className="mt-1 flex items-center gap-1 text-[10px] font-medium text-slate-400">
                                    <Clock3 size={10} /> {formatDate(notification.createdAt, language)}
                                </span>
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Footer */}
            {isAuthenticated && (
                <div className="border-t border-slate-100 px-4 py-2.5">
                    <Link
                        to="/notifications"
                        onClick={onClose}
                        className="flex items-center justify-center gap-1.5 text-xs font-bold text-primary-700 transition hover:text-primary-900"
                    >
                        {t('viewAllNotifications')} <ArrowRight size={13} />
                    </Link>
                </div>
            )}
        </motion.div>
    );
};
