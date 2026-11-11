// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { Check, ClipboardList, Heart, Home, LayoutGrid, UserRound } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useBookings } from '../../context/BookingContext';

export const MobileNav: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { wishlistIds } = useWishlist();
    const { bookings } = useBookings();
    const [activeSection, setActiveSection] = useState(() => location.hash.replace('#', ''));
    const previousPathRef = useRef(location.pathname);
    const sectionNavigationRef = useRef(false);

    const isActive = (path: string) => location.pathname === path;
    const accountActive = ['/dashboard', '/profile', '/notifications'].includes(location.pathname);
    const accountLabel = user?.fullName?.split(' ')[0]?.trim() || user?.email?.split('@')[0]?.trim() || 'Account';

    useEffect(() => {
        setActiveSection(location.hash.replace('#', ''));
        const pathChanged = previousPathRef.current !== location.pathname;

        if (pathChanged && !sectionNavigationRef.current) {
            window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
        }

        sectionNavigationRef.current = false;
        previousPathRef.current = location.pathname;
    }, [location.pathname, location.hash]);

    const goToSection = (id: string) => {
        const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveSection(id);
        if (location.pathname !== '/') {
            sectionNavigationRef.current = true;
            navigate({ pathname: '/', hash: `#${id}` });
            window.setTimeout(scroll, 100);
        } else {
            navigate({ pathname: '/', hash: `#${id}` }, { replace: true });
            scroll();
        }
    };

    const goHome = () => {
        setActiveSection('');
        if (location.pathname !== '/') {
            navigate('/');
            return;
        }

        navigate('/', { replace: true });
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    };

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/90 bg-white/95 pb-safe-bottom shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-xl md:hidden">
            <div className="mx-auto flex h-14 max-w-md items-center justify-around px-2">
                {/* 1. Home */}
                <NavItem
                    to="/"
                    icon={<Home size={20} strokeWidth={isActive('/') && !activeSection ? 2.5 : 1.75} />}
                    label="Home"
                    active={isActive('/') && !activeSection}
                    onClick={goHome}
                />

                {/* 2. Services / Categories */}
                <NavItem
                    to="/"
                    icon={<LayoutGrid size={20} strokeWidth={location.pathname === '/' && activeSection === 'services' ? 2.5 : 1.75} />}
                    label="Services"
                    active={location.pathname === '/' && activeSection === 'services'}
                    onClick={() => goToSection('services')}
                />

                {/* 3. My Bookings with badge */}
                <NavItem
                    to="/bookings"
                    icon={
                        <span className="relative inline-flex items-center justify-center">
                            <ClipboardList size={20} strokeWidth={isActive('/bookings') ? 2.5 : 1.75} />
                            {bookings.length > 0 && (
                                <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-700 px-1 text-[9px] font-black text-white shadow-2xs">
                                    {bookings.length}
                                </span>
                            )}
                        </span>
                    }
                    label="Bookings"
                    active={isActive('/bookings')}
                />

                {/* 4. Wishlist with badge */}
                <NavItem
                    to="/wishlist"
                    icon={
                        <span className="relative inline-flex items-center justify-center">
                            <Heart size={20} strokeWidth={isActive('/wishlist') ? 2.5 : 1.75} className={wishlistIds.length > 0 ? 'fill-rose-500 text-rose-500' : ''} />
                            {wishlistIds.length > 0 && (
                                <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-black text-white shadow-2xs">
                                    {wishlistIds.length}
                                </span>
                            )}
                        </span>
                    }
                    label="Wishlist"
                    active={isActive('/wishlist')}
                />

                {/* 5. Account / Sign In */}
                {user?.role === 'customer' ? (
                    <NavItem
                        to="/dashboard"
                        icon={
                            <span className="relative inline-flex items-center justify-center">
                                <UserRound size={20} strokeWidth={accountActive ? 2.5 : 1.75} />
                                <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white">
                                    <Check size={8} strokeWidth={4} />
                                </span>
                            </span>
                        }
                        label={accountLabel}
                        active={accountActive}
                    />
                ) : (
                    <NavItem
                        to={location.pathname}
                        icon={<UserRound size={20} strokeWidth={1.75} />}
                        label="Sign in"
                        active={false}
                        onClick={() => navigate(location.pathname, { state: { openAuth: true, from: location.pathname } })}
                    />
                )}
            </div>
        </div>
    );
};

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active, onClick }) => {
    return (
        <Link
            to={to}
            onClick={(event) => {
                if (onClick) {
                    event.preventDefault();
                    onClick();
                }
            }}
            className={`relative flex h-12 flex-1 min-w-0 flex-col items-center justify-center gap-1 rounded-xl transition-all active:scale-95 ${
                active
                    ? 'text-primary-700 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
        >
            <div className="flex h-5 items-center justify-center">
                {icon}
            </div>
            <span className={`max-w-full truncate px-0.5 text-[10px] leading-none ${
                active ? 'text-primary-700 font-extrabold' : 'text-slate-500 font-medium'
            }`}>
                {label}
            </span>
            {active && (
                <span className="absolute -bottom-1 h-0.5 w-4 rounded-full bg-primary-700"></span>
            )}
        </Link>
    );
};
