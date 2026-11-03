import React from 'react';
import { Bell, CalendarDays, Heart, LayoutDashboard, UserRound } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const tabs = [
    { to: '/dashboard', label: 'Dashboard', detail: 'Customer dashboard', icon: LayoutDashboard },
    { to: '/bookings', label: 'My bookings', detail: 'Review history', icon: CalendarDays },
    { to: '/profile', label: 'My profile', detail: 'Manage account', icon: UserRound },
    { to: '/notifications', label: 'Notifications', detail: 'Stay updated', icon: Bell },
    { to: '/wishlist', label: 'Wishlist', detail: 'Saved services', icon: Heart },
];

export const CustomerAccountTabs: React.FC = () => {
    const location = useLocation();

    return (
        <nav aria-label="Customer account pages" className="mb-5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm md:mb-7 md:p-2">
            <div className="grid grid-cols-2 gap-1 md:grid-cols-5">
                {tabs.map(({ to, label, detail, icon: Icon }) => {
                    const active = location.pathname === to;
                    return (
                        <Link
                            key={to}
                            to={to}
                            aria-current={active ? 'page' : undefined}
                            className={`flex min-w-0 items-center gap-2 rounded-lg px-2.5 py-2.5 text-left transition md:gap-3 md:px-3 md:py-3 ${active ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
                        >
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${active ? 'bg-primary-500/20 text-primary-200' : 'bg-primary-50 text-primary-700'}`}>
                                <Icon size={16} />
                            </span>
                            <span className="min-w-0">
                                <strong className="block truncate text-[11px] font-semibold md:text-xs">{label}</strong>
                                <span className={`mt-0.5 block truncate text-[9px] font-medium md:text-[10px] ${active ? 'text-slate-300' : 'text-slate-400'}`}>{detail}</span>
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
