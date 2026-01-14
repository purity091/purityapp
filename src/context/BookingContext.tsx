import React, { createContext, useContext, useState, useEffect } from 'react';
import { Booking, BookingStatus } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface BookingContextType {
    bookings: Booking[];
    loading: boolean;
    addBooking: (booking: CreateBookingData) => Promise<void>;
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

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBookings = () => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBookings must be used within a BookingProvider');
    }
    return context;
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);

    // Helpers to map between DB (snake_case) and App (camelCase)
    const mapFromDb = (data: any): Booking => ({
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
            // Fallback to localStorage for demo/offline if Supabase is not ready
            const saved = localStorage.getItem('purity_bookings');
            if (saved) setBookings(JSON.parse(saved));
            return;
        }

        setLoading(true);
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching bookings:', error);
        } else {
            setBookings(data.map(mapFromDb));
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
    }, []);

    const addBooking = async (newBookingData: CreateBookingData) => {
        if (!isSupabaseConfigured()) {
            // LocalStorage Fallback
            const newBooking: Booking = {
                ...newBookingData,
                id: Math.random().toString(36).substr(2, 9),
                status: 'pending',
                createdAt: new Date().toISOString(),
            };
            const updated = [newBooking, ...bookings];
            setBookings(updated);
            localStorage.setItem('purity_bookings', JSON.stringify(updated));
            return;
        }

        const { error } = await supabase.from('bookings').insert([mapToDb(newBookingData)]);
        if (error) {
            console.error('Error adding booking:', error);
            throw error;
        }
    };

    const updateBookingStatus = async (id: string, status: BookingStatus) => {
        if (!isSupabaseConfigured()) {
            // LocalStorage Fallback
            const updated = bookings.map(b => b.id === id ? { ...b, status } : b);
            setBookings(updated);
            localStorage.setItem('purity_bookings', JSON.stringify(updated));
            return;
        }

        const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
        if (error) {
            console.error('Error updating booking:', error);
            throw error;
        }
    };

    const deleteBooking = async (id: string) => {
        if (!isSupabaseConfigured()) {
            // LocalStorage Fallback
            const updated = bookings.filter(b => b.id !== id);
            setBookings(updated);
            localStorage.setItem('purity_bookings', JSON.stringify(updated));
            return;
        }

        const { error } = await supabase.from('bookings').delete().eq('id', id);
        if (error) {
            console.error('Error deleting booking:', error);
            throw error;
        }
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
