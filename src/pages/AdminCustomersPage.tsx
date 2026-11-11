import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, LogOut, RefreshCw, Search, UsersRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminNavigation } from './AdminDashboardPage';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';

interface CustomerRow { user_id: string; email: string | null; phone_number: string; created_at: string; }
interface BookingRow { user_id: string | null; status: string; total_price: number | string; }
interface CustomerSummary extends CustomerRow { bookings: number; completed: number; totalSpend: number; }

export const AdminCustomersPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<CustomerSummary[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCustomers = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (!isSupabaseConfigured()) {
            setError('Supabase is not configured for this environment.');
            setLoading(false);
            return;
        }
        const [profilesResult, bookingsResult] = await Promise.all([
            supabase.from('customer_profiles').select('user_id, email, phone_number, created_at').order('created_at', { ascending: false }),
            supabase.from('bookings').select('user_id, status, total_price').is('deleted_at', null),
        ]);
        if (profilesResult.error || bookingsResult.error) {
            setError(profilesResult.error?.message || bookingsResult.error?.message || 'Could not load customers.');
            setCustomers([]);
            setLoading(false);
            return;
        }
        const bookingMap = new Map<string, { bookings: number; completed: number; totalSpend: number }>();
        ((bookingsResult.data || []) as BookingRow[]).forEach(booking => {
            if (!booking.user_id) return;
            const current = bookingMap.get(booking.user_id) || { bookings: 0, completed: 0, totalSpend: 0 };
            current.bookings += 1;
            if (booking.status === 'completed') current.completed += 1;
            current.totalSpend += Number(booking.total_price) || 0;
            bookingMap.set(booking.user_id, current);
        });
        setCustomers(((profilesResult.data || []) as CustomerRow[]).map(profile => ({ ...profile, ...(bookingMap.get(profile.user_id) || { bookings: 0, completed: 0, totalSpend: 0 }) })));
        setLoading(false);
    }, []);

    useEffect(() => { void loadCustomers(); }, [loadCustomers]);

    const visibleCustomers = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return customers;
        return customers.filter(customer => `${customer.email || ''} ${customer.phone_number} ${customer.user_id}`.toLowerCase().includes(query));
    }, [customers, search]);

    const handleLogout = async () => { await logout(); navigate('/admin'); };

    return <div className="min-h-screen bg-slate-50 pb-16 text-slate-950" dir="ltr">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl"><div className="mx-auto flex min-h-16 max-w-[1280px] items-center justify-between gap-4 px-4 py-3 md:px-6"><div className="flex items-center gap-3"><img src="/logo.png" alt="Purity logo" className="h-10 w-10 rounded-xl object-contain" /><div><p className="text-sm font-bold">Purity Admin</p><p className="text-[11px] font-medium text-slate-500">Customer directory</p></div></div><div className="flex items-center gap-2"><span className="hidden max-w-48 truncate text-xs font-semibold text-slate-600 sm:block">{user?.email}</span><Button variant="ghost" onClick={() => void handleLogout()} className="h-9 px-3 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700"><LogOut className="mr-1.5 h-4 w-4" /> Logout</Button></div></div></header>
        <div className="mx-auto flex max-w-[1280px] flex-col gap-5 px-4 py-6 md:px-6 md:py-9 lg:flex-row lg:items-start lg:gap-6"><AdminNavigation /><main className="min-w-0 flex-1"><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><Link to="/admin/overview" className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 hover:text-primary-900"><ArrowLeft size={14} /> Overview</Link><p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-primary-700"><UsersRound size={14} /> Customer management</p><h1 className="mt-1 text-2xl font-black">Customers</h1><p className="mt-1 text-sm font-medium text-slate-600">Customer profiles and booking activity from the same Supabase database.</p></div><button type="button" onClick={() => void loadCustomers()} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh</button></div>
            {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">{error}</div>}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between"><div><h2 className="font-bold">Registered customers <span className="ml-1 text-xs text-slate-500">{visibleCustomers.length}</span></h2><p className="mt-1 text-xs font-medium text-slate-500">Customer accounts are retained; this screen has no hard-delete action.</p></div><div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search email, phone or ID" className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs font-medium outline-none focus:border-primary-500 md:w-64" /></div></div>{loading ? <div className="flex min-h-48 items-center justify-center"><RefreshCw size={18} className="animate-spin text-primary-600" /></div> : visibleCustomers.length === 0 ? <div className="p-10 text-center"><UsersRound size={28} className="mx-auto text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-700">No customers found</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500"><tr><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">Bookings</th><th className="px-5 py-3">Completed</th><th className="px-5 py-3">Total spend</th><th className="px-5 py-3">Joined</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleCustomers.map(customer => <tr key={customer.user_id} className="hover:bg-slate-50"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{customer.email || 'Email unavailable'}</p><p className="mt-1 font-mono text-[10px] text-slate-500">{customer.user_id.slice(0, 12)}…</p></td><td className="px-5 py-4 text-xs font-semibold text-slate-700" dir="ltr">{customer.phone_number}</td><td className="px-5 py-4 font-bold">{customer.bookings}</td><td className="px-5 py-4 font-bold text-emerald-700">{customer.completed}</td><td className="px-5 py-4 font-bold">{customer.totalSpend.toFixed(2)} AED</td><td className="whitespace-nowrap px-5 py-4 text-xs font-medium text-slate-600">{new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(customer.created_at))}</td></tr>)}</tbody></table></div>}</section>
        </main></div>
    </div>;
};

export default AdminCustomersPage;
