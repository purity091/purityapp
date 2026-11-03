// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
    Search, Flame, ChevronDown,
    Home, Sofa, Sparkles, Briefcase, Heart, Shirt, Tag,
    Grid3X3, ClipboardList, X, Calendar, SlidersHorizontal, Bell, UserRound
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Booking, CATEGORIES, Service } from '../../types';
import { CitySelector } from './CitySelector';
import { SafeImage } from '../ui/SafeImage';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../context/BookingContext';
import { useCatalog } from '../../context/CatalogContext';
import { PwaInstallButton } from '../layout/PwaInstallButton';
import { getPriceUnitLabel } from '../../lib/pricing';
import { NotificationPopover } from './NotificationPopover';
import { useWishlist } from '../../context/WishlistContext';

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

// LocalStorage Bookings Helpers (read-only mirror from BookingContext)
const LS_BOOKINGS_KEY = 'purity_bookings';
const readBookings = (): Booking[] => {
    try { return JSON.parse(localStorage.getItem(LS_BOOKINGS_KEY) || '[]') as Booking[]; } catch { return []; }
};

const formatServicePrice = (service: Service) => `${service.price} AED · ${getPriceUnitLabel(service)}`;

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
    const [savedBookings, setSavedBookings] = useState<Booking[]>(readBookings);
    const { user } = useAuth();
    const { wishlistIds, toggleWishlist } = useWishlist();
    const { bookings, notifications, notificationsLoading, unreadNotificationCount, markNotificationRead, markAllNotificationsRead } = useBookings();
    const { services, packages } = useCatalog();
    const wishlistCatalog = [...services, ...packages];

    // Refresh localStorage reads when panels open
    const refreshLocals = () => {
        setSavedBookings(bookings);
    };

    useEffect(() => {
        setSavedBookings(bookings);
    }, [bookings]);

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
            setSavedBookings(readBookings());
        };

        window.addEventListener('storage', refreshLocalBadges);
        window.addEventListener('purity:bookings-updated', refreshLocalBadges);
        return () => {
            window.removeEventListener('storage', refreshLocalBadges);
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

    const openCustomerAuth = () => {
        setOpenDropdown(null);
        navigate(location.pathname, { state: { openAuth: true, from: location.pathname } });
    };

    return (
        /* Hidden on mobile — single streamlined row on desktop */
        <div ref={dropdownRef}>
            <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl md:hidden">
                <div className="flex h-14 items-center gap-2 px-3">
                    <Link to="/" className="flex shrink-0 items-center rounded-lg px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40" aria-label="Purity home">
                        <img src="/logo.png" alt="Purity Cleaning Services" width={40} height={40} className="h-9 w-9 rounded-lg object-contain" />
                    </Link>
                    <div className="ml-auto flex items-center gap-1.5">
                        <button type="button" onClick={() => { refreshLocals(); setOpenDropdown(openDropdown === 'wishlist' ? null : 'wishlist'); }} aria-label="Open wishlist" aria-expanded={openDropdown === 'wishlist'} title="Wishlist"
                            className={`relative flex h-9 w-9 items-center justify-center rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30 ${openDropdown === 'wishlist' ? 'border-rose-700 bg-rose-700 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-rose-300 hover:bg-rose-50'}`}>
                            <Heart size={15} className={openDropdown === 'wishlist' ? 'fill-white' : 'text-rose-500'} />
                            {wishlistIds.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-600 px-0.5 text-[8px] font-black text-white">{wishlistIds.length}</span>}
                        </button>
                         {user?.role === 'customer' && <button type="button" onClick={() => setOpenDropdown(openDropdown === 'notifications' ? null : 'notifications')} aria-haspopup="dialog" aria-expanded={openDropdown === 'notifications'} aria-label="Open notifications" title="Notifications" className="relative flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-primary-700 transition-colors hover:border-primary-400 hover:bg-primary-50"><Bell size={15} />{unreadNotificationCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-600 px-0.5 text-[8px] font-black text-white">{unreadNotificationCount}</span>}</button>}
                        <PwaInstallButton compact />
                        <button type="button" onClick={() => { setIsMobileSearchOpen(value => !value); setOpenDropdown(null); }} aria-label="Search services" aria-expanded={isMobileSearchOpen} title="Search"
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 ${isMobileSearchOpen ? 'border-primary-700 bg-primary-700 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-primary-300 hover:bg-primary-50'}`}>
                            <Search size={15} />
                        </button>
                        <button type="button" onClick={() => { setIsMobileSearchOpen(false); onOpenMobileTools?.(); }} aria-label="Open services and filters" title="Services and filters"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:border-primary-300 hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30">
                            <SlidersHorizontal size={15} />
                        </button>
                    </div>
                </div>

                {isMobileSearchOpen && <div className="border-t border-slate-100 px-3 pb-3 pt-2">
                    <div className="relative group">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary-700" />
                        <input type="text" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onSearchSubmit?.(searchQuery); }} placeholder="Search cleaning, sofa, deep clean..."
                            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-100 pl-9 pr-8 text-sm font-medium text-slate-950 outline-none transition-all placeholder:text-slate-500 focus:border-primary-600 focus:bg-white focus:ring-2 focus:ring-primary-500/20" />
                        {searchQuery && (
                            <button type="button" onClick={() => onSearchChange('')} aria-label="Clear search" className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-gray-300 text-xs font-black text-gray-700 hover:bg-gray-400">×</button>
                        )}
                    </div>
                </div>}

                <AnimatePresence>
                    {openDropdown === 'wishlist' && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} role="menu" className="absolute left-3 right-3 top-full mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10">
                            <div className="flex items-center justify-between border-b border-rose-200 bg-rose-50 px-3 py-2.5"><span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase text-rose-800"><Heart size={12} fill="currentColor" /> Wishlist</span><span className="text-[10px] font-bold text-rose-700">{wishlistIds.length} saved</span></div>
                            {wishlistIds.length === 0 ? <div className="p-5 text-center text-xs font-semibold text-gray-600">No saved services yet.</div> : <div className="max-h-56 divide-y divide-gray-100 overflow-y-auto">{wishlistIds.map((id) => { const service = wishlistCatalog.find(item => item.id === id); if (!service) return null; return <div key={id} className="flex items-center gap-2.5 px-3 py-2.5"><SafeImage src={service.image} alt="" className="h-8 w-8 rounded-lg border border-gray-100 object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-bold text-gray-900">{service.name}</p><p className="text-[10px] font-extrabold text-primary-700">{formatServicePrice(service)}</p></div><button type="button" onClick={() => { void toggleWishlist(id); }} aria-label={`Remove ${service.name} from wishlist`} className="p-1 text-gray-500 hover:text-rose-600"><X size={13} /></button></div>; })}</div>}
                        </motion.div>
                    )}
                    {user?.role === 'customer' && openDropdown === 'notifications' && <NotificationPopover notifications={notifications} notificationsLoading={notificationsLoading} onMarkRead={markNotificationRead} onMarkAllRead={markAllNotificationsRead} onClose={() => setOpenDropdown(null)} mobile />}
                    {openDropdown === 'services' && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} role="menu"
                            className="absolute left-3 right-3 top-full mt-2 max-h-[calc(100vh-9rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/15">
                            <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-3">
                                <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase text-white"><Grid3X3 size={13} /> All Services</span>
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
                                <p className="mb-2 text-[10px] font-extrabold uppercase text-gray-600">Most Booked</p>
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {popularServices.map(service => (
                                        <button key={service.id} type="button" role="menuitem" onClick={() => handleServiceClick(service)} className="min-w-[145px] rounded-xl border border-gray-200 bg-gray-100 px-2.5 py-2 text-left hover:border-primary-200 hover:bg-primary-50">
                                            <span className="block truncate text-[10px] font-extrabold text-gray-950">{service.name}</span><span className="text-[10px] font-extrabold text-primary-800">{formatServicePrice(service)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {openDropdown === 'packages' && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} role="menu"
                            className="absolute left-3 right-3 top-full mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/15">
                            <div className="border-b border-gray-800 bg-gray-900 px-4 py-3"><span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-amber-300"><Flame size={13} /> Hot Deals · Best Value</span></div>
                            <div className="p-2">
                                {packages.map(pkg => (
                                    <button key={pkg.id} type="button" role="menuitem" onClick={() => handleServiceClick(pkg)} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-amber-50 focus:bg-amber-50 focus:outline-none">
                                        <span className="text-xs font-bold leading-tight text-gray-950">{pkg.name}</span><span className="ml-2 flex shrink-0 flex-col items-end"><span className="text-[10px] font-extrabold text-primary-800">{formatServicePrice(pkg)}</span><span className="rounded-full border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-900">{pkg.offerTag}</span></span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <header className="sticky top-0 z-50 hidden border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl md:block">
            <div className="mx-auto flex h-[4.5rem] w-full max-w-[1600px] items-center justify-between gap-4 px-4 lg:px-8">

                {/* 1. BRAND & LOCATION */}
                <div className="flex shrink-0 items-center gap-2.5">
                    <Link to="/" className="flex items-center rounded-lg px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40">
                        <img src="/logo.png" alt="Purity Cleaning Services" width={42} height={42} className="h-10 w-10 rounded-xl object-contain" />
                    </Link>
                    <CitySelector dense />
                </div>

                {/* 2. MEGA MENU + SEARCH — menus stay beside the brand and search fills the remaining width */}
                <div className="flex min-w-0 flex-1 items-center gap-2">
                    {/* Integrated Search Bar */}
                    <div className="group relative order-2 min-w-0 flex-1">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-primary-700" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') onSearchSubmit?.(searchQuery); }}
                            placeholder="Search cleaning, sofa, deep clean..."
                            className="h-10 w-full min-w-[180px] rounded-lg border border-slate-200 bg-slate-100 pl-10 pr-8 text-sm font-medium text-slate-950 outline-none transition-all placeholder:text-slate-500 focus:border-primary-600 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                        />
                        {searchQuery && (
                            <button type="button" onClick={() => onSearchChange('')} aria-label="Clear search"
                                className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md bg-slate-200 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-300 hover:text-slate-950">
                                ×
                            </button>
                        )}
                    </div>

                    {/* Services Dropdown */}
                    <div className="relative order-1 shrink-0">
                        <button
                            onClick={() => setOpenDropdown(openDropdown === 'services' ? null : 'services')}
                            aria-haspopup="menu"
                            aria-expanded={openDropdown === 'services'}
                            className={`flex h-10 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 ${
                                openDropdown === 'services'
                                    ? 'border-slate-950 bg-slate-950 text-white shadow-sm'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-primary-300 hover:bg-primary-50 hover:text-slate-950'
                            }`}
                        >
                            <Grid3X3 size={13} />
                            Services & Packages
                            <ChevronDown size={12} className={`transition-transform ${openDropdown === 'services' ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {openDropdown === 'services' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.13 }}
                                    role="menu"
                                    className="absolute left-0 top-full z-50 mt-2 w-[min(860px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10"
                                >
                                    <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-3">
                                        <div>
                                            <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase text-white">
                                                <Grid3X3 size={13} className="text-primary-300" /> Services &amp; Packages
                                            </span>
                                            <p className="mt-1 text-[10px] font-medium text-gray-300">Choose a service or a ready-made package for your home.</p>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-300">{services.length} services · {packages.length} packages</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr]">
                                        <div className="p-3 md:border-r md:border-gray-100">
                                            <div className="mb-2 flex items-center justify-between">
                                                <p className="text-[10px] font-extrabold uppercase text-gray-600">Services</p>
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
                                                <p className="mb-2 text-[10px] font-extrabold uppercase text-gray-600">Most booked</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {popularServices.slice(0, 4).map(service => (
                                                        <button key={service.id} type="button" onClick={() => handleServiceClick(service)} role="menuitem"
                                                            className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-left transition-colors hover:border-primary-200 hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30">
                                                            <span className="block truncate text-[10px] font-extrabold text-gray-950">{service.name}</span>
                                                            <span className="text-[10px] font-extrabold text-primary-800">{formatServicePrice(service)}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border-t border-gray-100 bg-amber-50/50 p-3 md:border-t-0">
                                            <div className="mb-2 flex items-center justify-between">
                                                <div>
                                                    <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-amber-900"><Flame size={12} className="text-amber-700" /> Packages</p>
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
                                                            <span className="text-[10px] font-extrabold text-primary-800">{formatServicePrice(pkg)}</span>
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
                                        <span className="text-[10px] font-extrabold text-amber-700 uppercase">Hot Deals · Best Value</span>
                                    </div>
                                    <div className="p-2">
                                        {packages.map(pkg => (
                                            <button key={pkg.id} onClick={() => handleServiceClick(pkg)}
                                                role="menuitem"
                                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-amber-50 group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30">
                                                <span className="text-sm font-bold text-gray-950 group-hover:text-amber-900 leading-tight">{pkg.name}</span>
                                                <div className="flex flex-col items-end ml-2 flex-shrink-0">
                                                    <span className="text-[11px] font-extrabold text-primary-800">{formatServicePrice(pkg)}</span>
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
                 <div className="relative flex shrink-0 items-center gap-1.5">
                     <PwaInstallButton />
                     {user?.role === 'customer' ? <div className="relative">
                         <button
                             type="button"
                             onClick={() => setOpenDropdown(openDropdown === 'account' ? null : 'account')}
                             aria-haspopup="menu"
                             aria-expanded={openDropdown === 'account'}
                             className={`flex h-10 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 ${openDropdown === 'account' ? 'border-slate-950 bg-slate-950 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-primary-300 hover:bg-primary-50'}`}
                         >
                             <UserRound size={14} className={openDropdown === 'account' ? 'text-white' : 'text-primary-600'} />
                             <span>My account</span>
                             <ChevronDown size={12} className={`transition-transform ${openDropdown === 'account' ? 'rotate-180' : ''}`} />
                         </button>
                         <AnimatePresence>
                             {openDropdown === 'account' && <motion.div
                                 initial={{ opacity: 0, y: 6 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, y: 6 }}
                                 transition={{ duration: 0.13 }}
                                 role="menu"
                                 aria-label="My account pages"
                                 className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10"
                             >
                                 <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                                     <p className="text-[10px] font-semibold uppercase text-primary-700">My account</p>
                                     <p className="mt-1 truncate text-xs font-medium text-slate-700">{user.fullName || user.email || user.phone}</p>
                                 </div>
                                 <div className="p-2">
                                     <Link to="/dashboard" onClick={() => setOpenDropdown(null)} role="menuitem" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950">
                                         <Grid3X3 size={16} className="text-primary-600" /> Customer dashboard
                                     </Link>
                                     <Link to="/bookings" onClick={() => setOpenDropdown(null)} role="menuitem" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950">
                                         <ClipboardList size={16} className="text-primary-600" /> My bookings
                                     </Link>
                                     <Link to="/notifications" onClick={() => setOpenDropdown(null)} role="menuitem" className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950">
                                         <span className="flex items-center gap-3"><Bell size={16} className="text-primary-600" /> Notifications</span>
                                         {unreadNotificationCount > 0 && <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-black text-red-700">{unreadNotificationCount}</span>}
                                     </Link>
                                     <Link to="/profile" onClick={() => setOpenDropdown(null)} role="menuitem" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950">
                                         <UserRound size={16} className="text-primary-600" /> Profile settings
                                     </Link>
                                     <Link to="/wishlist" onClick={() => setOpenDropdown(null)} role="menuitem" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-rose-50 hover:text-rose-800">
                                         <Heart size={16} className="text-rose-600" /> Wishlist
                                     </Link>
                                 </div>
                             </motion.div>}
                         </AnimatePresence>
                     </div> : <button type="button" onClick={openCustomerAuth} className="flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-primary-300 hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"><UserRound size={14} className="text-primary-600" />Sign in</button>}
                      {user?.role === 'customer' && <button type="button" onClick={() => setOpenDropdown(openDropdown === 'notifications' ? null : 'notifications')} aria-haspopup="dialog" aria-expanded={openDropdown === 'notifications'} aria-label="Open notifications" title="Notifications" className={`relative flex h-10 w-10 items-center justify-center rounded-lg border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 ${openDropdown === 'notifications' ? 'border-primary-700 bg-primary-700 text-white' : 'border-slate-200 bg-white text-primary-700 hover:border-primary-300 hover:bg-primary-50'}`}><Bell size={15} />{unreadNotificationCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-0.5 text-[9px] font-black text-white">{unreadNotificationCount}</span>}</button>}
                    {/* My Wishlist Button */}
                    <div className="relative">
                        <button
                            onClick={() => { refreshLocals(); setOpenDropdown(openDropdown === 'wishlist' ? null : 'wishlist'); }}
                            aria-haspopup="menu"
                            aria-expanded={openDropdown === 'wishlist'}
                            className={`flex h-10 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30 ${
                                openDropdown === 'wishlist'
                                    ? 'border-rose-700 bg-rose-700 text-white shadow-sm'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-rose-300 hover:bg-rose-50'
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
                                    className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10"
                                >
                                    <div className="flex items-center justify-between border-b border-rose-200 bg-rose-50 px-4 py-3">
                                        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-rose-800">
                                            <Heart size={12} fill="currentColor" /> My Wishlist
                                        </span>
                                        <span className="text-[11px] font-bold text-rose-700">{wishlistIds.length} saved</span>
                                    </div>
                                    {wishlistIds.length === 0 ? (
                                        <div className="p-6 text-center">
                                            <Heart size={28} className="mx-auto mb-2 text-slate-300" />
                                            <p className="text-sm font-medium text-slate-800">No saved services yet.</p>
                                            <p className="mt-1 text-xs text-slate-500">Tap the heart icon on any service card to save it here.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-50 max-h-60 overflow-y-auto">
                                            {wishlistIds.map((id) => {
                                                const svc = wishlistCatalog.find(s => s.id === id);
                                                if (!svc) return null;
                                                return (
                                                    <div key={id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 group">
                                                        <SafeImage src={svc.image} alt="" className="w-9 h-9 rounded-lg object-cover flex-none border border-gray-100" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-gray-900 truncate">{svc.name}</p>
                                                            <p className="text-[11px] font-extrabold text-emerald-700">{formatServicePrice(svc)}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                void toggleWishlist(id);
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

                    {user?.role === 'customer' && openDropdown === 'notifications' && <NotificationPopover notifications={notifications} notificationsLoading={notificationsLoading} onMarkRead={markNotificationRead} onMarkAllRead={markAllNotificationsRead} onClose={() => setOpenDropdown(null)} />}

                    {/* My Bookings Button */}
                    <div className="relative">
                        <button
                            onClick={() => { refreshLocals(); setOpenDropdown(openDropdown === 'bookings' ? null : 'bookings'); }}
                            aria-haspopup="menu"
                            aria-expanded={openDropdown === 'bookings'}
                            className={`flex h-10 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 ${
                                openDropdown === 'bookings'
                                    ? 'border-primary-700 bg-primary-700 text-white shadow-sm'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-primary-300 hover:bg-primary-50'
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
                                    className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10"
                                >
                                    <div className="flex items-center justify-between border-b border-primary-200 bg-primary-50 px-4 py-3">
                                        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-primary-800">
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
