import React, { useState } from 'react';
import { useBookings } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { Booking, BookingStatus } from '../types';
import { Button } from '../components/ui/Button';
import { LogOut, Phone, Trash2, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
    const { bookings, updateBookingStatus, deleteBooking } = useBookings();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/admin');
    };

    const getStatusColor = (status: BookingStatus) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
        }
    };

    const getStatusLabel = (status: BookingStatus) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'confirmed': return 'Confirmed';
            case 'completed': return 'Completed';
            case 'cancelled': return 'Cancelled';
        }
    }

    const filteredBookings = bookings.filter(b => {
        const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
        const matchesSearch = b.customerName.includes(searchTerm) || b.phoneNumber.includes(searchTerm) || b.id.includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    const generateWhatsAppLink = (booking: Booking) => {
        let phone = booking.phoneNumber || '';
        if (phone.startsWith('0')) phone = phone.substring(1);

        const isHourly = ['Housekeeping / Part-time Maid', 'Deep Cleaning', 'Regular Cleaning', 'Move In/Out Cleaning', 'Party Cleaning', 'Wash and Iron', 'Pet Sitting'].includes(booking.serviceName);
        const isDaily = booking.serviceName === 'Babysitting At Home';

        const messageLines = [
            `Hello ${booking.customerName},`,
            `Regarding your order #${booking.id?.substr(0, 4)}`,
            `Service: ${booking.serviceName}`,
            `Neighborhood: ${booking.neighborhood || 'N/A'}`,
            `Date & Time: ${booking.date} - ${booking.time}`
        ];

        if (isHourly) {
            messageLines.push(`Hours: ${booking.hours}`);
            messageLines.push(`Workers: ${booking.numberOfWorkers || 1}`);
        } else if (isDaily) {
            messageLines.push(`Workers: ${booking.numberOfWorkers || 1}`);
        } else if (booking.serviceName === 'Floor Cleaning') {
            messageLines.push(`Rooms: ${booking.numberOfRooms}`);
        } else if (booking.serviceName === 'Carpet Cleaning') {
            messageLines.push(`Carpets: ${booking.numberOfCarpets}`);
        } else if (booking.serviceName === 'Mattress Cleaning') {
            messageLines.push(`Single Mattresses: ${booking.numberOfSingleMattresses || 0}`);
            messageLines.push(`Large Mattresses: ${booking.numberOfLargeMattresses || 0}`);
        } else if (booking.serviceName === 'Sofa Cleaning') {
            messageLines.push(`Sofa Seats: ${booking.numberOfSofaSeats}`);
        } else if (booking.serviceName === 'Curtain Cleaning') {
            messageLines.push(`Curtains: ${booking.numberOfCurtains}`);
        }

        if (['Deep Cleaning', 'Regular Cleaning', 'Move In/Out Cleaning', 'Party Cleaning', 'Wash and Iron', 'Pet Sitting'].includes(booking.serviceName)) {
            messageLines.push(`Materials: ${booking.includeChemicals ? 'Yes' : 'No'}`);
        }

        if (booking.notes) {
            messageLines.push(`Notes: ${booking.notes}`);
        }

        if (booking.totalPrice) {
            messageLines.push(`Total Price: ${booking.totalPrice} AED`);
        }

        messageLines.push(`We would like to confirm your booking.`);

        return `https://wa.me/971${phone}?text=${encodeURIComponent(messageLines.join('\n'))}`;
    };

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        completed: bookings.filter(b => b.status === 'completed').length
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
                    <Button variant="ghost" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <LogOut className="w-4 h-4 ml-2" />
                        Logout
                    </Button>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Total Bookings</div>
                        <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Pending</div>
                        <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Confirmed</div>
                        <div className="text-3xl font-bold text-blue-600">{stats.confirmed}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Completed</div>
                        <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Filter Status:</span>
                        <select
                            className="bg-gray-50 border border-gray-300 rounded-lg text-sm p-2 outline-none focus:ring-2 focus:ring-primary-500"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as BookingStatus | 'all')}
                        >
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Search by Order ID, Name, or Phone..."
                            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">#</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Service</th>
                                    <th className="px-6 py-4">Date/Time</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredBookings.length > 0 ? (
                                    filteredBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-gray-500">#{booking.id.substr(0, 4)}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{booking.customerName}</div>
                                                <div className="text-xs text-gray-500" dir="ltr">{booking.phoneNumber}</div>
                                                <div className="text-xs text-gray-400">{booking.neighborhood}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-gray-900 font-medium mb-1">{booking.serviceName}</div>
                                                <div className="text-xs text-gray-500 flex flex-col gap-1">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} /> {booking.hours} Hours
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="font-semibold">Workers:</span> {booking.numberOfWorkers || 1}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="font-semibold">Materials:</span> {booking.includeChemicals ? 'Yes' : 'No'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-gray-900">{booking.date}</div>
                                                <div className="text-xs text-gray-500">{booking.time}</div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900">
                                                {booking.totalPrice} د.إ
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                                    {getStatusLabel(booking.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={generateWhatsAppLink(booking)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Contact Customer"
                                                    >
                                                        <Phone className="w-4 h-4" />
                                                    </a>

                                                    {booking.status === 'pending' && (
                                                        <button
                                                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Confirm"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {booking.status === 'confirmed' && (
                                                        <button
                                                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Complete"
                                                        >
                                                            <div className="w-4 h-4 border-2 border-green-600 rounded-full bg-green-600" />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Are you sure you want to delete this booking?')) deleteBooking(booking.id)
                                                        }}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            No bookings to display
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
