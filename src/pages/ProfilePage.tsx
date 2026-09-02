import React from 'react';
import { Star, MapPin, Zap, Percent, Heart, ShieldCheck, ArrowRight, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
    const { bookings } = useBookings();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const totalSpent = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    const points = Math.floor(totalSpent * 0.1);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 pb-4 pt-5 md:px-5 md:pb-0 md:pt-8">
            <div className="relative mb-4 flex items-center gap-3 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:mb-6 md:gap-5 md:rounded-[2.5rem] md:p-6">
                <div className="absolute top-0 left-0 w-24 h-24 bg-teal-50 rounded-full blur-3xl -translate-x-10 -translate-y-10"></div>

                <div className="relative z-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-teal-400 text-2xl font-black text-white shadow-lg shadow-teal-600/30 md:h-20 md:w-20 md:rounded-3xl md:text-3xl">
                        {(user?.email || 'Guest').charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 p-1.5 rounded-xl border-[3px] border-white text-gray-900 shadow-sm">
                        <Star size={12} fill="currentColor" />
                    </div>
                </div>
                <div className="relative z-10">
                    <h2 className="mb-1 max-w-[220px] truncate text-base font-black text-gray-900 md:text-2xl">{user?.email || 'Guest User'}</h2>
                    <span className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-teal-700 md:px-3 md:text-[10px]">
                        {user ? 'Signed In' : 'Local Guest'}
                    </span>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-2 md:mb-8 md:gap-4">
                <div className="flex flex-col items-center gap-1 rounded-2xl border border-gray-100 bg-white p-3 text-center shadow-sm md:rounded-[2rem] md:p-5">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-tight">Points Balance</span>
                    <p className="text-2xl font-black text-teal-600 md:text-3xl">{points.toLocaleString()}</p>
                    <span className="text-[9px] text-teal-600/60 font-bold bg-teal-50 px-2 py-0.5 rounded-md">Based on local bookings</span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-2xl border border-gray-100 bg-white p-3 text-center shadow-sm md:rounded-[2rem] md:p-5">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-tight">Wallet</span>
                    <p className="text-2xl font-black text-teal-600 md:text-3xl">{totalSpent.toFixed(1)}</p>
                    <span className="text-[9px] text-teal-600/60 font-bold bg-teal-50 px-2 py-0.5 rounded-md">Total booked AED</span>
                </div>
            </div>

            <div className="space-y-3">
                <ProfileLink label="Saved Addresses" badge="Coming soon" icon={<MapPin size={18} />} />
                <ProfileLink label="Payment Methods" badge="Coming soon" icon={<Zap size={18} />} />
                <ProfileLink label="Discount Coupons" badge="Coming soon" icon={<Percent size={18} />} />
                <ProfileLink label="Invite Friend" badge="Coming soon" icon={<Heart size={18} />} />
                <ProfileLink label="Security & Privacy" badge="Coming soon" icon={<ShieldCheck size={18} />} />
                {user && <div className="pt-2 md:pt-4">
                    <ProfileLink label="Logout" danger icon={<ArrowRight size={18} />} onClick={handleLogout} />
                </div>
                }
            </div>
        </div>
    );
};

const ProfileLink: React.FC<{ label: string; icon?: React.ReactNode; badge?: string; danger?: boolean; onClick?: () => void }> = ({ label, icon, badge, danger, onClick }) => {
    const content = (
        <>
            <div className="flex items-center gap-3 md:gap-4">
                {icon && <div className={`${danger ? 'text-red-400' : 'text-teal-500/80 group-hover:text-teal-600'}`}>{icon}</div>}
                <span className="text-xs font-bold md:text-[13px]">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {badge && <span className="rounded-full bg-gray-100 px-2 py-1 text-[9px] font-bold text-gray-500 md:px-3">{badge}</span>}
                {onClick && <ChevronRight size={16} className={`${danger ? 'text-red-300' : 'text-gray-300 group-hover:text-teal-400'} transition-colors`} />}
            </div>
        </>
    );

    const className = `group flex w-full items-center justify-between rounded-xl border p-3 md:rounded-[2rem] md:p-5 ${danger ? 'border-red-100 bg-red-50/50 text-red-500 hover:bg-red-50' : 'border-gray-100 bg-white text-gray-700'}`;
    return onClick ? <button type="button" onClick={onClick} className={`${className} hover:border-teal-100 hover:shadow-md active:scale-[0.99]`}>{content}</button> : <div className={className}>{content}</div>;
};
