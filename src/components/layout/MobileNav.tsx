import React, { useEffect, useRef, useState } from 'react';
import { Home, LayoutGrid, ClipboardList, CircleHelp, Star } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const MobileNav: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState(() => location.hash.replace('#', ''));
    const previousPathRef = useRef(location.pathname);
    const sectionNavigationRef = useRef(false);
    const isActive = (path: string) => location.pathname === path;

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
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200/80 bg-white/95 pb-safe-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.06)] backdrop-blur-xl md:hidden">
            <div className="mx-auto flex h-12 max-w-md items-center gap-0 px-0">
                <NavItem
                    to="/faq"
                    icon={<CircleHelp size={18} />}
                    label="FAQ"
                    active={isActive('/faq')}
                />

                <NavItem
                    to="/"
                    icon={<LayoutGrid size={18} />}
                    label="Categories"
                    active={location.pathname === '/' && activeSection === 'services'}
                    onClick={() => goToSection('services')}
                />

                <NavItem
                    to="/"
                    icon={<Home size={19} strokeWidth={2.5} />}
                    label="Home"
                    active={isActive('/') && !activeSection}
                    prominent
                    onClick={goHome}
                />

                <NavItem to="/reviews" icon={<Star size={18} />} label="Reviews" active={isActive('/reviews')} />
                <NavItem to="/bookings" icon={<ClipboardList size={18} />} label="Bookings" active={isActive('/bookings')} />
            </div>
        </div>
    );
};

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    active: boolean;
    prominent?: boolean;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active, prominent = false, onClick }) => {
    return (
        <Link
            to={to}
            onClick={(event) => {
                if (onClick) {
                    event.preventDefault();
                    onClick();
                }
            }}
            className={`relative mx-0.5 flex h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
                prominent && active
                    ? 'bg-primary-700 text-white shadow-md shadow-primary-700/20'
                    : active
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
        >
            <div className="flex h-5 items-center justify-center">
                {icon}
            </div>
            <span className={`max-w-full truncate px-0.5 text-[9px] font-semibold leading-3 ${
                prominent && active ? 'text-white' : active ? 'text-primary-700' : 'text-gray-500'
            }`}>
                {label}
            </span>
            {active && !prominent && (
                <span className="absolute bottom-0.5 h-0.5 w-5 rounded-full bg-primary-600"></span>
            )}
        </Link>
    );
};
