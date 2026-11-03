import React from 'react';
import { ArrowRight, Bell, CheckCheck, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CustomerNotification } from '../../context/BookingContext';

interface NotificationPopoverProps {
    notifications: CustomerNotification[];
    notificationsLoading: boolean;
    onMarkRead: (id: string) => void;
    onMarkAllRead: () => void;
    onClose: () => void;
    mobile?: boolean;
}

const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-AE', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({ notifications, notificationsLoading, onMarkRead, onMarkAllRead, onClose, mobile = false }) => {
    const unread = notifications.filter(notification => !notification.readAt).length;

    return (
        <div role="dialog" aria-label="Notifications" className={`${mobile ? 'absolute left-3 right-3 top-full mt-2' : 'absolute right-0 top-full mt-3 w-96'} z-[60] overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-2xl shadow-gray-900/15`}>
            <div className="flex items-center justify-between border-b border-gray-100 bg-primary-50 px-4 py-3">
                <div className="flex items-center gap-2"><span className="rounded-lg bg-primary-100 p-1.5 text-primary-700"><Bell size={14} /></span><div><p className="text-xs font-black text-gray-900">Notifications</p><p className="text-[10px] font-semibold text-gray-500">{unread ? `${unread} unread update${unread === 1 ? '' : 's'}` : 'You are all caught up'}</p></div></div>
                {unread > 0 && <button type="button" onClick={onMarkAllRead} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-black text-primary-700 transition hover:bg-white" title="Mark all notifications as read"><CheckCheck size={13} /> Mark all read</button>}
            </div>
            {notificationsLoading && notifications.length === 0 ? <div className="p-7 text-center text-xs font-semibold text-gray-500">Loading notifications...</div> : notifications.length === 0 ? <div className="p-7 text-center"><Bell size={25} className="mx-auto text-gray-200" /><p className="mt-2 text-xs font-black text-gray-700">No notifications yet</p><p className="mt-1 text-[11px] font-medium text-gray-400">Booking updates will appear here.</p></div> : <div className="max-h-80 divide-y divide-gray-100 overflow-y-auto">{notifications.slice(0, 6).map(notification => <button type="button" key={notification.id} onClick={() => onMarkRead(notification.id)} className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-gray-50 ${notification.readAt ? 'bg-white' : 'bg-primary-50/30'}`}><span className={`mt-0.5 rounded-lg p-2 ${notification.readAt ? 'bg-gray-100 text-gray-500' : 'bg-primary-100 text-primary-700'}`}><Bell size={14} /></span><span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-2"><strong className="truncate text-xs font-black text-gray-900">{notification.title}</strong>{!notification.readAt && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-600" />}</span><span className="mt-1 block text-[11px] font-medium leading-5 text-gray-600">{notification.message}</span><span className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-gray-400"><Clock3 size={11} /> {formatDate(notification.createdAt)}</span></span></button>)}</div>}
            <Link to="/notifications" onClick={onClose} className="flex items-center justify-center gap-1.5 border-t border-gray-100 px-4 py-3 text-xs font-black text-primary-700 transition hover:bg-primary-50">View all notifications <ArrowRight size={14} /></Link>
        </div>
    );
};
