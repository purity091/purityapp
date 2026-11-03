import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ClipboardList, LogOut, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { type AdminAuditLog, useBookings } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

const formatDateTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const statusLabel = (status?: string | null) => status ? status.charAt(0).toUpperCase() + status.slice(1) : '—';

const actionMeta: Record<AdminAuditLog['action'], { label: string; className: string }> = {
    status_changed: { label: 'Status changed', className: 'bg-blue-50 text-blue-800 ring-blue-200' },
    deleted: { label: 'Booking deleted', className: 'bg-red-50 text-red-800 ring-red-200' },
};

export const AdminAuditLogPage: React.FC = () => {
    const { fetchAdminAuditLogs } = useBookings();
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [logs, setLogs] = useState<AdminAuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadLogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        const result = await fetchAdminAuditLogs();
        setLogs(result.data);
        setError(result.error || null);
        setLoading(false);
    }, [fetchAdminAuditLogs]);

    useEffect(() => {
        void loadLogs();
    }, [loadLogs]);

    const handleLogout = useCallback(async () => {
        await logout();
        navigate('/admin');
    }, [logout, navigate]);

    return (
        <div className="min-h-screen bg-slate-50 pb-12 text-slate-950" dir="ltr">
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
                <div className="mx-auto flex min-h-16 max-w-[1280px] items-center justify-between gap-4 px-4 py-3 md:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <img src="/logo.png" alt="Purity logo" width={40} height={40} className="h-10 w-10 shrink-0 rounded-xl object-contain shadow-sm" />
                        <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-950">Purity Admin</p><p className="truncate text-[11px] font-medium text-slate-600">Audit log</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="hidden max-w-48 truncate text-xs font-semibold text-slate-600 sm:block">{user?.email || 'Administrator'}</span>
                        <Button variant="ghost" onClick={handleLogout} className="h-9 px-3 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700"><LogOut className="mr-1.5 h-4 w-4" /> Logout</Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1080px] px-4 py-6 md:px-6 md:py-9">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <Link to="/admin/dashboard" className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 hover:text-primary-900"><ArrowLeft size={14} /> Back to bookings</Link>
                        <p className="flex items-center gap-2 text-xs font-bold uppercase text-primary-700"><ShieldCheck size={14} /> Accountability</p>
                        <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">Admin audit log</h1>
                        <p className="mt-1 text-sm text-slate-600">A server-side record of booking status changes and deletions.</p>
                    </div>
                    <button type="button" onClick={() => void loadLogs()} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm hover:border-primary-300 hover:bg-primary-50 disabled:cursor-wait disabled:opacity-60"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh</button>
                </div>

                {error && <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800" role="alert"><span>{error}</span><button type="button" onClick={() => void loadLogs()} className="rounded-lg bg-white px-3 py-2 text-xs font-bold ring-1 ring-red-200 hover:bg-red-100">Retry</button></div>}

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 md:px-5"><div><h2 className="flex items-center gap-2 text-base font-bold text-slate-950"><ClipboardList size={17} className="text-primary-700" /> Recent actions</h2><p className="mt-1 text-xs font-medium text-slate-600">The latest 100 recorded admin actions.</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{logs.length}</span></div>
                    {loading ? <div className="flex min-h-48 items-center justify-center gap-2 text-sm font-semibold text-slate-600"><RefreshCw size={18} className="animate-spin text-primary-600" /> Loading audit log...</div> : logs.length === 0 ? <div className="flex min-h-48 flex-col items-center justify-center px-5 text-center"><ClipboardList size={28} className="text-slate-400" /><p className="mt-3 text-sm font-bold text-slate-800">No audit entries yet</p><p className="mt-1 text-xs text-slate-600">Admin booking actions will appear here after the database migration is applied.</p></div> : <>
                        <div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500"><tr><th className="px-5 py-3">Action</th><th className="px-5 py-3">Booking</th><th className="px-5 py-3">Status change</th><th className="px-5 py-3">Admin</th><th className="px-5 py-3">Date</th></tr></thead><tbody className="divide-y divide-slate-100">{logs.map(log => <tr key={log.id} className="hover:bg-slate-50"><td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${actionMeta[log.action].className}`}>{log.action === 'deleted' ? <Trash2 size={12} /> : <ShieldCheck size={12} />}{actionMeta[log.action].label}</span></td><td className="px-5 py-4"><p className="font-semibold text-slate-900">{log.customerName || 'Unknown customer'}</p><p className="mt-1 text-xs text-slate-600">{log.serviceName || 'Booking'}{log.bookingId ? ` · #${log.bookingId.slice(0, 8)}` : ''}</p></td><td className="px-5 py-4 text-xs font-semibold text-slate-700">{statusLabel(log.fromStatus)}{log.toStatus ? ` → ${statusLabel(log.toStatus)}` : ''}</td><td className="px-5 py-4 text-xs text-slate-600">{log.adminUserId ? `${log.adminUserId.slice(0, 8)}…` : 'Current admin'}</td><td className="whitespace-nowrap px-5 py-4 text-xs font-medium text-slate-600">{formatDateTime(log.createdAt)}</td></tr>)}</tbody></table></div>
                        <div className="divide-y divide-slate-100 md:hidden">{logs.map(log => <article key={log.id} className="p-4"><div className="flex items-start justify-between gap-3"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${actionMeta[log.action].className}`}>{actionMeta[log.action].label}</span><time className="text-[10px] font-semibold text-slate-500">{formatDateTime(log.createdAt)}</time></div><p className="mt-3 text-sm font-bold text-slate-900">{log.customerName || 'Unknown customer'}</p><p className="mt-1 text-xs text-slate-600">{log.serviceName || 'Booking'}{log.bookingId ? ` · #${log.bookingId.slice(0, 8)}` : ''}</p><p className="mt-2 text-xs font-semibold text-slate-700">{statusLabel(log.fromStatus)}{log.toStatus ? ` → ${statusLabel(log.toStatus)}` : ''}</p></article>)}</div>
                    </>}
                </section>
            </main>
        </div>
    );
};

export default AdminAuditLogPage;
