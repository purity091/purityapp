import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { DesktopPageHeader } from '../feature/DesktopPageHeader';

interface LayoutProps {
    children: React.ReactNode;
    hideFooter?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, hideFooter = false }) => {
    const [mobileSearchQuery, setMobileSearchQuery] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const isHomePage = location.pathname === '/';
    const appShell = 'mx-auto w-full md:w-[calc(100%-2rem)] max-w-[1500px]';

    return (
        <div dir="ltr" className="min-h-screen flex flex-col bg-white pb-20 md:pb-0">
            {!isHomePage && (
                <div className={appShell}>
                    <DesktopPageHeader
                        searchQuery={mobileSearchQuery}
                        onSearchChange={setMobileSearchQuery}
                        onSearchSubmit={(query) => navigate('/', { state: { searchQuery: query } })}
                        sortBy="popular"
                        onSortChange={() => undefined}
                        totalDealsCount={0}
                        onServiceSelect={(service) => navigate('/', { state: { serviceId: service.id } })}
                        onCategorySelect={(category) => navigate('/', { state: { selectedCategory: category } })}
                        onOpenMobileTools={() => navigate('/', { state: { openMobileTools: true } })}
                    />
                </div>
            )}

            <main className="flex-grow pt-0">
                <div className={appShell}>
                    {children}
                </div>
            </main>

            {!hideFooter && <div className="hidden md:block"><Footer /></div>}

            <MobileNav />
        </div>
    );
};
