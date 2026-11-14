// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
    Search, Flame, ChevronDown,
    Home, Sofa, Sparkles, Briefcase, Heart, Shirt, Tag,
    Grid3X3, ClipboardList, X, Calendar, Bell, UserRound,
    LogOut, CircleHelp, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, Service } from '../../types';
import { CitySelector } from './CitySelector';
import { SafeImage } from '../ui/SafeImage';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../context/BookingContext';
import { useCatalog } from '../../context/CatalogContext';
import { AppDownloadButton } from './AppDownloadButton';
import { getPriceUnitLabel } from '../../lib/pricing';
import { NotificationPopover } from './NotificationPopover';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

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
}

const formatServicePrice = (service: Service, language: Parameters<typeof getPriceUnitLabel>[1]) => `${service.price} AED · ${getPriceUnitLabel(service, language)}`;

export const DesktopPageHeader: React.FC<DesktopPageHeaderProps> = ({
    searchQuery,
    onSearchChange,
    onSearchSubmit,
    onServiceSelect,
    onCategorySelect,
}) => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user, logout } = useAuth();
    const { wishlistIds, toggleWishlist } = useWishlist();
    const { bookings, notifications, notificationsLoading, unreadNotificationCount, markNotificationRead, markAllNotificationsRead } = useBookings();
    const { services, packages } = useCatalog();
    const { language, t } = useLanguage();
    const wishlistCatalog = [...services, ...packages];

    const savedBookings = bookings;

    // Close dropdown on outside click or Escape
    useEffect(() => {
        const fn = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpenDropdown(null);
            }
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpenDropdown(null);
        };
        document.addEventListener('mousedown', fn);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', fn);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, []);

    const servicesByCategory = CATEGORIES.reduce((acc, cat) => {
        acc[cat] = services.filter(s => (s.categoryKey || s.category) === cat);
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

    const openCustomerAuth = (mode = 'login') => {
        setOpenDropdown(null);
        navigate(location.pathname, { state: { openAuth: true, authMode: mode, from: location.pathname } });
    };

    const handleLogout = async () => {
        setOpenDropdown(null);
        await logout();
        navigate('/');
    };

    const toggleNotifications = () => {
        setOpenDropdown(openDropdown === 'notifications' ? null : 'notifications');
    };

    return (
        <div ref={dropdownRef}>
            {/* ═══════════════════════════════════════════════════════════
                MOBILE HEADER (Hidden on desktop)
            ═══════════════════════════════════════════════════════════ */}
            <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-2xs backdrop-blur-md md:hidden">
                <div className="flex h-14 items-center justify-between gap-3 px-3.5">
                    {/* Brand & Location */}
                    <Link to="/" className="flex shrink-0 items-center gap-2 rounded-xl focus:outline-none" aria-label="Purity home">
                        <img src="/logo.png" alt="Purity" width={32} height={32} className="h-8 w-8 rounded-lg object-contain shadow-2xs" />
                        <div className="flex flex-col">
                            <span className="font-black text-base tracking-tight text-slate-950 leading-none">Purity</span>
                            <span className="text-[9px] font-semibold text-slate-400 leading-none mt-0.5">{t('services')}</span>
                        </div>
                    </Link>

                    {/* Uncluttered Essential Mobile Actions: Location + Search + Notifications */}
                    <div className="flex items-center gap-2">
                        <CitySelector dense />
                        <LanguageSwitcher compact />

                        {/* Search toggle */}
                        <button
                            type="button"
                            onClick={() => { setIsMobileSearchOpen(v => !v); setOpenDropdown(null); }}
                            aria-label={t('services')}
                            aria-expanded={isMobileSearchOpen}
                            className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all active:scale-95 ${
                                isMobileSearchOpen
                                    ? 'border-primary-600 bg-primary-700 text-white'
                                    : 'border-slate-200/90 bg-slate-50 text-slate-700 hover:bg-white'
                            }`}
                        >
                            <Search size={14} />
                        </button>

                        {/* Notifications */}
                        <button
                            type="button"
                            onClick={toggleNotifications}
                            aria-label={t('notifications')}
                            aria-expanded={openDropdown === 'notifications'}
                            className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition-all active:scale-95 ${
                                openDropdown === 'notifications'
                                    ? 'border-primary-600 bg-primary-700 text-white'
                                    : 'border-slate-200/90 bg-slate-50 text-slate-700 hover:bg-white'
                            }`}
                        >
                            <Bell size={14} />
                            {unreadNotificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-black text-white px-0.5 shadow-2xs">
                                    {unreadNotificationCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Search Expandable Bar */}
                {isMobileSearchOpen && (
                    <div className="border-t border-slate-100 bg-slate-50/70 px-3.5 py-2.5">
                        <div className="relative group">
                            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') onSearchSubmit?.(searchQuery); }}
                                placeholder={t('searchPlaceholder')}
                                className="h-9 w-full rounded-full border border-slate-200 bg-white pl-9 pr-8 text-xs font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                autoFocus
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => onSearchChange('')}
                                    aria-label={t('clearAll')}
                                    className="absolute right-2.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-300"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <AnimatePresence>
                    {user?.role === 'customer' && openDropdown === 'notifications' && (
                        <NotificationPopover notifications={notifications} notificationsLoading={notificationsLoading} onMarkRead={markNotificationRead} onMarkAllRead={markAllNotificationsRead} onClose={() => setOpenDropdown(null)} mobile />
                    )}
                </AnimatePresence>
            </header>

            {/* ═══════════════════════════════════════════════════════════
                DESKTOP HEADER — Ultra-Professional, Harmonious 3-Column Layout
            ═══════════════════════════════════════════════════════════ */}
            <header className="sticky top-0 z-50 hidden border-b border-slate-200/80 bg-white/95 shadow-2xs backdrop-blur-md md:block">
                <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-4 lg:px-6">

                    {/* ── 1. LEFT: BRAND & LOCATION CHIP ── */}
                    <div className="flex shrink-0 items-center gap-3">
                        <Link to="/" aria-label="Purity home" className="group flex items-center gap-2.5 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40">
                            <img src="/logo.png" alt="Purity" width={38} height={38} className="h-9 w-9 rounded-xl object-contain shadow-2xs transition duration-200 group-hover:scale-105" />
                            <div className="flex flex-col">
                                <span className="font-black text-lg tracking-tight text-slate-950 leading-none">Purity</span>
                                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase leading-none mt-1">{t('services')}</span>
                            </div>
                        </Link>
                        <CitySelector dense />
                    </div>

                    {/* ── 2. CENTER: SCULPTED SEARCH BAR ── */}
                    <div className="flex flex-1 justify-center max-w-xs md:max-w-sm lg:max-w-md mx-2">
                        <div className={`group relative flex h-10 w-full items-center rounded-full border transition-all duration-200 ${
                            searchQuery
                                ? 'border-primary-500 bg-white ring-3 ring-primary-500/15 shadow-2xs'
                                : 'border-slate-200/90 bg-slate-50/70 hover:border-slate-300 hover:bg-white focus-within:border-primary-500 focus-within:bg-white focus-within:ring-3 focus-within:ring-primary-500/15 focus-within:shadow-2xs'
                        }`}>
                            <div className="pl-3.5 pr-2 flex items-center text-slate-400 group-focus-within:text-primary-600 transition-colors shrink-0">
                                <Search size={15} strokeWidth={2.2} />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') onSearchSubmit?.(searchQuery); }}
                                placeholder={t('searchPlaceholder')}
                                aria-label={t('services')}
                                className="h-full min-w-0 flex-1 bg-transparent pr-2 text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => onSearchChange('')}
                                    aria-label={t('clearAll')}
                                    className="mr-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-800 transition"
                                >
                                    <X size={11} strokeWidth={2.5} />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => onSearchSubmit?.(searchQuery)}
                                aria-label={t('search')}
                                className="mr-1 flex h-8 px-3.5 shrink-0 items-center justify-center rounded-full bg-primary-700 text-xs font-bold text-white transition hover:bg-primary-800 active:scale-95 shadow-2xs"
                            >
                                {t('search')}
                            </button>
                        </div>
                    </div>

                    {/* ── 3. RIGHT: BALANCED ACTIONS & USER PROFILE ── */}
                    <div className="ml-auto flex shrink-0 items-center gap-1.5">
                        <LanguageSwitcher />

                        {/* Services Mega-menu trigger */}
                        <div className="relative shrink-0">
                            <button
                                type="button"
                                onClick={() => setOpenDropdown(openDropdown === 'services' ? null : 'services')}
                                aria-haspopup="menu"
                                aria-expanded={openDropdown === 'services'}
                                className={`inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition-all ${
                                    openDropdown === 'services'
                                        ? 'bg-primary-50 text-primary-800 ring-1 ring-primary-500/20'
                                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                                }`}
                            >
                                <Grid3X3 size={15} className={openDropdown === 'services' ? 'text-primary-700' : 'text-slate-500'} />
                                <span className="hidden lg:inline">{t('services')}</span>
                                <ChevronDown size={12} strokeWidth={2.5} className={`text-slate-400 transition-transform duration-200 ${openDropdown === 'services' ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {openDropdown === 'services' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 6, scale: 0.98 }} transition={{ duration: 0.14 }}
                                        role="menu"
                                        className="absolute left-0 top-full z-[70] mt-3 w-[min(820px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-slate-950/15"
                                    >
                                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-5 py-3.5">
                                            <div>
                                                <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white">
                                                    <Grid3X3 size={13} className="text-primary-300" /> {t('services')} &amp; {t('packages')}
                                                </span>
                                                <p className="mt-0.5 text-xs text-slate-400">{t('chooseServicePackage')}</p>
                                            </div>
                                            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-slate-300">
                                                {services.length} {t('serviceCount')} · {packages.length} {t('packageCount')}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr]">
                                            <div className="p-4 md:border-r md:border-slate-100">
                                                <div className="mb-2.5 flex items-center justify-between">
                                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{t('categories')}</p>
                                                    <button type="button" onClick={handleAllServicesClick} className="text-xs font-bold text-primary-700 hover:text-primary-900">
                                                        {t('browseAll')}
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    {CATEGORIES.map(cat => (
                                                        <button key={cat} type="button" role="menuitem" onClick={() => handleCategoryClick(cat)}
                                                            className="group flex items-center gap-2.5 rounded-xl p-2.5 text-left transition-colors hover:bg-slate-50 focus:outline-none focus:bg-slate-50">
                                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700 group-hover:bg-primary-100 transition-colors">
                                                                {getCategoryIcon(cat)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <span className="block truncate text-xs font-bold text-slate-900 group-hover:text-primary-700">{servicesByCategory[cat]?.[0]?.category || cat}</span>
                                                                <span className="text-[10px] text-slate-500">{(servicesByCategory[cat] || []).length} {t('serviceCount')}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="mt-3.5 border-t border-slate-100 pt-3">
                                                <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">{t('mostBooked')}</p>
                                                    <div className="grid grid-cols-2 gap-1.5">
                                                        {popularServices.slice(0, 4).map(service => (
                                                            <button key={service.id} type="button" role="menuitem" onClick={() => handleServiceClick(service)}
                                                                className="group flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-2 text-left transition-colors hover:border-primary-200 hover:bg-primary-50/50">
                                                                <SafeImage src={service.image} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
                                                                <div className="min-w-0 flex-1">
                                                                    <span className="block truncate text-[11px] font-bold text-slate-900 group-hover:text-primary-700">{service.name}</span>
                                                                    <span className="text-[10px] font-bold text-primary-700">{formatServicePrice(service, language)}</span>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-amber-50/30 p-4">
                                                <div className="mb-2.5 flex items-center justify-between">
                                                    <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-900">
                                                        <Flame size={12} className="text-amber-500" /> {t('hotDeals')}
                                                    </p>
                                                    <button type="button" onClick={() => { setOpenDropdown(null); scrollTo('packages'); }} className="text-xs font-bold text-amber-900 hover:underline">
                                                        {t('viewAll')}
                                                    </button>
                                                </div>
                                                <div className="space-y-1.5">
                                                    {packages.map(pkg => (
                                                        <button key={pkg.id} type="button" role="menuitem" onClick={() => handleServiceClick(pkg)}
                                                            className="flex w-full items-center gap-2.5 rounded-xl border border-amber-100 bg-white p-2 text-left transition-colors hover:border-amber-300 hover:bg-amber-50 focus:outline-none">
                                                            <SafeImage src={pkg.image} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                                                            <span className="min-w-0 flex-1">
                                                                <span className="block truncate text-[11px] font-bold text-slate-900">{pkg.name}</span>
                                                                <span className="text-[10px] font-bold text-primary-700">{formatServicePrice(pkg, language)}</span>
                              </span>
                                                            {pkg.offerTag && (
                                                                <span className="shrink-0 rounded-full border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-900">
                                                                    {pkg.offerTag}
                                                                </span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* App Download — hidden on tablet, shown on xl desktop */}
                        <div className="hidden xl:block">
                            <AppDownloadButton
                                isOpen={openDropdown === 'app'}
                                onToggle={() => setOpenDropdown(openDropdown === 'app' ? null : 'app')}
                                onClose={() => setOpenDropdown(null)}
                            />
                        </div>

                        {/* Wishlist */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setOpenDropdown(openDropdown === 'wishlist' ? null : 'wishlist')}
                                aria-haspopup="menu"
                                aria-expanded={openDropdown === 'wishlist'}
                                                aria-label={t('wishlist')}
                                                title={t('wishlist')}
                                className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                                    openDropdown === 'wishlist'
                                        ? 'bg-rose-50 text-rose-600'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <Heart size={18} strokeWidth={1.75} className={wishlistIds.length > 0 ? 'fill-rose-500 text-rose-500' : ''} />
                                {wishlistIds.length > 0 && (
                                    <span className="absolute 1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-black text-white shadow-2xs">
                                        {wishlistIds.length}
                                    </span>
                                )}
                            </button>

                            <AnimatePresence>
                                {openDropdown === 'wishlist' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.14 }}
                                        role="menu"
                                        className="absolute right-0 top-full z-[70] mt-3 w-80 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-slate-950/15"
                                    >
                                        <div className="flex items-center justify-between border-b border-slate-100 bg-rose-50 px-4 py-3.5">
                                            <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-rose-800">
                                                <Heart size={12} fill="currentColor" /> {t('wishlist')}
                                            </span>
                                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">{wishlistIds.length} saved</span>
                                        </div>
                                        {wishlistIds.length === 0 ? (
                                            <div className="px-4 py-8 text-center">
                                                <Heart size={32} className="mx-auto mb-3 text-slate-200" strokeWidth={1} />
                                                <p className="text-sm font-semibold text-slate-700">{t('noServices')}</p>
                                                <p className="mt-1 text-xs text-slate-400">{t('tapHeart')}</p>
                                            </div>
                                        ) : (
                                            <div className="max-h-64 divide-y divide-slate-50 overflow-y-auto">
                                                {wishlistIds.map((id) => {
                                                    const svc = wishlistCatalog.find(s => s.id === id);
                                                    if (!svc) return null;
                                                    return (
                                                        <div key={id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50">
                                                            <SafeImage src={svc.image} alt="" className="h-10 w-10 shrink-0 rounded-xl border border-slate-100 object-cover" />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-xs font-bold text-slate-900">{svc.name}</p>
                                                                <p className="text-[11px] font-semibold text-primary-700">{formatServicePrice(svc, language)}</p>
                                                            </div>
                                                            <button type="button" onClick={() => void toggleWishlist(id)} aria-label={`Remove ${svc.name}`}
                                                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus:outline-none">
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        <div className="border-t border-slate-100 px-4 py-2.5">
                                            <Link to="/wishlist" onClick={() => setOpenDropdown(null)} className="block text-center text-xs font-bold text-primary-700 hover:text-primary-900">
                                                {t('viewAllSaved')} →
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={toggleNotifications}
                                aria-haspopup="dialog"
                                aria-expanded={openDropdown === 'notifications'}
                                aria-label={t('notifications')}
                                title={t('notifications')}
                                className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                                    openDropdown === 'notifications'
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <Bell size={18} strokeWidth={1.75} />
                                {unreadNotificationCount > 0 && (
                                    <span className="absolute 1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white shadow-2xs">
                                        {unreadNotificationCount}
                                    </span>
                                )}
                            </button>
                            {openDropdown === 'notifications' && (
                                user?.role === 'customer' ? (
                                    <NotificationPopover notifications={notifications} notificationsLoading={notificationsLoading} onMarkRead={markNotificationRead} onMarkAllRead={markAllNotificationsRead} onClose={() => setOpenDropdown(null)} />
                                ) : (
                                    <div role="dialog" className="absolute right-0 top-full z-[70] mt-3 w-80 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-slate-950/15">
                                        <div className="border-b border-slate-100 bg-primary-50 px-4 py-3.5">
                                            <p className="text-[11px] font-black uppercase tracking-widest text-primary-800 flex items-center gap-2"><Bell size={13} /> {t('notifications')}</p>
                                        </div>
                                        <div className="px-4 py-8 text-center">
                                            <Bell size={32} className="mx-auto mb-3 text-slate-200" strokeWidth={1} />
                                            <p className="text-sm font-semibold text-slate-700">{t('signInToNotifications')}</p>
                                            <p className="mt-1 text-xs text-slate-400">{t('bookingUpdates')}</p>
                                            <button type="button" onClick={() => { setOpenDropdown(null); openCustomerAuth('login'); }} className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-700 px-4 py-2 text-xs font-bold text-white hover:bg-primary-800">Sign in →</button>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>

                        {/* My Bookings Quick Button */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setOpenDropdown(openDropdown === 'bookings' ? null : 'bookings')}
                                aria-haspopup="menu"
                                aria-expanded={openDropdown === 'bookings'}
                                aria-label="My Bookings"
                                title="My Bookings"
                                className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                                    openDropdown === 'bookings'
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <ClipboardList size={18} strokeWidth={1.75} className={savedBookings.length > 0 ? 'text-primary-700' : ''} />
                                {savedBookings.length > 0 && (
                                    <span className="absolute 1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-700 px-1 text-[9px] font-black text-white shadow-2xs">
                                        {savedBookings.length}
                                    </span>
                                )}
                            </button>

                            <AnimatePresence>
                                {openDropdown === 'bookings' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.14 }}
                                        role="menu"
                                        className="absolute right-0 top-full z-[70] mt-3 w-80 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-slate-950/15"
                                    >
                                        <div className="flex items-center justify-between border-b border-slate-100 bg-primary-50 px-4 py-3.5">
                                            <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-primary-800">
                                                <ClipboardList size={12} /> {t('myBookings')}
                                            </span>
                                            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700">{savedBookings.length} {t('requests')}</span>
                                        </div>
                                        {savedBookings.length === 0 ? (
                                            <div className="px-4 py-8 text-center">
                                                <ClipboardList size={32} className="mx-auto mb-3 text-slate-200" strokeWidth={1} />
                                                <p className="text-sm font-semibold text-slate-700">{t('noBookings')}</p>
                                                <p className="mt-1 text-xs text-slate-400">Your confirmed bookings will appear here.</p>
                                            </div>
                                        ) : (
                                            <div className="max-h-72 divide-y divide-slate-50 overflow-y-auto">
                                                {[...savedBookings].reverse().map((b) => (
                                                    <div key={b.id} className="px-4 py-3 transition-colors hover:bg-slate-50">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <p className="truncate text-xs font-bold text-slate-900">{b.serviceName}</p>
                                                                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                                                                    <Calendar size={10} /> {b.date} · {b.time}
                                                                </p>
                                                            </div>
                                                            <div className="shrink-0 text-right">
                                                                <span className="block text-xs font-bold text-emerald-700">{b.totalPrice} AED</span>
                                                                <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
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
                                        <div className="border-t border-slate-100 px-4 py-2.5">
                                            <Link to="/bookings" onClick={() => setOpenDropdown(null)} className="block text-center text-xs font-bold text-primary-700 hover:text-primary-900">
                                                {t('viewAllBookings')} →
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <span className="mx-0.5 h-5 w-px bg-slate-200" aria-hidden="true" />

                        {/* ── ACCOUNT PILL & SIGN IN DROPDOWN ── */}
                        <div className="relative">
                            {user?.role === 'customer' ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setOpenDropdown(openDropdown === 'account' ? null : 'account')}
                                        aria-haspopup="menu"
                                        aria-expanded={openDropdown === 'account'}
                                        aria-label="My Account"
                                        className={`inline-flex h-10 items-center gap-2 rounded-full border px-3 text-xs font-bold transition-all shadow-2xs ${
                                            openDropdown === 'account'
                                                ? 'border-primary-600 bg-primary-50 text-primary-950 ring-2 ring-primary-500/20'
                                                : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-700 text-[11px] font-black text-white uppercase shadow-2xs">
                                            {user.fullName ? user.fullName.trim()[0] : (user.email ? user.email[0].toUpperCase() : 'U')}
                                        </div>
                                        <span className="max-w-[100px] truncate">{user.fullName?.split(' ')[0] || 'My Account'}</span>
                                        <ChevronDown size={12} strokeWidth={2.5} className={`text-slate-400 transition-transform duration-200 ${openDropdown === 'account' ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {openDropdown === 'account' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.14 }}
                                                role="menu"
                                                className="absolute right-0 top-full z-[70] mt-3 w-80 overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left shadow-2xl shadow-slate-950/15"
                                            >
                                                <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-700 text-sm font-black text-white shadow-sm">
                                                            {user.fullName ? user.fullName.trim()[0] : (user.email ? user.email[0].toUpperCase() : 'U')}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-bold text-slate-950">{user.fullName || 'Valued Customer'}</p>
                                                            <p className="truncate text-xs text-slate-500">{user.email || user.phone || 'Customer Account'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/60 pt-2 text-[11px]">
                                                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                                                            <CheckCircle2 size={12} /> Active Account
                                                        </span>
                                                        <span className="font-semibold text-slate-400">Purity Member</span>
                                                    </div>
                                                </div>
                                                <div className="p-2 space-y-0.5">
                                                    <Link to="/dashboard" onClick={() => setOpenDropdown(null)} role="menuitem" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950">
                                                        <Grid3X3 size={16} className="text-primary-600" /> {t('customerDashboard')}
                                                    </Link>
                                                    <Link to="/bookings" onClick={() => setOpenDropdown(null)} role="menuitem" className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950">
                                                        <div className="flex items-center gap-3">
                                                            <ClipboardList size={16} className="text-primary-600" /> {t('myBookings')}
                                                        </div>
                                                        {savedBookings.length > 0 && (
                                                            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700">
                                                                {savedBookings.length}
                                                            </span>
                                                        )}
                                                    </Link>
                                                    <Link to="/profile" onClick={() => setOpenDropdown(null)} role="menuitem" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950">
                                                        <UserRound size={16} className="text-primary-600" /> {t('profileSettings')}
                                                    </Link>
                                                    <Link to="/wishlist" onClick={() => setOpenDropdown(null)} role="menuitem" className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-rose-50 hover:text-rose-800">
                                                        <div className="flex items-center gap-3">
                                                            <Heart size={16} className="text-rose-600" /> Wishlist
                                                        </div>
                                                        {wishlistIds.length > 0 && (
                                                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                                                                {wishlistIds.length}
                                                            </span>
                                                        )}
                                                    </Link>
                                                    <Link to="/faq" onClick={() => setOpenDropdown(null)} role="menuitem" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950">
                                                        <CircleHelp size={16} className="text-slate-500" /> {t('helpFaqs')}
                                                    </Link>
                                                </div>
                                                <div className="border-t border-slate-100 p-2">
                                                    <button
                                                        type="button"
                                                        onClick={handleLogout}
                                                        role="menuitem"
                                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700"
                                                    >
                                                        <LogOut size={16} />
                                                        <span>{t('signOut')}</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => openCustomerAuth('login')}
                                        aria-label={t('signIn')}
                                        className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-800 transition-all shadow-2xs hover:border-slate-300 hover:bg-slate-50"
                                    >
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                                            <UserRound size={13} strokeWidth={2} />
                                        </div>
                                        <span>{t('signIn')}</span>
                                        <ChevronDown size={12} strokeWidth={2.5} className="text-slate-400" />
                                    </button>
                                    <AnimatePresence>
                                        {openDropdown === 'account' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                                transition={{ duration: 0.14 }}
                                                role="menu"
                                                className="absolute right-0 top-full z-[70] mt-3 w-80 overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left shadow-2xl shadow-slate-950/15"
                                            >
                                                <div className="border-b border-slate-100 bg-gradient-to-b from-primary-50/70 to-white p-4">
                                                    <p className="text-xs font-semibold text-slate-500">{t('home')}</p>
                                                    <h4 className="mt-0.5 text-base font-extrabold text-slate-950">{t('bookManageServices')}</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => openCustomerAuth('login')}
                                                        className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary-700 px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-800 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                                                    >
                                                        <UserRound size={16} /> {t('signIn')}
                                                    </button>
                                                    <p className="mt-2.5 text-center text-xs text-slate-500">
                                                        {t('newCustomer')}{' '}
                                                        <button
                                                            type="button"
                                                            onClick={() => openCustomerAuth('signup')}
                                                            className="font-bold text-primary-700 hover:text-primary-800 hover:underline focus:outline-none"
                                                        >
                                                            {t('createAccount')}
                                                        </button>
                                                    </p>
                                                </div>

                                                <div className="p-2 space-y-0.5">
                                                    <Link
                                                        to="/bookings"
                                                        onClick={() => setOpenDropdown(null)}
                                                        role="menuitem"
                                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                                                    >
                                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                                                            <ClipboardList size={16} />
                                                        </span>
                                                        <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-bold text-slate-900">{t('myBookings')}</p>
                                                            <p className="text-[11px] text-slate-500 truncate">{t('viewTrackAppointments')}</p>
                                                        </div>
                                                    </Link>

                                                    <Link
                                                        to="/wishlist"
                                                        onClick={() => setOpenDropdown(null)}
                                                        role="menuitem"
                                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-rose-50/70 hover:text-rose-950"
                                                    >
                                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                                                            <Heart size={16} />
                                                        </span>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-bold text-slate-900">Saved Wishlist</p>
                                                            <p className="text-[11px] text-slate-500 truncate">{t('savedDealsFavorites')}</p>
                                                        </div>
                                                        {wishlistIds.length > 0 && (
                                                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                                                                {wishlistIds.length}
                                                            </span>
                                                        )}
                                                    </Link>

                                                    <Link
                                                        to="/faq"
                                                        onClick={() => setOpenDropdown(null)}
                                                        role="menuitem"
                                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                                                    >
                                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                                                            <CircleHelp size={16} />
                                                        </span>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-bold text-slate-900">{t('helpFaqs')}</p>
                                                            <p className="text-[11px] text-slate-500 truncate">{t('support')}</p>
                                                        </div>
                                                    </Link>
                                                </div>

                                                <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2 flex items-center justify-between text-[11px]">
                                                    <span className="text-slate-400 font-medium">Purity Cleaning</span>
                                                    <Link
                                                        to="/admin/login"
                                                        onClick={() => setOpenDropdown(null)}
                                                        className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-800 transition"
                                                    >
                                                        <ShieldCheck size={13} /> Admin Portal
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            </header>
        </div>
    );
};
