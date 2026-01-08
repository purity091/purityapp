import React, { createContext, useContext, useState, useEffect } from 'react';
import { Booking, BookingStatus } from '../types';

interface BookingContextType {
    bookings: Booking[];
    addBooking: (booking: CreateBookingData) => void;
    updateBookingStatus: (id: string, status: BookingStatus) => void;
    deleteBooking: (id: string) => void;
    getBookingById: (id: string) => Booking | undefined;
}

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
    const [bookings, setBookings] = useState<Booking[]>(() => {
        const saved = localStorage.getItem('purity_bookings');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('purity_bookings', JSON.stringify(bookings));
    }, [bookings]);

    const addBooking = (newBookingData: CreateBookingData) => {
        const newBooking: Booking = {
            ...newBookingData,
            id: Math.random().toString(36).substr(2, 9),
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        setBookings(prev => [newBooking, ...prev]);
    };

    const updateBookingStatus = (id: string, status: BookingStatus) => {
        setBookings(prev => prev.map(booking =>
            booking.id === id ? { ...booking, status } : booking
        ));
    };

    const deleteBooking = (id: string) => {
        setBookings(prev => prev.filter(booking => booking.id !== id));
    };

    const getBookingById = (id: string) => {
        return bookings.find(booking => booking.id === id);
    };

    return (
        <BookingContext.Provider value={{ bookings, addBooking, updateBookingStatus, deleteBooking, getBookingById }}>
            {children}
        </BookingContext.Provider>
    );
};
