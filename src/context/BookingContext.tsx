import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Booking, BookingStatus } from '../types';
import { supabase, isRealtimeEnabled, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface BookingFormData {
    customerName: string;
    phoneNumber: string;
    neighborhood: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    hours: number;
    date: string;
    time: string;
    numberOfWorkers: number;
    numberOfRooms: number;
    numberOfCarpets: number;
    numberOfSingleMattresses: number;
    numberOfLargeMattresses: number;
    numberOfSofaSeats: number;
    numberOfCurtains: number;
    includeChemicals: boolean;
    notes: string;
}

export type CreateBookingData = Omit<Booking, 'id' | 'status' | 'createdAt'>;

export interface CustomerNotification {
    id: string;
    bookingId?: string;
    title: string;
    message: string;
    kind: string;
    createdAt: string;
    readAt?: string | null;
}

export interface AdminBookingFilters {
    status: BookingStatus | 'all';
    search: string;
    sortBy: AdminBookingSort;
    sortDirection: 'asc' | 'desc';
}

export type AdminBookingSort = 'created_at' | 'customer_name' | 'date' | 'neighborhood' | 'total_price' | 'status';

export interface BookingStats {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
}

export interface AdminAuditLog {
    id: string;
    bookingId?: string;
    adminUserId?: string;
    customerName?: string;
    serviceName?: string;
    action: 'status_changed' | 'deleted';
    fromStatus?: BookingStatus | null;
    toStatus?: BookingStatus | null;
    createdAt: string;
}

interface BookingContextType {
    bookings: Booking[];
    notifications: CustomerNotification[];
    unreadNotificationCount: number;
    loading: boolean;
    notificationsLoading: boolean;
    adminPage: number;
    adminPageSize: number;
    adminTotal: number;
    adminFilters: AdminBookingFilters;
    adminStats: BookingStats;
    setAdminPage: (page: number) => void;
    setAdminFilters: (filters: Partial<AdminBookingFilters>) => void;
    adminError: string | null;
    refreshBookings: () => Promise<void>;
    fetchAdminAuditLogs: () => Promise<{ data: AdminAuditLog[]; error?: string }>;
    addBooking: (booking: CreateBookingData, clientRequestId?: string) => Promise<{ synced: boolean; booking?: Booking; error?: string }>;
    updateBookingStatus: (id: string, status: BookingStatus) => Promise<{ success: boolean; error?: string }>;
    deleteBooking: (id: string) => Promise<{ success: boolean; error?: string }>;
    getBookingById: (id: string) => Booking | undefined;
    markNotificationRead: (id: string) => Promise<void>;
    markAllNotificationsRead: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
}

interface BookingDbRow {
    id: string;
    user_id?: string | null;
    customer_name: string;
    phone_number: string;
    service_id: string;
    service_name: string;
    neighborhood: string;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    hours: number;
    date: string;
    time: string;
    number_of_workers: number;
    number_of_rooms?: number;
    number_of_carpets?: number;
    number_of_single_mattresses?: number;
    number_of_large_mattresses?: number;
    number_of_sofa_seats?: number;
    number_of_curtains?: number;
    include_chemicals: boolean;
    notes?: string;
    total_price: number;
    status: BookingStatus;
    created_at: string;
    deleted_at?: string | null;
}

interface NotificationDbRow {
    id: string;
    booking_id?: string | null;
    title: string;
    message: string;
    kind: string;
    created_at: string;
    read_at?: string | null;
}

interface AdminAuditLogDbRow {
    id: string;
    booking_id?: string | null;
    admin_user_id?: string | null;
    customer_name?: string | null;
    service_name?: string | null;
    action: 'status_changed' | 'deleted';
    from_status?: BookingStatus | null;
    to_status?: BookingStatus | null;
    created_at: string;
}

interface AdminPageCursor {
    createdAt: string;
    id: string;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);
const ADMIN_PAGE_SIZE = 25;
const EMPTY_ADMIN_STATS: BookingStats = { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
const ADMIN_BOOKING_SELECT = 'id, created_at, user_id, customer_name, phone_number, neighborhood, address, latitude, longitude, service_id, service_name, date, time, hours, number_of_workers, number_of_rooms, number_of_carpets, number_of_single_mattresses, number_of_large_mattresses, number_of_sofa_seats, number_of_curtains, include_chemicals, notes, total_price, status, deleted_at';

const getBookingErrorMessage = (error: { code?: string; message?: string } | null | undefined) => {
    const code = error?.code || '';
    const message = error?.message || '';
    if (code === '42883' || message.includes('create_booking')) return 'Booking service is not configured. Please contact support.';
    if (code === '42501' || /authentication required|jwt/i.test(message)) return 'Your session has expired. Please sign in again.';
    if (/service pricing is not configured/i.test(message)) return 'This service is not available for online booking yet.';
    if (/duplicate|unique/i.test(message)) return 'This booking request was already received. Please refresh your bookings.';
    return message || 'Could not save your booking.';
};

const mapFromDb = (data: BookingDbRow): Booking => ({
    id: data.id,
    customerName: data.customer_name,
    phoneNumber: data.phone_number,
    serviceId: data.service_id,
    serviceName: data.service_name,
    neighborhood: data.neighborhood,
    address: data.address || '',
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    hours: data.hours,
    date: data.date,
    time: data.time,
    numberOfWorkers: data.number_of_workers,
    numberOfRooms: data.number_of_rooms,
    numberOfCarpets: data.number_of_carpets,
    numberOfSingleMattresses: data.number_of_single_mattresses,
    numberOfLargeMattresses: data.number_of_large_mattresses,
    numberOfSofaSeats: data.number_of_sofa_seats,
    numberOfCurtains: data.number_of_curtains,
    includeChemicals: data.include_chemicals,
    notes: data.notes,
    totalPrice: data.total_price,
    status: data.status,
    createdAt: data.created_at,
});

const mapNotification = (data: NotificationDbRow): CustomerNotification => ({
    id: data.id,
    bookingId: data.booking_id || undefined,
    title: data.title,
    message: data.message,
    kind: data.kind,
    createdAt: data.created_at,
    readAt: data.read_at,
});

const mapAdminAuditLog = (data: AdminAuditLogDbRow): AdminAuditLog => ({
    id: data.id,
    bookingId: data.booking_id || undefined,
    adminUserId: data.admin_user_id || undefined,
    customerName: data.customer_name || undefined,
    serviceName: data.service_name || undefined,
    action: data.action,
    fromStatus: data.from_status,
    toStatus: data.to_status,
    createdAt: data.created_at,
});

export const useBookings = () => {
    const context = useContext(BookingContext);
    if (!context) throw new Error('useBookings must be used within a BookingProvider');
    return context;
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [adminPage, setAdminPageState] = useState(1);
    const [adminFilters, setAdminFiltersState] = useState<AdminBookingFilters>({ status: 'pending', search: '', sortBy: 'created_at', sortDirection: 'desc' });
    const [adminTotal, setAdminTotal] = useState(0);
    const [adminStats, setAdminStats] = useState<BookingStats>(EMPTY_ADMIN_STATS);
    const [adminError, setAdminError] = useState<string | null>(null);
    const bookingsRequestIdRef = useRef(0);
    const notificationsRequestIdRef = useRef(0);
    const adminStatsLoadedRef = useRef(false);
    const adminStatsRef = useRef(adminStats);
    const adminPageCursorsRef = useRef<Record<number, AdminPageCursor | null>>({ 1: null });
    adminStatsRef.current = adminStats;

    const setAdminPage = useCallback((page: number) => {
        setAdminPageState(Math.max(1, page));
    }, []);

    const setAdminFilters = useCallback((filters: Partial<AdminBookingFilters>) => {
        setAdminFiltersState(previous => {
            const next = { ...previous, ...filters };
            const changed = Object.keys(filters).some(key => previous[key as keyof AdminBookingFilters] !== next[key as keyof AdminBookingFilters]);
            if (!changed) return previous;
            if (filters.status !== undefined || filters.search !== undefined || filters.sortBy !== undefined || filters.sortDirection !== undefined) {
                adminPageCursorsRef.current = { 1: null };
                setAdminPageState(1);
            }
            return next;
        });
    }, []);

    useEffect(() => {
        // Bookings are user-scoped. Clear the previous account immediately so
        // its count cannot remain visible while the next account is loading.
        bookingsRequestIdRef.current += 1;
        notificationsRequestIdRef.current += 1;
        setBookings([]);
        setNotifications([]);
        setLoading(false);
        setNotificationsLoading(false);
        adminStatsLoadedRef.current = false;
        adminPageCursorsRef.current = { 1: null };
        setAdminPageState(1);
        setAdminTotal(0);
        setAdminError(null);
        setAdminStats(EMPTY_ADMIN_STATS);
    }, [user?.id, user?.role]);

    const refreshNotifications = useCallback(async () => {
        const requestId = ++notificationsRequestIdRef.current;
        if (!isSupabaseConfigured() || !user || user.role === 'admin') {
            setNotifications([]);
            setNotificationsLoading(false);
            return;
        }
        setNotificationsLoading(true);
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('id, booking_id, title, message, kind, created_at, read_at')
                .eq('user_id', user.id)
                .is('deleted_at', null)
                .order('created_at', { ascending: false })
                .limit(30);

            if (requestId !== notificationsRequestIdRef.current) return;
            if (error) {
                console.error('Error fetching notifications:', error);
                return;
            }
            setNotifications((data || []).map(row => mapNotification(row as NotificationDbRow)));
        } catch (error) {
            if (requestId === notificationsRequestIdRef.current) {
                console.error('Could not refresh notifications:', error);
            }
        } finally {
            if (requestId === notificationsRequestIdRef.current) setNotificationsLoading(false);
        }
    }, [user]);

    const fetchBookings = useCallback(async () => {
        const requestId = ++bookingsRequestIdRef.current;
        if (!isSupabaseConfigured()) {
            setBookings([]);
            setAdminError(null);
            setLoading(false);
            return;
        }
        if (!user) {
            setBookings([]);
            setAdminError(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        const isAdmin = user.role === 'admin';
        const shouldFetchStats = isAdmin && !adminStatsLoadedRef.current;
        try {
            const search = isAdmin ? adminFilters.search.trim().replace(/[,%()]/g, ' ').replace(/\s+/g, ' ') : '';
            const needsFilteredCount = isAdmin && Boolean(search);
            // Stats already provide exact totals for the status tabs. Only count search
            // results (and the initial stats request) because exact counts scan the table.
            const shouldCountRows = isAdmin && needsFilteredCount;
            const sortAscending = adminFilters.sortDirection === 'asc';
            const useCreatedAtCursor = isAdmin && !search && adminFilters.sortBy === 'created_at';
            const currentCursor = useCreatedAtCursor ? adminPageCursorsRef.current[adminPage] : null;
            let query = supabase
                .from('bookings')
                .select(ADMIN_BOOKING_SELECT, shouldCountRows ? { count: 'exact' } : {})
                .is('deleted_at', null)
                .order(adminFilters.sortBy, { ascending: sortAscending });
            if (adminFilters.sortBy === 'date') query = query.order('time', { ascending: sortAscending });
            query = query.order('id', { ascending: sortAscending });
            if (isAdmin) {
                if (adminFilters.status !== 'all') query = query.eq('status', adminFilters.status);
                if (search) {
                    const clauses = [`customer_name.ilike.%${search}%`, `phone_number.ilike.%${search}%`];
                    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(search)) clauses.push(`id.eq.${search}`);
                    query = query.or(clauses.join(','));
                }
                if (useCreatedAtCursor) {
                    if (currentCursor) {
                        const operator = sortAscending ? 'gt' : 'lt';
                        query = query.or(`created_at.${operator}.${currentCursor.createdAt},and(created_at.eq.${currentCursor.createdAt},id.${operator}.${currentCursor.id})`);
                    }
                    query = query.limit(ADMIN_PAGE_SIZE);
                } else {
                    const from = (adminPage - 1) * ADMIN_PAGE_SIZE;
                    query = query.range(from, from + ADMIN_PAGE_SIZE - 1);
                }
            } else {
                query = query.eq('user_id', user.id);
            }
            const statsRequest = shouldFetchStats ? supabase.rpc('get_booking_stats') : Promise.resolve({ data: null, error: null });
            const [{ data, error, count }, statsResult] = await Promise.all([query, statsRequest]);

            if (requestId !== bookingsRequestIdRef.current) return;
            if (error) {
                console.error('Error fetching bookings:', error);
                if (isAdmin) setAdminError('Could not load bookings. Check your connection and try again.');
                setBookings([]);
                if (isAdmin && shouldFetchStats) {
                    setAdminTotal(0);
                    setAdminStats(EMPTY_ADMIN_STATS);
                }
            } else {
                if (isAdmin) setAdminError(null);
                const mapped = ((data || []) as BookingDbRow[]).map(mapFromDb);
                setBookings(mapped);
                if (useCreatedAtCursor) {
                    const lastBooking = mapped[mapped.length - 1];
                    if (lastBooking && mapped.length === ADMIN_PAGE_SIZE) {
                        adminPageCursorsRef.current[adminPage + 1] = { createdAt: lastBooking.createdAt, id: lastBooking.id };
                    } else {
                        delete adminPageCursorsRef.current[adminPage + 1];
                    }
                }
                if (isAdmin && shouldFetchStats) {
                    const statsRow = Array.isArray(statsResult.data) ? statsResult.data[0] : statsResult.data;
                    if (!statsResult.error && statsRow) {
                        const nextStats = {
                            total: Number(statsRow.total || 0),
                            pending: Number(statsRow.pending || 0),
                            confirmed: Number(statsRow.confirmed || 0),
                            completed: Number(statsRow.completed || 0),
                            cancelled: Number(statsRow.cancelled || 0),
                        };
                        adminStatsRef.current = nextStats;
                        setAdminStats(nextStats);
                    } else {
                        const nextStats = {
                            ...EMPTY_ADMIN_STATS,
                            total: count || 0,
                            pending: mapped.filter(booking => booking.status === 'pending').length,
                            confirmed: mapped.filter(booking => booking.status === 'confirmed').length,
                            completed: mapped.filter(booking => booking.status === 'completed').length,
                            cancelled: mapped.filter(booking => booking.status === 'cancelled').length,
                        };
                        adminStatsRef.current = nextStats;
                        setAdminStats(nextStats);
                    }
                    adminStatsLoadedRef.current = true;
                }
                if (isAdmin) {
                    const total = needsFilteredCount
                        ? (count || 0)
                        : adminFilters.status === 'all'
                            ? adminStatsRef.current.total
                            : adminStatsRef.current[adminFilters.status];
                    setAdminTotal(total);
                } else {
                    setAdminTotal(mapped.length);
                }
            }
        } catch (error) {
            if (requestId === bookingsRequestIdRef.current) {
                console.error('Could not refresh bookings:', error);
                if (user.role === 'admin') setAdminError('Could not load bookings. Check your connection and try again.');
                setBookings([]);
                if (user.role === 'admin' && shouldFetchStats) {
                    setAdminTotal(0);
                    adminStatsRef.current = EMPTY_ADMIN_STATS;
                    setAdminStats(EMPTY_ADMIN_STATS);
                    adminStatsLoadedRef.current = true;
                }
            }
        } finally {
            if (requestId === bookingsRequestIdRef.current) setLoading(false);
        }
    }, [adminFilters, adminPage, user]);

    const refreshBookings = useCallback(async () => {
        await fetchBookings();
    }, [fetchBookings]);

    const fetchAdminAuditLogs = useCallback(async () => {
        if (!isSupabaseConfigured() || !user || user.role !== 'admin') {
            return { data: [], error: 'Admin access is required.' };
        }
        try {
            const { data, error } = await supabase
                .from('admin_booking_audit_log')
                .select('id, booking_id, admin_user_id, customer_name, service_name, action, from_status, to_status, created_at')
                .order('created_at', { ascending: false })
                .limit(100);
            if (error) return { data: [], error: 'Could not load the audit log.' };
            return { data: ((data || []) as AdminAuditLogDbRow[]).map(mapAdminAuditLog) };
        } catch {
            return { data: [], error: 'Could not load the audit log.' };
        }
    }, [user]);

    useEffect(() => {
        refreshBookings();
    }, [refreshBookings]);

    useEffect(() => {
        refreshNotifications();
    }, [refreshNotifications]);

    const fetchBookingsRef = useRef(fetchBookings);
    fetchBookingsRef.current = fetchBookings;

    useEffect(() => {
        if (!isSupabaseConfigured() || !user) return;

        // REST polling keeps bookings and notifications current when a browser
        // or network blocks Supabase WebSockets. Realtime can be enabled
        // explicitly, but it is never required for core account functionality.
        const pollId = window.setInterval(() => {
            void fetchBookingsRef.current();
            void refreshNotifications();
        }, 30000);

        if (!isRealtimeEnabled()) {
            return () => window.clearInterval(pollId);
        }

        const bookingChange: { event: '*'; schema: 'public'; table: 'bookings'; filter?: string } = user.role === 'admin'
            ? { event: '*', schema: 'public', table: 'bookings' }
            : { event: '*', schema: 'public', table: 'bookings', filter: `user_id=eq.${user.id}` };
        const channel = supabase
            .channel(`customer_updates_${user.id}`)
            .on('postgres_changes', bookingChange, () => {
                if (user.role === 'admin') adminStatsLoadedRef.current = false;
                void fetchBookingsRef.current();
                void refreshNotifications();
            })
            .subscribe((status, error) => {
                if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    console.warn('Supabase Realtime unavailable; REST polling remains active.', error);
                }
            });
        return () => {
            window.clearInterval(pollId);
            void supabase.removeChannel(channel);
        };
    }, [refreshNotifications, user]);

    const addBooking = async (newBookingData: CreateBookingData, requestId?: string) => {
        if (!isSupabaseConfigured()) {
            return { synced: false, error: 'Booking service is temporarily unavailable. Please try again later.' };
        }
        if (!user || user.role !== 'customer') return { synced: false, error: 'Please sign in with your customer account first.' };

        const clientRequestId = requestId || (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
        const { data, error } = await supabase.rpc('create_booking', {
            p_service_id: newBookingData.serviceId,
            p_customer_name: newBookingData.customerName,
            p_phone_number: newBookingData.phoneNumber,
            p_neighborhood: newBookingData.neighborhood,
            p_address: newBookingData.address,
            p_latitude: newBookingData.latitude,
            p_longitude: newBookingData.longitude,
            p_hours: newBookingData.hours,
            p_date: newBookingData.date,
            p_time: newBookingData.time,
            p_number_of_workers: newBookingData.numberOfWorkers,
            p_number_of_rooms: newBookingData.numberOfRooms,
            p_number_of_carpets: newBookingData.numberOfCarpets,
            p_number_of_single_mattresses: newBookingData.numberOfSingleMattresses,
            p_number_of_large_mattresses: newBookingData.numberOfLargeMattresses,
            p_number_of_sofa_seats: newBookingData.numberOfSofaSeats,
            p_number_of_curtains: newBookingData.numberOfCurtains,
            p_include_chemicals: newBookingData.includeChemicals,
            p_notes: newBookingData.notes || null,
            p_client_request_id: clientRequestId,
        });
        if (error || !data) return { synced: false, error: getBookingErrorMessage(error) };

        const updated = [mapFromDb(data as BookingDbRow), ...bookings];
        setBookings(updated);
        return { synced: true, booking: mapFromDb(data as BookingDbRow) };
    };

    const updateBookingStatus = async (id: string, status: BookingStatus) => {
        const currentBooking = bookings.find(booking => booking.id === id);
        if (!currentBooking) return { success: false, error: 'Booking was not found.' };
        const previousBookings = bookings;
        const updated = bookings.map(booking => booking.id === id ? { ...booking, status } : booking);
        const shouldRemoveFromFilteredAdminList = user?.role === 'admin'
            && adminFilters.status !== 'all'
            && currentBooking.status === adminFilters.status
            && status !== adminFilters.status;
        const visibleBookings = shouldRemoveFromFilteredAdminList ? updated.filter(booking => booking.id !== id) : updated;
        setBookings(visibleBookings);
        if (shouldRemoveFromFilteredAdminList) setAdminTotal(current => Math.max(0, current - 1));

        if (currentBooking.status !== status) {
            setAdminStats(current => ({
                ...current,
                [currentBooking.status]: Math.max(0, current[currentBooking.status] - 1),
                [status]: current[status] + 1,
            }));
        }

        if (!isSupabaseConfigured() || user?.role !== 'admin') return { success: true };
        try {
            const { data, error } = await supabase
                .from('bookings')
                .update({ status })
                .eq('id', id)
                .select('id, status')
                .maybeSingle();
            if (error || !data) {
                throw new Error(error?.message || 'Could not update this booking.');
            }
        } catch (error) {
            console.error('Error updating booking:', error);
            setBookings(previousBookings);
            if (shouldRemoveFromFilteredAdminList) setAdminTotal(current => current + 1);
            if (currentBooking.status !== status) {
                setAdminStats(current => ({
                    ...current,
                    [currentBooking.status]: current[currentBooking.status] + 1,
                    [status]: Math.max(0, current[status] - 1),
                }));
            }
            return { success: false, error: error instanceof Error ? error.message : 'Could not update this booking.' };
        }
        return { success: true };
    };

    const deleteBooking = async (id: string) => {
        const currentBooking = bookings.find(booking => booking.id === id);
        if (!currentBooking) return { success: false, error: 'Booking was not found.' };

        if (isSupabaseConfigured() && user?.role === 'admin') {
            try {
                const { data, error } = await supabase.rpc('soft_delete_booking', {
                    p_booking_id: id,
                });

                if (error || !data) {
                    throw new Error(error?.message || 'Could not archive this booking.');
                }
            } catch (error) {
                console.error('Error archiving booking:', error);
                return { success: false, error: error instanceof Error ? error.message : 'Could not archive this booking.' };
            }
        }

        const updated = bookings.filter(booking => booking.id !== id);
        setBookings(updated);
        if (user?.role === 'admin') {
            setAdminTotal(current => Math.max(0, current - 1));
            setAdminStats(current => ({ ...current, total: Math.max(0, current.total - 1), [currentBooking.status]: Math.max(0, current[currentBooking.status] - 1) }));
        }
        return { success: true };
    };

    const markNotificationRead = async (id: string) => {
        if (!user || user.role !== 'customer') return;
        setNotifications(items => items.map(item => item.id === id ? { ...item, readAt: item.readAt || new Date().toISOString() } : item));
        if (!isSupabaseConfigured()) return;
        await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id).is('deleted_at', null);
    };

    const markAllNotificationsRead = async () => {
        const now = new Date().toISOString();
        setNotifications(items => items.map(item => ({ ...item, readAt: item.readAt || now })));
        if (!isSupabaseConfigured() || !user) return;
        await supabase.from('notifications').update({ read_at: now }).eq('user_id', user.id).is('read_at', null);
    };

    const value = {
        bookings,
        notifications,
        unreadNotificationCount: notifications.filter(notification => !notification.readAt).length,
        loading,
        notificationsLoading,
        adminPage,
        adminPageSize: ADMIN_PAGE_SIZE,
        adminTotal,
        adminFilters,
        adminStats,
        setAdminPage,
        setAdminFilters,
        adminError,
        refreshBookings,
        fetchAdminAuditLogs,
        addBooking,
        updateBookingStatus,
        deleteBooking,
        getBookingById: (id: string) => bookings.find(booking => booking.id === id),
        markNotificationRead,
        markAllNotificationsRead,
        refreshNotifications,
    };

    return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};
