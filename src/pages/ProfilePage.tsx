import React, { useState } from 'react';
import { Bell, CalendarDays, Check, KeyRound, LogOut, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';
import { CustomerAccountTabs } from '../components/feature/CustomerAccountTabs';

export const ProfilePage: React.FC = () => {
    const { user, logout, updateAccount, isLoading } = useAuth();
    const { bookings, unreadNotificationCount } = useBookings();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const totalSpent = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

    const saveAccount = async (event: React.FormEvent) => {
        event.preventDefault();
        setMessage('');
        setError('');
        if (newPassword && newPassword.length < 6) {
            setError('New password must be at least 6 characters.');
            return;
        }
        const result = await updateAccount({ fullName, newPassword: newPassword || undefined });
        if (!result.success) setError(result.message || 'Could not update your account.');
        else { setNewPassword(''); setMessage('Account updated successfully.'); }
    };

    const handleLogout = async () => { await logout(); navigate('/'); };

    return (
        <div className="min-h-screen bg-slate-50 px-4 pb-8 pt-5 md:px-5 md:pb-12 md:pt-8" dir="ltr">
            <div className="mx-auto w-full max-w-5xl">
                <CustomerAccountTabs />
                <div className="mb-6 border-b border-slate-200 pb-5 md:mb-8">
                    <p className="text-xs font-bold uppercase text-primary-700">Account</p>
                    <h1 className="mt-1 text-2xl font-semibold text-slate-950 md:text-3xl">Profile settings</h1>
                    <p className="mt-1 text-sm text-slate-500">Manage your personal information and account security.</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
                <aside className="space-y-4">
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-800">{(user?.fullName || user?.phone || 'P').charAt(0).toUpperCase()}</div>
                            <div className="min-w-0">
                                <h2 className="truncate text-sm font-semibold text-slate-950">{user?.fullName || 'Purity customer'}</h2>
                                <p className="mt-0.5 truncate text-xs text-slate-500">Customer account</p>
                            </div>
                        </div>
                        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                            <Stat label="Total bookings" value={bookings.length.toString()} icon={<CalendarDays size={15} />} />
                            <Stat label="Total spent" value={`${totalSpent.toFixed(0)} AED`} icon={<ShieldCheck size={15} />} />
                        </div>
                    </section>

                    <Link to="/notifications" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary-200 hover:bg-primary-50/40">
                        <span className="rounded-lg bg-primary-50 p-2 text-primary-700"><Bell size={16} /></span>
                        <span className="min-w-0 flex-1"><strong className="block text-xs font-semibold text-slate-900">Notifications</strong><span className="mt-0.5 block truncate text-[11px] text-slate-500">{unreadNotificationCount ? `${unreadNotificationCount} unread update${unreadNotificationCount > 1 ? 's' : ''}` : 'No new updates'}</span></span>
                    </Link>

                    <button type="button" onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"><LogOut size={16} /> Sign out</button>
                </aside>

                <form onSubmit={saveAccount} className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-5 md:px-7">
                        <div className="flex items-start gap-3">
                            <span className="rounded-lg bg-primary-50 p-2 text-primary-700"><UserRound size={17} /></span>
                            <div><h2 className="text-base font-semibold text-slate-950">Personal information</h2><p className="mt-1 text-sm text-slate-500">Your contact details are used to manage bookings and updates.</p></div>
                        </div>
                    </div>

                    <div className="space-y-7 px-5 py-6 md:px-7">
                        {message && <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700" role="status"><Check size={16} /> {message}</div>}
                        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700" role="alert">{error}</div>}

                        <div className="grid gap-5 md:grid-cols-2">
                            <ReadOnlyField label="Mobile number" value={user?.phone || ''} icon={<Phone size={15} />} />
                            <ReadOnlyField label="Email address" value={user?.email || ''} icon={<Mail size={15} />} />
                        </div>

                        <div className="border-t border-slate-200 pt-6">
                            <h3 className="text-sm font-semibold text-slate-950">Profile details</h3>
                            <p className="mt-1 text-xs text-slate-500">This name will be used on your booking records.</p>
                            <label className="mt-4 block max-w-xl"><span className="mb-2 block text-sm font-medium text-slate-700">Full name</span><input value={fullName} onChange={event => setFullName(event.target.value)} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/15" /></label>
                        </div>

                        <div className="border-t border-slate-200 pt-6">
                            <div className="flex items-center gap-2"><KeyRound size={16} className="text-slate-500" /><h3 className="text-sm font-semibold text-slate-950">Password</h3></div>
                            <p className="mt-1 text-xs text-slate-500">Leave this field empty if you do not want to change your password.</p>
                            <label className="mt-4 block max-w-xl"><span className="mb-2 block text-sm font-medium text-slate-700">New password</span><input type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} placeholder="At least 6 characters" autoComplete="new-password" className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/15" /></label>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-7">
                        <p className="text-xs text-slate-500">Changes are saved securely to your account.</p>
                        <button type="submit" disabled={isLoading} className="inline-flex h-10 items-center justify-center rounded-lg bg-primary-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-600/30 disabled:cursor-not-allowed disabled:opacity-60">{isLoading ? 'Saving changes...' : 'Save changes'}</button>
                    </div>
                </form>
                </div>
            </div>
        </div>
    );
};

const Stat: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0"><span className="flex items-center gap-2 text-xs font-medium text-slate-500">{icon}{label}</span><strong className="text-sm font-semibold text-slate-900">{value}</strong></div>;
const ReadOnlyField: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">{label}</span><span className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"><span className="text-slate-400">{icon}</span><input value={value} disabled readOnly dir="ltr" className="min-w-0 flex-1 bg-transparent text-sm outline-none disabled:cursor-not-allowed" /></span></label>;
