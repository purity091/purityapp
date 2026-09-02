import React from 'react';
import { FAQSection } from '../components/feature/FAQSection';
import { GoogleReviews } from '../components/feature/GoogleReviews';
import { HappinessSection } from '../components/feature/HappinessSection';
import { TrustSection } from '../components/feature/TrustSection';

export type InfoPageKind = 'about' | 'faq' | 'reviews';

interface InfoPageProps {
    kind: InfoPageKind;
}

export const InfoPage: React.FC<InfoPageProps> = ({ kind }) => (
    <div className="min-h-screen bg-white pb-8">
        {kind === 'about' && (
            <>
                <HappinessSection />
                <TrustSection />
            </>
        )}
        {kind === 'faq' && <FAQSection />}
        {kind === 'reviews' && <GoogleReviews />}
    </div>
);
