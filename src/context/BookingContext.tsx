import React, { createContext, useContext, useState, useEffect } from 'react';
import { Booking, BookingStatus } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface BookingContextType {
    bookings: Booking[];
    loading: boolean;
    addBooking: (booking: CreateBookingData) => Promise<{ synced: boolean }>;
    updateBookingStatus: (id: string, status: BookingStatus) => Promise<void>;
    deleteBooking: (id: string) => Promise<void>;
    getBookingById: (id: string) => Booking | undefined;
}
//hello
export type CreateBookingData = Omit<Booking, 'id' | 'status' | 'createdAt'>;

export interface BookingFormData {
    customerName: string;
    phoneNumber: string;
    neighborhood: string;
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

interface BookingDbRow {
    id: string;
    customer_name: string;
    phone_number: string;
    service_id: string;
    service_name: string;
    neighborhood: string;
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
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBookings = () => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBookings must be used within a BookingProvider');
    }
    return context;
};

const LS_KEY = 'purity_bookings';

const readFromLS = (): Booking[] => {
    try {
        const saved = localStorage.getItem(LS_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

const writeToLS = (bookings: Booking[]) => {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(bookings));
        window.dispatchEvent(new Event('purity:bookings-updated'));
    } catch { /* ignore quota errors */ }
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Seed from localStorage immediately — no flash of empty state
    const [bookings, setBookings] = useState<Booking[]>(readFromLS);
    const [loading, setLoading] = useState(false);

    // Helpers to map between DB (snake_case) and App (camelCase)
    const mapFromDb = (data: BookingDbRow): Booking => ({
        id: data.id,
        customerName: data.customer_name,
        phoneNumber: data.phone_number,
        serviceId: data.service_id,
        serviceName: data.service_name,
        neighborhood: data.neighborhood,
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

    const mapToDb = (data: CreateBookingData) => ({
        customer_name: data.customerName,
        phone_number: data.phoneNumber,
        service_id: data.serviceId,
        service_name: data.serviceName,
        neighborhood: data.neighborhood,
        hours: data.hours,
        date: data.date,
        time: data.time,
        number_of_workers: data.numberOfWorkers,
        number_of_rooms: data.numberOfRooms,
        number_of_carpets: data.numberOfCarpets,
        number_of_single_mattresses: data.numberOfSingleMattresses,
        number_of_large_mattresses: data.numberOfLargeMattresses,
        number_of_sofa_seats: data.numberOfSofaSeats,
        number_of_curtains: data.numberOfCurtains,
        include_chemicals: data.includeChemicals,
        notes: data.notes,
        total_price: data.totalPrice,
        status: 'pending', // Default
    });

    const fetchBookings = async () => {
        if (!isSupabaseConfigured()) {
            // Already seeded from localStorage in useState init — nothing extra needed
            return;
        }

        setLoading(true);
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching bookings:', error);
            // Fall back to localStorage on Supabase error
            setBookings(readFromLS());
        } else {
            const mapped = data.map(mapFromDb);
            setBookings(mapped);
            writeToLS(mapped); // Keep localStorage mirror in sync
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBookings();

        // Subscribe to changes if Supabase is configured
        if (isSupabaseConfigured()) {
            const subscription = supabase
                .channel('bookings_changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
                    fetchBookings();
                })
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        }
    // fetchBookings intentionally owns its Supabase subscription lifecycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addBooking = async (newBookingData: CreateBookingData) => {
        if (!isSupabaseConfigured()) {
            const newBooking: Booking = {
                ...newBookingData,
                id: Math.random().toString(36).substr(2, 9),
                status: 'pending',
                createdAt: new Date().toISOString(),
            };
            const updated = [newBooking, ...bookings];
            setBookings(updated);
            writeToLS(updated);
            return { synced: false };
        }

        const { data, error } = await supabase
            .from('bookings')
            .insert([mapToDb(newBookingData)])
            .select()
            .single();

        if (error) {
            console.error('Error adding booking:', error);
            // Supabase failed — save locally as fallback so user doesn't lose their booking
            const fallback: Booking = {
                ...newBookingData,
                id: Math.random().toString(36).substr(2, 9),
                status: 'pending',
                createdAt: new Date().toISOString(),
            };
            const updated = [fallback, ...bookings];
            setBookings(updated);
            writeToLS(updated);
            return { synced: false };
        } else if (data) {
            const newBooking = mapFromDb(data);
            const updated = [newBooking, ...bookings];
            setBookings(updated);
            writeToLS(updated);
            return { synced: true };
        }

        return { synced: false };
    };

    const updateBookingStatus = async (id: string, status: BookingStatus) => {
        const updated = bookings.map(b => b.id === id ? { ...b, status } : b);
        setBookings(updated);
        writeToLS(updated);

        if (!isSupabaseConfigured()) return;

        const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
        if (error) console.error('Error updating booking:', error);
    };

    const deleteBooking = async (id: string) => {
        const updated = bookings.filter(b => b.id !== id);
        setBookings(updated);
        writeToLS(updated);

        if (!isSupabaseConfigured()) return;

        const { error } = await supabase.from('bookings').delete().eq('id', id);
        if (error) console.error('Error deleting booking:', error);
    };

    const getBookingById = (id: string) => {
        return bookings.find(booking => booking.id === id);
    };

    return (
        <BookingContext.Provider value={{ bookings, loading, addBooking, updateBookingStatus, deleteBooking, getBookingById }}>
            {children}
        </BookingContext.Provider>
    );
};
