import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { DesktopPageHeader } from '../feature/DesktopPageHeader';
import { CustomerAuthModal } from '../feature/CustomerAuthModal';
import { CookieConsentBanner } from './CookieConsentBanner';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps {
    children: React.ReactNode;
    hideFooter?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, hideFooter = false }) => {
    const [mobileSearchQuery, setMobileSearchQuery] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const { passwordRecovery, clearPasswordRecovery } = useAuth();
    const isHomePage = location.pathname === '/';
    const appShell = 'mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8';
    const routeState = (location.state || {}) as { openAuth?: boolean; from?: string; authMode?: 'login' | 'signup' };
    const authRequested = Boolean(routeState.openAuth);
    const [isAuthOpen, setIsAuthOpen] = useState(authRequested || passwordRecovery);

    useEffect(() => {
        setIsAuthOpen(authRequested || passwordRecovery);
    }, [authRequested, passwordRecovery]);

    const closeAuth = () => {
        setIsAuthOpen(false);
        clearPasswordRecovery();
        if (authRequested) navigate(location.pathname, { replace: true, state: null });
    };

    return (
        <div dir="ltr" className="min-h-screen flex flex-col bg-white pb-20 md:pb-0">
            {!isHomePage && (
                <DesktopPageHeader
                    searchQuery={mobileSearchQuery}
                    onSearchChange={setMobileSearchQuery}
                    onSearchSubmit={(query) => navigate('/', { state: { searchQuery: query } })}
                    sortBy="popular"
                    onSortChange={() => undefined}
                    totalDealsCount={0}
                    onServiceSelect={(service) => navigate('/', { state: { serviceId: service.id } })}
                    onCategorySelect={(category) => navigate('/', { state: { selectedCategory: category } })}
                />
            )}

            <main className="flex-grow pt-0">
                {isHomePage ? (
                    children
                ) : (
                    <div className={appShell}>
                        {children}
                    </div>
                )}
            </main>

            {!hideFooter && <div className="hidden md:block"><Footer /></div>}

            <MobileNav />
            <CookieConsentBanner />
            <CustomerAuthModal
                isOpen={isAuthOpen}
                onClose={closeAuth}
                destination={routeState.from || location.pathname}
                initialMode={passwordRecovery ? 'reset' : (routeState.authMode || 'login')}
            />
        </div>
    );
};
