import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export const COOKIE_CONSENT_KEY = 'purity_cookie_consent';
export const COOKIE_SETTINGS_EVENT = 'purity:cookie-settings';

type CookieConsent = 'accepted' | 'rejected' | null;
type YandexFunction = ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number };
type TrackingWindow = Window & {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    ym?: YandexFunction;
};

const appendScript = (id: string, src: string) => {
    if (document.getElementById(id)) return;
    const script = document.createElement('script');
    script.id = id;
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
};

const loadOptionalAnalytics = () => {
    const trackingWindow = window as TrackingWindow;
    trackingWindow.dataLayer = trackingWindow.dataLayer || [];
    trackingWindow.gtag = trackingWindow.gtag || ((...args: unknown[]) => trackingWindow.dataLayer?.push(args));
    trackingWindow.gtag('js', new Date());
    trackingWindow.gtag('config', 'G-5JPW7NJKP8');
    appendScript('purity-google-analytics', 'https://www.googletagmanager.com/gtag/js?id=G-5JPW7NJKP8');

    if (!document.getElementById('purity-google-tag-manager')) {
        trackingWindow.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        const script = document.createElement('script');
        script.id = 'purity-google-tag-manager';
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-WNL5BDL7';
        document.head.appendChild(script);
    }

    if (!trackingWindow.ym) {
        const yandexFunction = ((...args: unknown[]) => {
            yandexFunction.a = yandexFunction.a || [];
            yandexFunction.a.push(args);
        }) as YandexFunction;
        yandexFunction.l = new Date().getTime();
        trackingWindow.ym = yandexFunction;
    }
    trackingWindow.ym(106257397, 'init', { ssr: true, webvisor: true, clickmap: true, ecommerce: 'dataLayer', accurateTrackBounce: true, trackLinks: true });
    appendScript('purity-yandex-metrika', 'https://mc.yandex.ru/metrika/tag.js?id=106257397');
};

export const CookieConsentBanner: React.FC = () => {
    const [consent, setConsent] = useState<CookieConsent>(() => {
        try {
            const value = localStorage.getItem(COOKIE_CONSENT_KEY);
            return value === 'accepted' || value === 'rejected' ? value : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        const openSettings = () => setConsent(null);
        window.addEventListener(COOKIE_SETTINGS_EVENT, openSettings);
        return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, openSettings);
    }, []);

    useEffect(() => {
        if (consent === 'accepted') loadOptionalAnalytics();
    }, [consent]);

    const saveConsent = (value: Exclude<CookieConsent, null>) => {
        try { localStorage.setItem(COOKIE_CONSENT_KEY, value); } catch { /* optional preference */ }
        setConsent(value);
    };

    if (consent !== null) return null;

    return (
        <aside className="fixed inset-x-3 bottom-20 z-[80] rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl md:inset-x-auto md:bottom-4 md:left-4 md:max-w-xl" role="dialog" aria-label="Cookie preferences" dir="ltr">
            <p className="text-sm font-black text-gray-900">We respect your privacy</p>
            <p className="mt-1 text-xs font-medium leading-5 text-gray-600">We use necessary cookies to operate the website. Optional analytics tools are enabled only after your consent. Read our <Link to="/privacy" className="font-black text-primary-700 underline">Privacy Policy</Link> and <Link to="/cookies" className="font-black text-primary-700 underline">Cookies Policy</Link>.</p>
            <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => saveConsent('accepted')} className="rounded-lg bg-primary-700 px-3 py-2 text-xs font-black text-white hover:bg-primary-800">Allow analytics</button>
                <button type="button" onClick={() => saveConsent('rejected')} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-black text-gray-700 hover:bg-gray-50">Necessary only</button>
            </div>
        </aside>
    );
};
