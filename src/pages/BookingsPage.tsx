// @ts-nocheck
import React from 'react';
import { Clock } from 'lucide-react';

export const BookingsPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-24 pt-8 px-5">
            <h2 className="text-3xl font-black text-teal-950 mb-8">My Bookings</h2>

            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-white rounded-[2.5rem] shadow-sm border border-gray-100/50 p-8">
                <div className="bg-teal-50 p-8 rounded-full shadow-inner relative overflow-hidden">
                    <Clock size={48} className="text-teal-400 relative z-10" />
                    <div className="absolute inset-0 bg-teal-100/50 blur-xl"></div>
                </div>

                <div className="space-y-3">
                    <h3 className="font-black text-xl text-gray-800">No Active Bookings</h3>
                    <p className="text-sm text-gray-400 font-medium max-w-[220px] mx-auto leading-relaxed">
                        You haven't booked any service yet. Discover our offers and start your first clean experience.
                    </p>
                </div>

                <button
                    onClick={() => window.location.href = '/'}
                    className="bg-teal-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-teal-600/20 active:scale-95 transition-transform hover:bg-teal-700"
                >
                    Browse Services
                </button>
            </div>
        </div>
    );
};
