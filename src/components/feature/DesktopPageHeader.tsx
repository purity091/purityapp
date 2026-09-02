// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
    Search, Flame, ChevronDown,
    Home, Sofa, Sparkles, Briefcase, Heart, Shirt, Tag,
    Grid3X3, ClipboardList, X, Calendar, SlidersHorizontal
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { services } from '../../data/services';
import { packages } from '../../data/packages';
import { Booking, CATEGORIES, Service } from '../../types';
import logo from '../../assets/logo.png';
import { CitySelector } from './CitySelector';
import { SafeImage } from '../ui/SafeImage';

const getCategoryIcon = (cat: string) => {
    switch (cat) {
        case 'Home Cleaning': return <Home size={14} />;
        case 'Furniture': return <Sofa size={14} />;
        case 'Flooring': return <Sparkles size={14} />;
        case 'Commercial': return <Briefcase size={14} />;
        case 'Care': return <Heart size={14} />;
        case 'Laundry': return <Shirt size={14} />;
        default: return <Tag size={14} />;
    }
};

interface DesktopPageHeaderProps {
    searchQuery: string;
    onSearchChange: (q: string) => void;
    onSearchSubmit?: (q: string) => void;
    sortBy: 'popular' | 'price' | 'rating';
    onSortChange: (s: 'popular' | 'price' | 'rating') => void;
    totalDealsCount: number;
    onServiceSelect: (service: Service) => void;
    onCategorySelect: (cat: string) => void;
    onOpenMobileTools?: () => void;
}

// LocalStorage Wishlist Helpers
const LS_WISHLIST_KEY = 'purity_wishlist';
const readWishlist = (): string[] => {
    try { return JSON.parse(localStorage.getItem(LS_WISHLIST_KEY) || '[]'); } catch { return []; }
};

// LocalStorage Bookings Helpers (read-only mirror from BookingContext)
const LS_BOOKINGS_KEY = 'purity_bookings';
const readBookings = (): Booking[] => {
    try { return JSON.parse(localStorage.getItem(LS_BOOKINGS_KEY) || '[]') as Booking[]; } catch { return []; }
};

export const DesktopPageHeader: React.FC<DesktopPageHeaderProps> = ({
    searchQuery,
    onSearchChange,
    onSearchSubmit,
    onServiceSelect,
    onCategorySelect,
    onOpenMobileTools,
}) => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [wishlistIds, setWishlistIds] = useState<string[]>(readWishlist);
    const [savedBookings, setSavedBookings] = useState<Booking[]>(readBookings);

    // Refresh localStorage reads when panels open
    const refreshLocals = () => {
        setWishlistIds(readWishlist());
        setSavedBookings(readBookings());
    };

    // Close dropdown on outside click
    useEffect(() => {
        const fn = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
                setOpenDropdown(null);
        };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);

    useEffect(() => {
        const refreshLocalBadges = () => {
            setWishlistIds(readWishlist());
            setSavedBookings(readBookings());
        };

        window.addEventListener('storage', refreshLocalBadges);
        window.addEventListener('purity:wishlist-updated', refreshLocalBadges);
        window.addEventListener('purity:bookings-updated', refreshLocalBadges);
        return () => {
            window.removeEventListener('storage', refreshLocalBadges);
            window.removeEventListener('purity:wishlist-updated', refreshLocalBadges);
            window.removeEventListener('purity:bookings-updated', refreshLocalBadges);
        };
    }, []);

    const servicesByCategory = CATEGORIES.reduce((acc, cat) => {
        acc[cat] = services.filter(s => s.category === cat);
        return acc;
    }, {} as Record<string, typeof services>);

    const popularServices = [...services]
        .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
        .slice(0, 6);

    const scrollTo = (id: string) => {
        if (location.pathname !== '/') {
            navigate('/', { state: { scrollTo: id } });
            setOpenDropdown(null);
            return;
        }

        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setOpenDropdown(null);
    };

    const handleCategoryClick = (cat: string) => {
        setOpenDropdown(null);
        onCategorySelect(cat);
        if (location.pathname !== '/') return;
        setTimeout(() => {
            document.getElementById(`cat-${cat}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
    };

    const handleServiceClick = (service: Service) => {
        setOpenDropdown(null);
        onServiceSelect(service);
    };

    const handleAllServicesClick = () => {
        setOpenDropdown(null);
        onCategorySelect('All');
        scrollTo('services');
    };

    return (
        /* Hidden on mobile — single streamlined row on desktop */
        <div ref={dropdownRef}>
            <header className="md:hidden sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-[0_3px_14px_rgba(28,28,30,0.08)]">
                <div className="flex h-12 items-center gap-1.5 px-3">
                    <Link to="/" className="flex shrink-0 items-center" aria-label="Purity home">
                        <img src={logo} alt="Purity" width={42} height={30} className="h-7 w-auto object-contain" />
                    </Link>
                                        <div className="ml-auto flex items-center gap-1">
                        <button type="button" onClick={() => { refreshLocals(); setOpenDropdown(openDropdown === 'wishlist' ? null : 'wishlist'); }} aria-label="Open wishlist" aria-expanded={openDropdown === 'wishlist'} title="Wishlist"
                            className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${openDropdown === 'wishlist' ? 'border-rose-700 bg-rose-700 text-white' : 'border-gray-300 bg-white text-gray-800 hover:border-rose-400 hover:bg-rose-50'}`}>
                            <Heart size={15} className={openDropdown === 'wishlist' ? 'fill-white' : 'text-rose-500'} />
                            {wishlistIds.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-600 px-0.5 text-[8px] font-black text-white">{wishlistIds.length}</span>}
                        </button>
                        <Link to="/bookings" onClick={() => setOpenDropdown(null)} aria-label="Open bookings" title="My bookings"
                            className="relative flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-primary-700 transition-colors hover:border-primary-400 hover:bg-primary-50">
                            <ClipboardList size={15} />
                            {savedBookings.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary-700 px-0.5 text-[8px] font-black text-white">{savedBookings.length}</span>}
                        </Link>
                        <button type="button" onClick={() => { setIsMobileSearchOpen(value => !value); setOpenDropdown(null); }} aria-label="Search services" aria-expanded={isMobileSearchOpen} title="Search"
                            className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${isMobileSearchOpen ? 'border-primary-700 bg-primary-700 text-white' : 'border-gray-300 bg-white text-gray-800 hover:border-primary-400 hover:bg-primary-50'}`}>
                            <Search size={15} />
                        </button>
                        <button type="button" onClick={() => { setIsMobileSearchOpen(false); onOpenMobileTools?.(); }} aria-label="Open services and filters" title="Services and filters"
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-800 transition-colors hover:border-primary-400 hover:bg-primary-50">
                            <SlidersHorizontal size={15} />
                        </button>
                    </div>
                </div>

                {isMobileSearchOpen && <div className="px-3 pb-2.5">
                    <div className="relative group">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary-700" />
                        <input type="text" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onSearchSubmit?.(searchQuery); }} placeholder="Search cleaning, sofa, deep clean..."
                            className="h-9 w-full rounded-full border border-gray-300 bg-gray-100 pl-9 pr-8 text-sm font-semibold text-gray-950 outline-none transition-all placeholder:text-gray-600 focus:border-primary-700 focus:bg-white focus:ring-4 focus:ring-primary-500/15" />
                        {searchQuery && (
                            <button type="button" onClick={() => onSearchChange('')} aria-label="Clear search" className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-gray-300 text-xs font-black text-gray-700 hover:bg-gray-400">×</button>
                        )}
                    </div>
                </div>}

                <AnimatePresence>
                    {openDropdown === 'wishlist' && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} role="menu" className="absolute left-3 right-3 top-full mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/15">
                            <div className="flex items-center justify-between border-b border-rose-200 bg-rose-50 px-3 py-2.5"><span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-rose-800"><Heart size={12} fill="currentColor" /> Wishlist</span><span className="text-[10px] font-bold text-rose-700">{wishlistIds.length} saved</span></div>
                            {wishlistIds.length === 0 ? <div className="p-5 text-center text-xs font-semibold text-gray-600">No saved services yet.</div> : <div className="max-h-56 divide-y divide-gray-100 overflow-y-auto">{wishlistIds.map((id) => { const service = services.find(item => item.id === id); if (!service) return null; return <div key={id} className="flex items-center gap-2.5 px-3 py-2.5"><SafeImage src={service.image} alt="" className="h-8 w-8 rounded-lg border border-gray-100 object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-bold text-gray-900">{service.name}</p><p className="text-[10px] font-extrabold text-primary-700">{service.price} AED</p></div><button type="button" onClick={() => { const next = wishlistIds.filter(item => item !== id); localStorage.setItem(LS_WISHLIST_KEY, JSON.stringify(next)); setWishlistIds(next); }} aria-label={`Remove ${service.name} from wishlist`} className="p-1 text-gray-500 hover:text-rose-600"><X size={13} /></button></div>; })}</div>}
                        </motion.div>
                    )}
                    {openDropdown === 'bookings' && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} role="menu" className="absolute left-3 right-3 top-full mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/15">
                            <div className="flex items-center justify-between border-b border-primary-200 bg-primary-50 px-3 py-2.5"><span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-primary-800"><ClipboardList size={12} /> My Bookings</span><span className="text-[10px] font-bold text-primary-700">{savedBookings.length} requests</span></div>
                            {savedBookings.length === 0 ? <div className="p-5 text-center text-xs font-semibold text-gray-600">No bookings yet.</div> : <div className="max-h-64 divide-y divide-gray-100 overflow-y-auto">{[...savedBookings].reverse().map((booking) => <div key={booking.id} className="flex items-start justify-between gap-2 px-3 py-2.5"><div className="min-w-0"><p className="truncate text-[11px] font-bold text-gray-900">{booking.serviceName}</p><p className="mt-0.5 text-[10px] font-semibold text-gray-600">{booking.date} · {booking.time}</p></div><span className="shrink-0 text-[10px] font-extrabold text-emerald-700">{booking.totalPrice} AED</span></div>)}</div>}
                            <Link to="/bookings" onClick={() => setOpenDropdown(null)} className="block border-t border-gray-100 px-3 py-2 text-center text-[11px] font-extrabold text-primary-700 hover:bg-primary-50">View all bookings</Link>
                        </motion.div>
                    )}
                    {openDropdown === 'services' && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} role="menu"
                            className="absolute left-3 right-3 top-full mt-2 max-h-[calc(100vh-9rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/15">
                            <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-3">
                                <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-white"><Grid3X3 size={13} /> All Services</span>
                                <span className="text-[10px] font-bold text-gray-300">{services.length} available</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1 p-2">
                                {CATEGORIES.map(cat => (
                                    <button key={cat} type="button" role="menuitem" onClick={() => handleCategoryClick(cat)} className="flex items-center gap-2 rounded-xl px-2.5 py-3 text-left hover:bg-primary-50 focus:bg-primary-50 focus:outline-none">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-800">{getCategoryIcon(cat)}</span>
                                        <span className="min-w-0"><span className="block truncate text-xs font-extrabold text-gray-950">{cat}</span><span className="block text-[10px] font-semibold text-gray-600">{(servicesByCategory[cat] || []).length} services</span></span>
                                    </button>
                                ))}
                            </div>
                            <div className="border-t border-gray-100 px-3 py-3">
                                <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-gray-600">Most Booked</p>
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {popularServices.map(service => (
                                        <button key={service.id} type="button" role="menuitem" onClick={() => handleServiceClick(service)} className="min-w-[145px] rounded-xl border border-gray-200 bg-gray-100 px-2.5 py-2 text-left hover:border-primary-200 hover:bg-primary-50">
                                            <span className="block truncate text-[10px] font-extrabold text-gray-950">{service.name}</span><span className="text-[10px] font-extrabold text-primary-800">{service.price} AED</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {openDropdown === 'packages' && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} role="menu"
                            className="absolute left-3 right-3 top-full mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/15">
                            <div className="border-b border-gray-800 bg-gray-900 px-4 py-3"><span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-amber-300"><Flame size={13} /> Hot Deals · Best Value</span></div>
                            <div className="p-2">
                                {packages.map(pkg => (
                                    <button key={pkg.id} type="button" role="menuitem" onClick={() => handleServiceClick(pkg)} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-amber-50 focus:bg-amber-50 focus:outline-none">
                                        <span className="text-xs font-bold leading-tight text-gray-950">{pkg.name}</span><span className="ml-2 flex shrink-0 flex-col items-end"><span className="text-[10px] font-extrabold text-primary-800">{pkg.price} AED</span><span className="rounded-full border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-900">{pkg.offerTag}</span></span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <header className="hidden md:block sticky top-0 z-50 bg-white border-b border-gray-200 shadow-[0_4px_18px_rgba(28,28,30,0.06)]">
            <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-3">

                {/* 1. BRAND & LOCATION */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <Link to="/" className="flex items-center">
                        <img src={logo} alt="Purity" width={46} height={32} className="h-8 w-auto object-contain" />
                    </Link>
                    <CitySelector />
                </div>

                {/* 2. MEGA MENU + SEARCH — menus stay beside the brand and search fills the remaining width */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Integrated Search Bar */}
                    <div className="relative order-3 flex-1 min-w-0 group">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary-700 transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') onSearchSubmit?.(searchQuery); }}
                            placeholder="Search cleaning, sofa, deep clean..."
                            className="w-full min-w-[180px] bg-gray-100 border border-gray-300 rounded-full h-10 pl-10 pr-8 text-sm font-semibold text-gray-950 focus:outline-none focus:bg-white focus:border-primary-700 focus:ring-4 focus:ring-primary-500/15 transition-all placeholder:text-gray-600"
                        />
                        {searchQuery && (
                            <button type="button" onClick={() => onSearchChange('')} aria-label="Clear search"
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-950 font-black text-xs bg-gray-300 hover:bg-gray-400 rounded-full w-5 h-5 flex items-center justify-center transition-colors">
                                ×
                            </button>
                        )}
                    </div>

                    {/* Services Dropdown */}
                    <div className="relative order-1 flex-shrink-0">
                        <button
                            onClick={() => setOpenDropdown(openDropdown === 'services' ? null : 'services')}
                            aria-haspopup="menu"
                            aria-expanded={openDropdown === 'services'}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-extrabold transition-all border focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/20 ${
                                openDropdown === 'services'
                                    ? 'bg-primary-700 text-white border-primary-700 shadow-md shadow-primary-700/20'
                                    : 'bg-white hover:bg-primary-50 text-gray-800 hover:text-primary-900 border-gray-300 hover:border-primary-300'
                            }`}
                        >
                            <Grid3X3 size={13} />
                            Services & Packages
                            <ChevronDown size={12} className={`transition-transform ${openDropdown === 'services' ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {openDropdown === 'wishlist' && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} role="menu" className="absolute left-3 right-3 top-full mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/15">
                            <div className="flex items-center justify-between border-b border-rose-200 bg-rose-50 px-3 py-2.5"><span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-rose-800"><Heart size={12} fill="currentColor" /> Wishlist</span><span className="text-[10px] font-bold text-rose-700">{wishlistIds.length} saved</span></div>
                            {wishlistIds.length === 0 ? <div className="p-5 text-center text-xs font-semibold text-gray-600">No saved services yet.</div> : <div className="max-h-56 divide-y divide-gray-100 overflow-y-auto">{wishlistIds.map((id) => { const service = services.find(item => item.id === id); if (!service) return null; return <div key={id} className="flex items-center gap-2.5 px-3 py-2.5"><SafeImage src={service.image} alt="" className="h-8 w-8 rounded-lg border border-gray-100 object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-bold text-gray-900">{service.name}</p><p className="text-[10px] font-extrabold text-primary-700">{service.price} AED</p></div><button type="button" onClick={() => { const next = wishlistIds.filter(item => item !== id); localStorage.setItem(LS_WISHLIST_KEY, JSON.stringify(next)); setWishlistIds(next); }} aria-label={`Remove ${service.name} from wishlist`} className="p-1 text-gray-500 hover:text-rose-600"><X size={13} /></button></div>; })}</div>}
                        </motion.div>
                    )}
                    {openDropdown === 'bookings' && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} role="menu" className="absolute left-3 right-3 top-full mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/15">
                            <div className="flex items-center justify-between border-b border-primary-200 bg-primary-50 px-3 py-2.5"><span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-primary-800"><ClipboardList size={12} /> My Bookings</span><span className="text-[10px] font-bold text-primary-700">{savedBookings.length} requests</span></div>
                            {savedBookings.length === 0 ? <div className="p-5 text-center text-xs font-semibold text-gray-600">No bookings yet.</div> : <div className="max-h-64 divide-y divide-gray-100 overflow-y-auto">{[...savedBookings].reverse().map((booking) => <div key={booking.id} className="flex items-start justify-between gap-2 px-3 py-2.5"><div className="min-w-0"><p className="truncate text-[11px] font-bold text-gray-900">{booking.serviceName}</p><p className="mt-0.5 text-[10px] font-semibold text-gray-600">{booking.date} · {booking.time}</p></div><span className="shrink-0 text-[10px] font-extrabold text-emerald-700">{booking.totalPrice} AED</span></div>)}</div>}
                            <Link to="/bookings" onClick={() => setOpenDropdown(null)} className="block border-t border-gray-100 px-3 py-2 text-center text-[11px] font-extrabold text-primary-700 hover:bg-primary-50">View all bookings</Link>
                        </motion.div>
                    )}
                    {openDropdown === 'services' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.13 }}
                                    role="menu"
                                    className="absolute top-full left-0 mt-3 w-[min(860px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/15 z-50"
                                >
                                    <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-3">
                                        <div>
                                            <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-white">
                                                <Grid3X3 size={13} className="text-primary-300" /> Services &amp; Packages
                                            </span>
                                            <p className="mt-1 text-[10px] font-medium text-gray-300">Choose a service or a ready-made package for your home.</p>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-300">{services.length} services · {packages.length} packages</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr]">
                                        <div className="p-3 md:border-r md:border-gray-100">
                                            <div className="mb-2 flex items-center justify-between">
                                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-600">Services</p>
                                                <button type="button" onClick={handleAllServicesClick} className="text-[10px] font-extrabold text-primary-700 hover:text-primary-900">Browse all</button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-1">
                                                {CATEGORIES.map(cat => (
                                                    <button key={cat} onClick={() => handleCategoryClick(cat)} role="menuitem"
                                                        className="group flex items-center gap-2 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-primary-50 focus:outline-none focus-visible:bg-primary-50">
                                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-800 group-hover:bg-primary-100">{getCategoryIcon(cat)}</div>
                                                        <div className="min-w-0">
                                                            <div className="truncate text-xs font-extrabold text-gray-950 group-hover:text-primary-800">{cat}</div>
                                                            <div className="text-[10px] font-semibold text-gray-600">{(servicesByCategory[cat] || []).length} services</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="mt-3 border-t border-gray-100 pt-2.5">
                                                <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-gray-600">Most booked</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {popularServices.slice(0, 4).map(service => (
                                                        <button key={service.id} type="button" onClick={() => handleServiceClick(service)} role="menuitem"
                                                            className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-left transition-colors hover:border-primary-200 hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30">
                                                            <span className="block truncate text-[10px] font-extrabold text-gray-950">{service.name}</span>
                                                            <span className="text-[10px] font-extrabold text-primary-800">{service.price} AED</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border-t border-gray-100 bg-amber-50/50 p-3 md:border-t-0">
                                            <div className="mb-2 flex items-center justify-between">
                                                <div>
                                                    <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-amber-900"><Flame size={12} className="text-amber-700" /> Packages</p>
                                                    <p className="mt-0.5 text-[10px] font-medium text-gray-600">Best value for recurring care.</p>
                                                </div>
                                                <button type="button" onClick={() => scrollTo('offers')} className="text-[10px] font-extrabold text-amber-800 hover:text-amber-950">View all</button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-1.5">
                                                {packages.map(pkg => (
                                                    <button key={pkg.id} type="button" role="menuitem" onClick={() => handleServiceClick(pkg)}
                                                        className="flex w-full items-center gap-2 rounded-xl border border-amber-100 bg-white px-2 py-2 text-left transition-colors hover:border-amber-300 hover:bg-amber-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30">
                                                        <SafeImage src={pkg.image} alt="" className="h-9 w-9 flex-shrink-0 rounded-lg object-cover" />
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block truncate text-[10px] font-extrabold text-gray-950">{pkg.name}</span>
                                                            <span className="text-[10px] font-extrabold text-primary-800">{pkg.price} AED</span>
                                                        </span>
                                                        {pkg.offerTag && <span className="flex-shrink-0 rounded-full border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-900">{pkg.offerTag}</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Packages are included in the Services & Packages mega menu. */}
                    <div className="hidden">
                        <AnimatePresence>
                            {openDropdown === 'packages' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.13 }}
                                    role="menu"
                                    className="absolute top-full left-0 mt-3 w-72 bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-gray-900/15 overflow-hidden z-50"
                                >
                                    <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 [&>span]:!text-amber-300">
                                        <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-widest">Hot Deals · Best Value</span>
                                    </div>
                                    <div className="p-2">
                                        {packages.map(pkg => (
                                            <button key={pkg.id} onClick={() => handleServiceClick(pkg)}
                                                role="menuitem"
                                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-amber-50 group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30">
                                                <span className="text-sm font-bold text-gray-950 group-hover:text-amber-900 leading-tight">{pkg.name}</span>
                                                <div className="flex flex-col items-end ml-2 flex-shrink-0">
                                                    <span className="text-[11px] font-extrabold text-primary-800">{pkg.price} AED</span>
                                                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">{pkg.offerTag}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* 3. MY WISHLIST & MY BOOKINGS */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* My Wishlist Button */}
                    <div className="relative">
                        <button
                            onClick={() => { refreshLocals(); setOpenDropdown(openDropdown === 'wishlist' ? null : 'wishlist'); }}
                            aria-haspopup="menu"
                            aria-expanded={openDropdown === 'wishlist'}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-extrabold border transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/20 ${
                                openDropdown === 'wishlist'
                                    ? 'bg-rose-700 text-white border-rose-700 shadow-md shadow-rose-700/20'
                                    : 'bg-white hover:bg-rose-50 text-gray-800 border-gray-300 hover:border-rose-300'
                            }`}
                        >
                            <Heart size={13} className={openDropdown === 'wishlist' ? 'text-white fill-white' : 'text-rose-500'} />
                            <span>Wishlist</span>
                            {wishlistIds.length > 0 && (
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                                    openDropdown === 'wishlist' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                                }`}>{wishlistIds.length}</span>
                            )}
                        </button>

                        <AnimatePresence>
                            {openDropdown === 'wishlist' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.13 }}
                                    className="absolute top-full right-0 mt-3 w-72 bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-gray-900/15 overflow-hidden z-50"
                                >
                                    <div className="flex items-center justify-between bg-rose-50 border-b border-rose-200 px-4 py-3">
                                        <span className="text-[11px] font-extrabold text-rose-800 uppercase tracking-widest flex items-center gap-1.5">
                                            <Heart size={12} fill="currentColor" /> My Wishlist
                                        </span>
                                        <span className="text-[11px] font-bold text-rose-700">{wishlistIds.length} saved</span>
                                    </div>
                                    {wishlistIds.length === 0 ? (
                                        <div className="p-6 text-center">
                                            <Heart size={28} className="text-gray-200 mx-auto mb-2" />
                                            <p className="text-sm font-bold text-gray-700">No saved services yet.</p>
                                            <p className="text-xs text-gray-600 mt-1">Tap the heart icon on any service card to save it here.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-50 max-h-60 overflow-y-auto">
                                            {wishlistIds.map((id) => {
                                                const svc = services.find(s => s.id === id);
                                                if (!svc) return null;
                                                return (
                                                    <div key={id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 group">
                                                        <SafeImage src={svc.image} alt="" className="w-9 h-9 rounded-lg object-cover flex-none border border-gray-100" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-gray-900 truncate">{svc.name}</p>
                                                            <p className="text-[11px] font-extrabold text-emerald-700">{svc.price} AED</p>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const next = wishlistIds.filter(w => w !== id);
                                                                localStorage.setItem('purity_wishlist', JSON.stringify(next));
                                                                setWishlistIds(next);
                                                            }}
                                                            aria-label={`Remove ${svc.name} from wishlist`}
                                                            className="text-gray-600 hover:text-rose-600 transition-colors p-1 rounded-md hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30"
                                                        >
                                                            <X size={13} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* My Bookings Button */}
                    <div className="relative">
                        <button
                            onClick={() => { refreshLocals(); setOpenDropdown(openDropdown === 'bookings' ? null : 'bookings'); }}
                            aria-haspopup="menu"
                            aria-expanded={openDropdown === 'bookings'}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-extrabold border transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/20 ${
                                openDropdown === 'bookings'
                                    ? 'bg-primary-700 text-white border-primary-700 shadow-md shadow-primary-700/20'
                                    : 'bg-white hover:bg-primary-50 text-gray-800 border-gray-300 hover:border-primary-300'
                            }`}
                        >
                            <ClipboardList size={13} className={openDropdown === 'bookings' ? 'text-white' : 'text-primary-600'} />
                            <span>My Bookings</span>
                            {savedBookings.length > 0 && (
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                                    openDropdown === 'bookings' ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-700'
                                }`}>{savedBookings.length}</span>
                            )}
                        </button>

                        <AnimatePresence>
                            {openDropdown === 'bookings' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.13 }}
                                    className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-gray-900/15 overflow-hidden z-50"
                                >
                                    <div className="flex items-center justify-between bg-primary-50 border-b border-primary-200 px-4 py-3">
                                        <span className="text-[11px] font-extrabold text-primary-800 uppercase tracking-widest flex items-center gap-1.5">
                                            <ClipboardList size={12} /> My Bookings
                                        </span>
                                        <span className="text-[11px] font-bold text-primary-700">{savedBookings.length} requests</span>
                                    </div>
                                    {savedBookings.length === 0 ? (
                                        <div className="p-6 text-center">
                                            <ClipboardList size={28} className="text-gray-200 mx-auto mb-2" />
                                            <p className="text-sm font-bold text-gray-700">No bookings yet.</p>
                                            <p className="text-xs text-gray-600 mt-1">Your completed bookings will appear here.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                                            {[...savedBookings].reverse().map((b) => (
                                                <div key={b.id} className="px-4 py-2.5 hover:bg-gray-50">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-black text-gray-900 truncate">{b.serviceName}</p>
                                                            <p className="text-xs text-gray-600 font-semibold flex items-center gap-1 mt-0.5">
                                                                <Calendar size={10} /> {b.date} · {b.time}
                                                            </p>
                                                        </div>
                                                        <div className="text-right flex-none">
                                                            <span className="text-xs font-black text-emerald-700 block">{b.totalPrice} AED</span>
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                                                b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700'
                                                                : b.status === 'cancelled' ? 'bg-red-100 text-red-700'
                                                                : 'bg-amber-100 text-amber-700'
                                                            }`}>{b.status}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </header>
        </div>
    );
};
