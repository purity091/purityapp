import React, { useCallback, useEffect, useState } from 'react';
import { ArrowRight, BriefcaseBusiness, CalendarDays, CheckCircle2, Clock3, LogOut, RefreshCw, UsersRound, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminNavigation } from './AdminDashboardPage';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { BookingStatus } from '../types';

const statusMeta: Record<BookingStatus, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-amber-50 text-amber-800' },
    confirmed: { label: 'Confirmed', className: 'bg-blue-50 text-blue-800' },
    completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-800' },
    cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-800' },
};

const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(date);
};

export const AdminOverviewPage: React.FC = () => {
    const { user, logout } = useAuth();
    const { bookings, loading, adminStats, setAdminFilters, refreshBookings } = useBookings();
    const navigate = useNavigate();
    const [catalogCount, setCatalogCount] = useState({ services: 0, packages: 0 });
    const [customerCount, setCustomerCount] = useState(0);
    const [pageError, setPageError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        setAdminFilters({ status: 'all', search: '', sortBy: 'created_at', sortDirection: 'desc' });
    }, [setAdminFilters]);

    const loadSummary = useCallback(async () => {
        if (!isSupabaseConfigured()) return;
        setPageError(null);
        const [catalogResult, customersResult] = await Promise.all([
            supabase.from('catalog_items').select('item_type').eq('status', 'published').is('deleted_at', null),
            supabase.from('customer_profiles').select('user_id', { count: 'exact', head: true }),
        ]);
        if (catalogResult.error || customersResult.error) {
            setPageError(catalogResult.error?.message || customersResult.error?.message || 'Could not load the administration summary.');
            return;
        }
        const rows = catalogResult.data || [];
        setCatalogCount({
            services: rows.filter(item => item.item_type === 'service').length,
            packages: rows.filter(item => item.item_type === 'package').length,
        });
        setCustomerCount(customersResult.count || 0);
    }, []);

    useEffect(() => { void loadSummary(); }, [loadSummary]);

    const refresh = async () => {
        setRefreshing(true);
        await Promise.all([refreshBookings(), loadSummary()]);
        setRefreshing(false);
    };

    const handleLogout = async () => { await logout(); navigate('/admin'); };
    const recentBookings = bookings.slice(0, 8);

    return <div className="min-h-screen bg-slate-50 pb-16 text-slate-950" dir="ltr">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
            <div className="mx-auto flex min-h-16 max-w-[1280px] items-center justify-between gap-4 px-4 py-3 md:px-6">
                <div className="flex items-center gap-3"><img src="/logo.png" alt="Purity logo" className="h-10 w-10 rounded-xl object-contain" /><div><p className="text-sm font-bold">Purity Admin</p><p className="text-[11px] font-medium text-slate-500">Operations overview</p></div></div>
                <div className="flex items-center gap-2"><span className="hidden max-w-48 truncate text-xs font-semibold text-slate-600 sm:block">{user?.email}</span><button type="button" onClick={() => void refresh()} disabled={refreshing || loading} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><RefreshCw size={14} className={refreshing || loading ? 'animate-spin' : ''} /> Refresh</button><Button variant="ghost" onClick={() => void handleLogout()} className="h-9 px-3 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700"><LogOut className="mr-1.5 h-4 w-4" /> Logout</Button></div>
            </div>
        </header>
        <div className="mx-auto flex max-w-[1280px] flex-col gap-5 px-4 py-6 md:px-6 md:py-9 lg:flex-row lg:items-start lg:gap-6"><AdminNavigation /><main className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wide text-primary-700">Workspace overview</p><h1 className="mt-1 text-2xl font-black text-slate-950">Purity operations</h1><p className="mt-1 text-sm font-medium text-slate-600">A live summary of bookings, customers and the catalog.</p></div><Link to="/admin/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-primary-700 px-4 py-2.5 text-xs font-black text-white hover:bg-primary-800">Open bookings <ArrowRight size={14} /></Link></div>
            {pageError && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800">{pageError}</div>}
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><SummaryCard label="Total bookings" value={adminStats.total} icon={<CalendarDays size={17} />} tone="slate" /><SummaryCard label="Pending approval" value={adminStats.pending} icon={<Clock3 size={17} />} tone="amber" /><SummaryCard label="Live services" value={catalogCount.services} icon={<BriefcaseBusiness size={17} />} tone="emerald" /><SummaryCard label="Customers" value={customerCount} icon={<UsersRound size={17} />} tone="blue" /></section>
            <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]"><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-4"><div><h2 className="font-bold">Recent bookings</h2><p className="mt-1 text-xs font-medium text-slate-500">The latest active records from Supabase.</p></div><Link to="/admin/dashboard" className="text-xs font-bold text-primary-700 hover:text-primary-900">View all</Link></div>{loading ? <div className="flex min-h-40 items-center justify-center"><RefreshCw size={18} className="animate-spin text-primary-600" /></div> : recentBookings.length === 0 ? <div className="p-8 text-center text-sm font-semibold text-slate-500">No bookings found.</div> : <div className="divide-y divide-slate-100">{recentBookings.map(booking => <div key={booking.id} className="flex items-center justify-between gap-3 px-4 py-3.5"><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{booking.customerName}</p><p className="mt-1 truncate text-xs text-slate-500">{booking.serviceName} · {formatDate(booking.createdAt)}</p></div><div className="shrink-0 text-right"><span className={`rounded-full px-2 py-1 text-[10px] font-black ${statusMeta[booking.status].className}`}>{statusMeta[booking.status].label}</span><p className="mt-1 text-xs font-bold text-slate-800">{booking.totalPrice} AED</p></div></div>)}</div>}</div>
                <div className="space-y-5"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold">Booking health</h2><div className="mt-4 space-y-3"><HealthRow label="Confirmed" value={adminStats.confirmed} icon={<CheckCircle2 size={15} />} className="text-blue-700" /><HealthRow label="Completed" value={adminStats.completed} icon={<CheckCircle2 size={15} />} className="text-emerald-700" /><HealthRow label="Cancelled" value={adminStats.cancelled} icon={<X size={15} />} className="text-red-700" /></div></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold">Catalog</h2><p className="mt-1 text-xs text-slate-500">Services and packages remain managed in the database.</p><div className="mt-4 grid grid-cols-2 gap-3"><Metric label="Services" value={catalogCount.services} /><Metric label="Packages" value={catalogCount.packages} /></div><Link to="/admin/catalog" className="mt-4 inline-flex text-xs font-bold text-primary-700 hover:text-primary-900">Manage catalog <ArrowRight size={13} className="ml-1" /></Link></section></div>
            </section>
        </main></div>
    </div>;
};

const SummaryCard: React.FC<{ label: string; value: number; icon: React.ReactNode; tone: 'slate' | 'amber' | 'emerald' | 'blue' }> = ({ label, value, icon, tone }) => <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><span className={`inline-flex rounded-xl p-2 ${tone === 'amber' ? 'bg-amber-50 text-amber-700' : tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' : tone === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-700'}`}>{icon}</span><p className="mt-3 text-[10px] font-bold uppercase text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-950">{value}</p></div>;
const HealthRow: React.FC<{ label: string; value: number; icon: React.ReactNode; className: string }> = ({ label, value, icon, className }) => <div className="flex items-center justify-between text-sm"><span className={`flex items-center gap-2 font-semibold ${className}`}>{icon}{label}</span><strong>{value}</strong></div>;
const Metric: React.FC<{ label: string; value: number }> = ({ label, value }) => <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase text-slate-500">{label}</p><p className="mt-1 text-xl font-black">{value}</p></div>;

export default AdminOverviewPage;
