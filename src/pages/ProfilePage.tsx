// @ts-nocheck
import React from 'react';
import { Star, MapPin, Zap, Percent, Heart, ShieldCheck, ArrowRight, ChevronRight } from 'lucide-react';

export const ProfilePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-28 pt-8 px-5">
            <div className="flex items-center gap-5 p-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm mb-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-24 h-24 bg-teal-50 rounded-full blur-3xl -translate-x-10 -translate-y-10"></div>

                <div className="relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-600 to-teal-400 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-teal-600/30">
                        A
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 p-1.5 rounded-xl border-[3px] border-white text-gray-900 shadow-sm">
                        <Star size={12} fill="currentColor" />
                    </div>
                </div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-black text-gray-900 mb-1">Ahmed Mohammed</h2>
                    <span className="text-[10px] text-teal-700 font-black uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                        Gold Member
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center gap-1 text-center">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-tight">Points Balance</span>
                    <p className="text-3xl font-black text-teal-600">2,450</p>
                    <span className="text-[9px] text-teal-600/60 font-bold bg-teal-50 px-2 py-0.5 rounded-md">Equals 24 AED</span>
                </div>
                <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center gap-1 text-center">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-tight">Wallet</span>
                    <p className="text-3xl font-black text-teal-600">120.5</p>
                    <span className="text-[9px] text-teal-600/60 font-bold bg-teal-50 px-2 py-0.5 rounded-md">Available Credit</span>
                </div>
            </div>

            <div className="space-y-3">
                <ProfileLink label="Saved Addresses" icon={<MapPin size={18} />} />
                <ProfileLink label="Payment Methods" icon={<Zap size={18} />} />
                <ProfileLink label="Discount Coupons" icon={<Percent size={18} />} />
                <ProfileLink label="Invite Friend" badge="Earn 50 AED" icon={<Heart size={18} />} />
                <ProfileLink label="Security & Privacy" icon={<ShieldCheck size={18} />} />
                <div className="pt-4">
                    <ProfileLink label="Logout" danger icon={<ArrowRight size={18} />} />
                </div>
            </div>
        </div>
    );
};

const ProfileLink: React.FC<{ label: string; icon?: React.ReactNode; badge?: string; danger?: boolean }> = ({ label, icon, badge, danger }) => (
    <button className={`w-full p-5 rounded-[2rem] flex justify-between items-center transition-all group ${danger ? 'text-red-500 bg-red-50/50 hover:bg-red-50 border border-red-100' : 'bg-white border border-gray-100 text-gray-700 hover:border-teal-100 hover:shadow-md active:scale-[0.99]'}`}>
        <div className="flex items-center gap-4">
            {icon && <div className={`${danger ? 'text-red-400' : 'text-teal-500/80 group-hover:text-teal-600'}`}>{icon}</div>}
            <span className="font-bold text-[13px]">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            {badge && <span className="bg-rose-500 text-white text-[9px] px-3 py-1 rounded-full font-bold shadow-lg shadow-rose-500/20">{badge}</span>}
            <ChevronRight size={16} className={`${danger ? 'text-red-300' : 'text-gray-300 group-hover:text-teal-400'} transition-colors`} />
        </div>
    </button>
);
