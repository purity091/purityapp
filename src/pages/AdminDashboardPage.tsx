import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    type SortingState,
    useReactTable,
    type VisibilityState,
} from '@tanstack/react-table';
import { type AdminBookingSort, useBookings } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { Booking, BookingStatus } from '../types';
import { Button } from '../components/ui/Button';
import {
    AlertCircle,
    ArrowDown,
    ArrowDownUp,
    ArrowUp,
    Bell,
    BriefcaseBusiness,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Clock3,
    Columns3,
    Eye,
    Filter,
    LayoutDashboard,
    LogOut,
    MapPin,
    MessageCircle,
    Phone,
    RefreshCw,
    Search,
    Settings2,
    Tag,
    Trash2,
    UserRound,
    UsersRound,
    X,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const statusMeta: Record<BookingStatus, { label: string; badge: string; dot: string }> = {
    pending: { label: 'Pending approval', badge: 'border-amber-200 bg-amber-50 text-amber-800', dot: 'bg-amber-500' },
    confirmed: { label: 'Confirmed', badge: 'border-blue-200 bg-blue-50 text-blue-800', dot: 'bg-blue-500' },
    completed: { label: 'Completed', badge: 'border-emerald-200 bg-emerald-50 text-emerald-800', dot: 'bg-emerald-500' },
    cancelled: { label: 'Cancelled', badge: 'border-red-200 bg-red-50 text-red-800', dot: 'bg-red-500' },
};

const statusTabs: Array<{ value: BookingStatus | 'all'; label: string }> = [
    { value: 'pending', label: 'Approval queue' },
    { value: 'all', label: 'All bookings' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const adminSortByColumn: Record<string, AdminBookingSort> = {
    customerService: 'customer_name',
    appointment: 'date',
    location: 'neighborhood',
    amount: 'total_price',
    status: 'status',
};

const adminTabs = [
    { label: 'Bookings', icon: CalendarDays, to: '/admin/dashboard', soon: false },
    { label: 'Audit log', icon: ClipboardList, to: '/admin/audit-log', soon: false },
    { label: 'Overview', icon: LayoutDashboard, to: null, soon: true },
    { label: 'Services & packages', icon: BriefcaseBusiness, to: null, soon: true },
    { label: 'Offers & deals', icon: Tag, to: null, soon: true },
    { label: 'Announcements', icon: Bell, to: null, soon: true },
    { label: 'Customers', icon: UsersRound, to: null, soon: true },
    { label: 'Settings', icon: Settings2, to: null, soon: true },
] as const;

const formatDateTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const formatPhoneForWhatsApp = (value: string) => {
    const rawPhone = value.trim().replace(/[^\d+]/g, '');
    let phone = rawPhone.startsWith('+') ? rawPhone.slice(1) : rawPhone;
    if (phone.startsWith('00')) phone = phone.slice(2);
    else if (phone.startsWith('0')) phone = `971${phone.slice(1)}`;
    else if (!phone.startsWith('971')) phone = `971${phone}`;
    return phone;
};

export const AdminDashboardPage: React.FC = () => {
    const {
        bookings,
        loading,
        updateBookingStatus,
        deleteBooking,
        adminPage,
        adminPageSize,
        adminTotal,
        adminStats,
        adminError,
        setAdminPage,
        setAdminFilters,
        refreshBookings,
    } = useBookings();
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [actionState, setActionState] = useState<{ id: string; status: BookingStatus } | null>(null);
    const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [sorting, setSorting] = useState<SortingState>([{ id: 'appointment', desc: true }]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => setAdminFilters({ status: filterStatus, search: searchTerm.trim().length >= 2 ? searchTerm.trim() : '' }), 350);
        return () => window.clearTimeout(timer);
    }, [filterStatus, searchTerm, setAdminFilters]);

    const handleSortingChange = useCallback((updater: SortingState | ((current: SortingState) => SortingState)) => {
        const nextSorting = typeof updater === 'function' ? updater(sorting) : updater;
        const activeSort = nextSorting[0];
        setSorting(nextSorting);
        setAdminFilters({
            sortBy: activeSort ? adminSortByColumn[activeSort.id] || 'created_at' : 'created_at',
            sortDirection: activeSort?.desc ? 'desc' : 'asc',
        });
    }, [setAdminFilters, sorting]);

    useEffect(() => {
        if (!feedback) return;
        const timer = window.setTimeout(() => setFeedback(null), 4500);
        return () => window.clearTimeout(timer);
    }, [feedback]);

    useEffect(() => {
        if (!selectedBookingId) return;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setSelectedBookingId(null);
        };
        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [selectedBookingId]);

    const handleLogout = useCallback(async () => {
        await logout();
        navigate('/admin');
    }, [logout, navigate]);

    const changeStatus = useCallback(async (booking: Booking, status: BookingStatus) => {
        setFeedback(null);
        setActionState({ id: booking.id, status });
        try {
            const result = await updateBookingStatus(booking.id, status);
            if (!result.success) {
                setFeedback({ type: 'error', message: result.error || 'Could not update this booking.' });
                return;
            }
            const message = status === 'confirmed'
                ? 'Booking approved successfully.'
                : status === 'cancelled'
                    ? 'Booking declined.'
                    : 'Booking marked as completed.';
            setFeedback({ type: 'success', message });
        } catch {
            setFeedback({ type: 'error', message: 'Could not update this booking. Please try again.' });
        } finally {
            setActionState(null);
        }
    }, [updateBookingStatus]);

    const handleDelete = useCallback(async (booking: Booking) => {
        if (!window.confirm('Archive this booking? The record and customer information will be retained and hidden from active lists.')) return;
        setFeedback(null);
        setDeletingBookingId(booking.id);
        try {
            const result = await deleteBooking(booking.id);
            if (!result.success) {
                setFeedback({ type: 'error', message: result.error || 'Could not archive this booking.' });
                return;
            }
            if (selectedBookingId === booking.id) setSelectedBookingId(null);
            setFeedback({ type: 'success', message: 'Booking archived successfully. The record was retained.' });
        } catch {
            setFeedback({ type: 'error', message: 'Could not archive this booking. Please try again.' });
        } finally {
            setDeletingBookingId(null);
        }
    }, [deleteBooking, selectedBookingId]);

    const generateWhatsAppLink = useCallback((booking: Booking) => {
        const messageLines = [
            `Hello ${booking.customerName},`,
            `Regarding your booking #${booking.id.slice(0, 6)}`,
            `Service: ${booking.serviceName}`,
            `Neighborhood: ${booking.neighborhood || 'N/A'}`,
            `Service Address: ${booking.address || 'N/A'}`,
            `Date & Time: ${booking.date} - ${booking.time}`,
            `Total Price: ${booking.totalPrice} AED`,
        ];
        if (booking.notes) messageLines.push(`Notes: ${booking.notes}`);
        messageLines.push('We would like to confirm your booking.');
        return `https://wa.me/${formatPhoneForWhatsApp(booking.phoneNumber)}?text=${encodeURIComponent(messageLines.join('\n'))}`;
    }, []);

    const generateMapLink = useCallback((booking: Booking) => booking.latitude !== null && booking.latitude !== undefined && booking.longitude !== null && booking.longitude !== undefined
        ? `https://www.google.com/maps/search/?api=1&query=${booking.latitude},${booking.longitude}`
        : null, []);

    const pageCount = Math.max(1, Math.ceil(adminTotal / adminPageSize));
    const firstVisible = adminTotal === 0 ? 0 : (adminPage - 1) * adminPageSize + 1;
    const lastVisible = Math.min(adminPage * adminPageSize, adminTotal);
    const selectedBooking = selectedBookingId ? bookings.find(booking => booking.id === selectedBookingId) || null : null;

    useEffect(() => {
        if (adminPage > pageCount) setAdminPage(pageCount);
    }, [adminPage, pageCount, setAdminPage]);

    const renderActions = useCallback((booking: Booking, compact = false) => {
        const isBusy = actionState?.id === booking.id;
        return (
            <div className={`flex items-center gap-2 ${compact ? 'flex-wrap' : ''}`}>
                <button type="button" onClick={() => setSelectedBookingId(booking.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-primary-300 hover:bg-primary-50" title="Review booking details">
                    <Eye size={14} /> {!compact && 'Review'}
                </button>
                {generateMapLink(booking) && <a href={generateMapLink(booking) || '#'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-100" title="Open customer location in Google Maps">
                    <MapPin size={14} /> {!compact && 'Map'}
                </a>}
                <a href={generateWhatsAppLink(booking)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-100" title="Contact customer on WhatsApp">
                    <MessageCircle size={14} /> {!compact && 'WhatsApp'}
                </a>
                {booking.status === 'pending' && <>
                    <button type="button" disabled={isBusy} onClick={() => changeStatus(booking, 'confirmed')} className="inline-flex items-center gap-1.5 rounded-lg bg-primary-700 px-3 py-2 text-xs font-black text-white shadow-sm transition hover:bg-primary-800 disabled:cursor-wait disabled:opacity-60" title="Approve booking">
                        {isBusy && actionState?.status === 'confirmed' ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />} Approve
                    </button>
                    <button type="button" disabled={isBusy} onClick={() => changeStatus(booking, 'cancelled')} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-2.5 py-2 text-xs font-black text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60" title="Decline booking">
                        {isBusy && actionState?.status === 'cancelled' ? <RefreshCw size={14} className="animate-spin" /> : <X size={14} />} Decline
                    </button>
                </>}
                {booking.status === 'confirmed' && <button type="button" disabled={isBusy} onClick={() => changeStatus(booking, 'completed')} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60" title="Mark booking as completed">
                    {isBusy ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Complete
                </button>}
                <button type="button" disabled={deletingBookingId === booking.id} onClick={() => handleDelete(booking)} className="inline-flex items-center justify-center rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-50" title="Archive booking" aria-label="Archive booking">
                     {deletingBookingId === booking.id ? <RefreshCw size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
            </div>
        );
    }, [actionState, deletingBookingId, changeStatus, generateMapLink, generateWhatsAppLink, handleDelete]);

    const columns = useMemo<ColumnDef<Booking>[]>(() => [
        {
            id: 'customerService',
            header: 'Customer & service',
            accessorFn: booking => `${booking.customerName} ${booking.serviceName}`,
            cell: ({ row }) => {
                const booking = row.original;
                return <button type="button" onClick={() => setSelectedBookingId(booking.id)} className="max-w-[220px] text-left"><p className="truncate font-semibold text-slate-950 hover:text-primary-700">{booking.customerName}</p><p className="mt-1 truncate text-xs text-slate-600" dir="ltr">{booking.phoneNumber}</p><p className="mt-2 truncate text-xs font-semibold text-slate-800">{booking.serviceName}</p><p className="mt-1 font-mono text-[10px] font-medium text-slate-500">#{booking.id.slice(0, 8)}</p></button>;
            },
        },
        {
            id: 'appointment',
            header: 'Appointment',
            accessorFn: booking => `${booking.date} ${booking.time}`,
            cell: ({ row }) => <div><p className="flex items-center gap-1.5 font-semibold text-slate-800"><CalendarDays size={14} className="text-slate-500" />{row.original.date}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600"><Clock3 size={13} />{row.original.time}</p></div>,
        },
        {
            id: 'location',
            header: 'Location',
            accessorFn: booking => booking.neighborhood,
            cell: ({ row }) => <div className="max-w-[190px]"><p className="flex items-start gap-1.5 text-xs font-semibold text-slate-800"><MapPin size={14} className="mt-0.5 shrink-0 text-slate-500" /><span className="truncate">{row.original.neighborhood}</span></p><p className="mt-1 truncate pl-5 text-[11px] text-slate-600">{row.original.address || 'Map location selected'}</p></div>,
        },
        {
            id: 'amount',
            header: 'Amount',
            accessorKey: 'totalPrice',
            cell: ({ row }) => <div><p className="font-bold text-slate-950">{row.original.totalPrice} <span className="text-[10px] font-semibold text-slate-600">AED</span></p><p className="mt-1 text-[10px] text-slate-600">{row.original.hours ? `${row.original.hours} hour${row.original.hours === 1 ? '' : 's'}` : 'Service request'}</p></div>,
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
            id: 'actions',
            header: 'Decision',
            enableSorting: false,
            enableHiding: false,
            cell: ({ row }) => <div className="flex justify-end">{renderActions(row.original)}</div>,
        },
    ], [renderActions]);

    // TanStack Table manages a mutable instance internally; this is intentional for its state model.
    const table = useReactTable({
        data: bookings,
        columns,
        state: { sorting, columnVisibility },
        onSortingChange: handleSortingChange,
        onColumnVisibilityChange: setColumnVisibility,
        getRowId: row => row.id,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
    });

    return (
        <div className="min-h-screen bg-slate-50 pb-16 text-slate-950" dir="ltr">
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
                <div className="mx-auto flex min-h-16 max-w-[1280px] items-center justify-between gap-4 px-4 py-3 md:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <img src="/logo.png" alt="Purity logo" width={40} height={40} className="h-10 w-10 shrink-0 rounded-xl object-contain shadow-sm" />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-950">Purity Admin</p>
                            <p className="truncate text-[11px] font-medium text-slate-600">Booking operations</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden text-right sm:block">
                            <p className="text-[10px] font-semibold uppercase text-slate-600">Signed in as</p>
                            <p className="max-w-44 truncate text-xs font-bold text-slate-700">{user?.email || 'Administrator'}</p>
                        </div>
                        <button type="button" onClick={() => void refreshBookings()} disabled={loading} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-primary-300 hover:bg-primary-50 disabled:cursor-wait disabled:opacity-60" title="Refresh bookings"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> <span className="hidden sm:inline">Refresh</span></button>
                        <Button variant="ghost" onClick={handleLogout} className="h-9 px-3 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700"><LogOut className="mr-1.5 h-4 w-4" /> Logout</Button>
                    </div>
                </div>
            </header>

            <div className="mx-auto flex max-w-[1280px] flex-col gap-5 px-4 py-6 md:px-6 md:py-9 lg:flex-row lg:items-start lg:gap-6">
                <AdminNavigation />
                <main className="min-w-0 flex-1">
                <section className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm md:px-5">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-950 md:text-2xl">Booking approvals</h1>
                            <p className="mt-1 text-xs font-medium text-slate-600">Review and manage customer bookings.</p>
                        </div>
                        <div className="shrink-0 text-right">
                            <p className="text-[10px] font-bold uppercase text-amber-700">Pending</p>
                            <p className="mt-0.5 text-xl font-bold text-amber-950">{adminStats.pending}</p>
                        </div>
                    </div>
                </section>

                <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
                    <StatCard label="Total" value={adminStats.total} tone="slate" icon={<CalendarDays size={17} />} />
                    <StatCard label="Pending" value={adminStats.pending} tone="amber" icon={<Clock3 size={17} />} />
                    <StatCard label="Confirmed" value={adminStats.confirmed} tone="blue" icon={<Check size={17} />} />
                    <StatCard label="Completed" value={adminStats.completed} tone="emerald" icon={<CheckCircle2 size={17} />} />
                    <StatCard label="Cancelled" value={adminStats.cancelled} tone="red" icon={<X size={17} />} />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:p-5">
                    <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-slate-100/80 p-1">
                        {statusTabs.map(tab => {
                            const count = tab.value === 'all' ? adminStats.total : adminStats[tab.value];
                            const active = filterStatus === tab.value;
                            return <button key={tab.value} type="button" onClick={() => setFilterStatus(tab.value)} className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${active ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-white/70 hover:text-slate-950'}`}><span>{tab.label}</span><span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${active ? 'bg-primary-50 text-primary-800' : 'bg-slate-200/70 text-slate-600'}`}>{count}</span></button>;
                        })}
                    </div>

                    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-950">{filterStatus === 'pending' ? 'Pending approvals' : 'Booking list'}</h2>
                            <p className="mt-1 text-xs font-medium text-slate-600">Select a booking to inspect all details before changing its status.</p>
                        </div>
                        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input type="search" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Search name, phone or booking ID" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100" />
                            </div>
                            <div className="relative shrink-0">
                                <button type="button" onClick={() => setIsColumnsMenuOpen(value => !value)} aria-expanded={isColumnsMenuOpen} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-primary-300 hover:bg-primary-50 sm:w-auto"><Columns3 size={15} /> Columns</button>
                                {isColumnsMenuOpen && <div className="absolute right-0 top-11 z-20 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                                    <p className="px-2 py-1 text-[10px] font-bold uppercase text-slate-600">Show columns</p>
                                    {table.getAllLeafColumns().filter(column => column.getCanHide()).map(column => <label key={column.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><input type="checkbox" checked={column.getIsVisible()} onChange={column.getToggleVisibilityHandler()} className="h-4 w-4 accent-primary-700" /><span>{String(column.columnDef.header)}</span></label>)}
                                </div>}
                            </div>
                        </div>
                    </div>

                    {feedback && <div className={`mb-4 flex items-start gap-2 rounded-lg border p-3 text-xs font-semibold ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`} role="status"><span className="mt-0.5">{feedback.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}</span><span>{feedback.message}</span></div>}
                    {adminError && <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800" role="alert"><span className="flex items-center gap-2"><AlertCircle size={15} />{adminError}</span><button type="button" onClick={() => void refreshBookings()} className="rounded-lg bg-white px-3 py-2 font-bold text-red-800 shadow-sm ring-1 ring-red-200 hover:bg-red-100">Retry</button></div>}

                    {loading && bookings.length === 0 ? <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl bg-slate-50 text-sm font-semibold text-slate-600"><RefreshCw size={22} className="animate-spin text-primary-600" />Loading bookings...</div> : bookings.length === 0 ? <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl bg-slate-50 px-5 text-center"><Filter size={26} className="text-slate-500" /><p className="mt-3 text-sm font-bold text-slate-800">No bookings match this view</p><p className="mt-1 text-xs font-medium text-slate-600">Try another status or clear the search.</p></div> : <>
                        <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
                            <table className="w-full min-w-[950px] text-left text-sm">
                                <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500">
                                    {table.getHeaderGroups().map(headerGroup => <tr key={headerGroup.id}>{headerGroup.headers.map(header => {
                                        const sorted = header.column.getIsSorted();
                                        const canSort = header.column.getCanSort();
                                        return <th key={header.id} scope="col" className={`px-4 py-3 ${header.column.id === 'actions' ? 'text-right' : ''}`} aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'}><button type="button" onClick={canSort ? header.column.getToggleSortingHandler() : undefined} disabled={!canSort} className={`inline-flex items-center gap-1.5 text-left ${canSort ? 'cursor-pointer hover:text-slate-950' : 'cursor-default'}`}>{flexRender(header.column.columnDef.header, header.getContext())}{canSort && (sorted === 'asc' ? <ArrowUp size={13} /> : sorted === 'desc' ? <ArrowDown size={13} /> : <ArrowDownUp size={13} className="text-slate-400" />)}</button></th>;
                                    })}</tr>)}
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {table.getRowModel().rows.map(row => <tr key={row.id} className={`transition hover:bg-slate-50 ${row.original.status === 'pending' ? 'bg-amber-50/20' : ''}`}>
                                        {row.getVisibleCells().map(cell => <td key={cell.id} className={`px-4 py-4 ${cell.column.id === 'actions' ? 'text-right' : ''}`}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
                                    </tr>)}
                                </tbody>
                            </table>
                        </div>
                        <div className="space-y-3 md:hidden">{bookings.map(booking => <article key={booking.id} className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${booking.status === 'pending' ? 'ring-1 ring-amber-200' : ''}`}><div className="flex items-start justify-between gap-3"><button type="button" onClick={() => setSelectedBookingId(booking.id)} className="min-w-0 text-left"><p className="text-xs font-semibold uppercase text-slate-600">{booking.customerName}</p><h3 className="mt-1 truncate font-bold text-slate-950">{booking.serviceName}</h3><p className="mt-1 font-mono text-[10px] font-medium text-slate-500">#{booking.id.slice(0, 8)}</p></button><StatusBadge status={booking.status} /></div><div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs font-medium text-slate-700"><span className="flex items-center gap-1.5"><Phone size={13} className="text-slate-500" />{booking.phoneNumber}</span><span className="flex items-center gap-1.5"><CalendarDays size={13} className="text-slate-500" />{booking.date}</span><span className="flex items-center gap-1.5"><Clock3 size={13} className="text-slate-500" />{booking.time}</span><span className="flex items-center gap-1.5"><MapPin size={13} className="text-slate-500" />{booking.neighborhood}</span></div><div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3"><strong className="text-sm font-bold text-slate-950">{booking.totalPrice} <span className="text-[10px] font-semibold text-slate-600">AED</span></strong><div className="flex flex-wrap justify-end">{renderActions(booking, true)}</div></div></article>)}</div>
                    </>}

                    <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs font-medium text-slate-600 sm:flex-row"><span>Showing {firstVisible}-{lastVisible} of {adminTotal} bookings</span><div className="flex items-center gap-2"><button type="button" onClick={() => setAdminPage(Math.max(1, adminPage - 1))} disabled={adminPage <= 1 || loading} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-700 transition hover:border-primary-300 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={14} /> Previous</button><span className="min-w-24 text-center font-semibold text-slate-800">Page {adminPage} of {pageCount}</span><button type="button" onClick={() => setAdminPage(Math.min(pageCount, adminPage + 1))} disabled={adminPage >= pageCount || loading} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-700 transition hover:border-primary-300 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40">Next <ChevronRight size={14} /></button></div></div>
                </section>
                </main>
            </div>

            {selectedBooking && <div className="fixed inset-0 z-[70] flex items-end justify-center bg-gray-950/40 p-0 backdrop-blur-[2px] md:items-center md:p-6" onMouseDown={event => { if (event.target === event.currentTarget) setSelectedBookingId(null); }}><aside role="dialog" aria-modal="true" aria-labelledby="booking-details-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl md:rounded-3xl"><div className="sticky top-0 flex items-start justify-between border-b border-gray-100 bg-white/95 px-5 py-4 backdrop-blur md:px-7"><div><p className="text-[10px] font-black uppercase text-primary-600">Booking details</p><h2 id="booking-details-title" className="mt-1 text-xl font-black text-teal-950">{selectedBooking.serviceName}</h2><p className="mt-1 font-mono text-[10px] font-bold text-gray-400">#{selectedBooking.id}</p></div><button type="button" onClick={() => setSelectedBookingId(null)} className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900" aria-label="Close details"><X size={19} /></button></div><div className="space-y-5 p-5 md:p-7"><div className="flex items-center justify-between gap-3"><StatusBadge status={selectedBooking.status} /><span className="text-lg font-black text-primary-700">{selectedBooking.totalPrice} AED</span></div><div className="grid gap-3 sm:grid-cols-2"><Detail label="Customer" value={selectedBooking.customerName} icon={<UserRound size={15} />} /><Detail label="Phone" value={selectedBooking.phoneNumber} icon={<Phone size={15} />} dir="ltr" /><Detail label="Date" value={selectedBooking.date} icon={<CalendarDays size={15} />} /><Detail label="Time" value={selectedBooking.time} icon={<Clock3 size={15} />} /><Detail label="Neighborhood" value={selectedBooking.neighborhood} icon={<MapPin size={15} />} /><Detail label="Submitted" value={formatDateTime(selectedBooking.createdAt)} icon={<Clock3 size={15} />} /></div><div className="rounded-2xl border border-gray-100 bg-gray-50 p-4"><h3 className="text-xs font-black uppercase text-gray-500">Service requirements</h3><div className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-700"><Info label="Hours" value={selectedBooking.hours} /><Info label="Workers" value={selectedBooking.numberOfWorkers || 1} /><Info label="Rooms" value={selectedBooking.numberOfRooms} /><Info label="Carpets" value={selectedBooking.numberOfCarpets} /><Info label="Sofa seats" value={selectedBooking.numberOfSofaSeats} /><Info label="Curtains" value={selectedBooking.numberOfCurtains} /><Info label="Materials" value={selectedBooking.includeChemicals ? 'Included' : 'Not included'} /></div></div>{selectedBooking.notes && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><h3 className="text-xs font-black uppercase text-amber-800">Customer notes</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-amber-950">{selectedBooking.notes}</p></div>}<div className="flex flex-wrap gap-2 border-t border-gray-100 pt-5"><a href={generateWhatsAppLink(selectedBooking)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-black text-emerald-700 hover:bg-emerald-100"><MessageCircle size={16} /> Contact customer</a>{selectedBooking.status === 'pending' && <><button type="button" disabled={Boolean(actionState)} onClick={() => changeStatus(selectedBooking, 'confirmed')} className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-4 py-3 text-xs font-black text-white hover:bg-primary-800 disabled:opacity-60"><Check size={16} /> Approve booking</button><button type="button" disabled={Boolean(actionState)} onClick={() => changeStatus(selectedBooking, 'cancelled')} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-xs font-black text-red-700 hover:bg-red-50 disabled:opacity-60"><X size={16} /> Decline</button></>}{selectedBooking.status === 'confirmed' && <button type="button" disabled={Boolean(actionState)} onClick={() => changeStatus(selectedBooking, 'completed')} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-60"><CheckCircle2 size={16} /> Mark completed</button>}</div></div></aside></div>}
        </div>
    );
};

const AdminNavigation: React.FC = () => {
    const location = useLocation();

    return <>
        <aside className="hidden w-56 shrink-0 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:block" aria-label="Admin controls">
            <div className="px-3 pb-3 pt-2">
                <p className="text-[10px] font-bold uppercase text-slate-600">Workspace</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">Manage Purity</p>
            </div>
            <nav className="space-y-1 border-t border-slate-100 pt-2">
                {adminTabs.map(({ label, icon: Icon, to, soon }) => {
                    const active = to ? location.pathname === to : false;
                    const content = <><Icon size={16} className={active ? 'text-primary-700' : 'text-slate-500'} /><span className="min-w-0 flex-1 truncate">{label}</span>{soon && <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">Soon</span>}</>;
                    return to ? <Link key={label} to={to} aria-current={active ? 'page' : undefined} className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition ${active ? 'bg-primary-50 text-primary-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}>{content}</Link> : <button key={label} type="button" disabled aria-disabled="true" className="flex w-full cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-slate-600">{content}</button>;
                })}
            </nav>
        </aside>

        <nav className="flex w-full gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm lg:hidden" aria-label="Admin controls">
            {adminTabs.map(({ label, icon: Icon, to, soon }) => {
                const active = to ? location.pathname === to : false;
                const content = <><Icon size={15} /><span>{label}</span>{soon && <span className="rounded-md bg-slate-100 px-1 py-0.5 text-[9px] font-bold text-slate-600">Soon</span>}</>;
                return to ? <Link key={label} to={to} aria-current={active ? 'page' : undefined} className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${active ? 'bg-primary-50 text-primary-800' : 'text-slate-600 hover:bg-slate-50'}`}>{content}</Link> : <button key={label} type="button" disabled aria-disabled="true" className="inline-flex shrink-0 cursor-not-allowed items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600">{content}</button>;
            })}
        </nav>
    </>
};

const StatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-black ${statusMeta[status].badge}`}><span className={`h-1.5 w-1.5 rounded-full ${statusMeta[status].dot}`} />{statusMeta[status].label}</span>;

const StatCard: React.FC<{ label: string; value: number; tone: 'slate' | 'amber' | 'blue' | 'emerald' | 'red'; icon: React.ReactNode }> = ({ label, value, tone, icon }) => {
    const tones = { slate: 'text-slate-700 bg-slate-50', amber: 'text-amber-700 bg-amber-50', blue: 'text-blue-700 bg-blue-50', emerald: 'text-emerald-700 bg-emerald-50', red: 'text-red-700 bg-red-50' };
    return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><span className={`inline-flex rounded-xl p-2 ${tones[tone]}`}>{icon}</span><p className="mt-3 text-[10px] font-bold uppercase text-slate-600">{label}</p><p className="mt-1 text-2xl font-bold text-slate-950">{value}</p></div>;
};

const Detail: React.FC<{ label: string; value: string; icon: React.ReactNode; dir?: 'ltr' | 'rtl' }> = ({ label, value, icon, dir }) => <div className="rounded-xl border border-slate-200 bg-white p-3"><span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-600">{icon}{label}</span><p className="mt-1.5 truncate text-sm font-semibold text-slate-900" dir={dir}>{value}</p></div>;
const Info: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => value === undefined || value === null || value === '' ? null : <span><span className="block text-[10px] font-bold text-slate-600">{label}</span><strong className="mt-0.5 block text-sm font-bold text-slate-900">{value}</strong></span>;
