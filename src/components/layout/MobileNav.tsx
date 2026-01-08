// @ts-nocheck
import React from 'react';
import { Home, LayoutGrid, Tag } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const MobileNav: React.FC = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 pb-safe-bottom z-50 md:hidden shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] rounded-t-[20px]">
            <div className="flex items-center justify-around h-[4.5rem] px-6">
                <NavItem
                    to="#offers"
                    icon={isActive('/offers') ? <Tag size={24} fill="currentColor" /> : <Tag size={24} />}
                    label="Offers"
                    active={isActive('/offers')}
                />

                <NavItem
                    to="#categories"
                    icon={isActive('/categories') ? <LayoutGrid size={24} fill="currentColor" /> : <LayoutGrid size={24} />}
                    label="Categories"
                    active={isActive('/categories')}
                    onClick={() => document.getElementById('categories-rail')?.scrollIntoView({ behavior: 'smooth' })}
                />

                <NavItem
                    to="/"
                    icon={isActive('/') ? <Home size={24} fill="currentColor" /> : <Home size={24} />}
                    label="Home"
                    active={isActive('/')}
                />
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
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-20 space-y-1.5 transition-colors relative ${active ? 'text-primary-600' : 'text-gray-400 hover:text-gray-500'}`}
        >
            <div className={`transition-all duration-300 ${active ? 'scale-110 -translate-y-1' : 'scale-100'}`}>
                {icon}
            </div>
            <span className={`text-[10px] font-bold ${active ? 'text-primary-600' : 'text-gray-400'}`}>
                {label}
            </span>
            {active && (
                <span className="w-1 h-1 bg-primary-600 rounded-full absolute -bottom-1"></span>
            )}
        </Link>
    );
};
