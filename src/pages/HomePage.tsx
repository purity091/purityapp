// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { HomeHeader } from '../components/feature/HomeHeader';
import { DealsSlider } from '../components/feature/DealsSlider';
import { CategoryRail } from '../components/feature/CategoryRail';
import { FlashDeals } from '../components/feature/FlashDeals';
import { DiscoveryGrid } from '../components/feature/DiscoveryGrid';
import { GoogleReviews } from '../components/feature/GoogleReviews';
import { TrustSection } from '../components/feature/TrustSection';
import { HappinessSection } from '../components/feature/HappinessSection';
import { FAQSection } from '../components/feature/FAQSection';
import { BookingModal } from '../components/feature/BookingModal';
import { services } from '../data/services';
import { Service, CATEGORIES } from '../types';

export const HomePage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    return (
        <div className="bg-gray-50/50 min-h-screen pb-20">
            <HomeHeader />
            <main className="w-full">
                {/* Catalog & Feed Section with Containment */}
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="py-2">
                        <DealsSlider />
                    </div>

                    <CategoryRail
                        selected={selectedCategory}
                        onSelect={(cat) => {
                            setSelectedCategory(cat);
                            if (cat !== 'All') {
                                document.getElementById('cat-' + cat)?.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                    />

                    {selectedCategory === 'All' && (
                        <FlashDeals onSelect={setSelectedService} />
                    )}

                    {/* Category Sections */}
                    <div className="space-y-6 lg:space-y-12 mb-16">
                        {CATEGORIES.map(category => {
                            const categoryServices = services.filter(s => s.category === category);
                            if (categoryServices.length === 0) return null;

                            if (selectedCategory !== 'All' && selectedCategory !== category) return null;

                            return (
                                <div id={`cat-${category}`} key={category}>
                                    <DiscoveryGrid
                                        title={category}
                                        services={categoryServices}
                                        onSelect={setSelectedService}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Full Width Sections */}
                <HappinessSection />
                <FAQSection />
                <GoogleReviews />
                <TrustSection />
            </main>

            <BookingModal
                isOpen={!!selectedService}
                onClose={() => setSelectedService(null)}
                service={selectedService}
            />
        </div>
    );
};
