import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface InstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
    const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
    const [installed, setInstalled] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        const standalone = window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
        setInstalled(standalone);
        const onBeforeInstall = (event: Event) => {
            event.preventDefault();
            setPromptEvent(event as InstallPromptEvent);
        };
        const onInstalled = () => { setInstalled(true); setPromptEvent(null); };
        window.addEventListener('beforeinstallprompt', onBeforeInstall);
        window.addEventListener('appinstalled', onInstalled);
        return () => {
            window.removeEventListener('beforeinstallprompt', onBeforeInstall);
            window.removeEventListener('appinstalled', onInstalled);
        };
    }, []);

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isAndroid = /android/i.test(navigator.userAgent);
    const platform = isIos ? 'ios' : isAndroid ? 'android' : 'desktop';
    const install = async () => {
        if (installed) return;
        if (!promptEvent) {
            setShowHelp(true);
            return;
        }

        if (!promptEvent) return;
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        setPromptEvent(null);
        if (choice.outcome === 'accepted') setInstalled(true);
    };

    return (
        <span className="relative inline-flex">
            <button type="button" onClick={install} title="Install Purity app" aria-label="Install Purity app" aria-expanded={showHelp} className={compact ? 'flex h-9 w-9 items-center justify-center rounded-lg border border-primary-200 bg-primary-50 text-primary-700 transition hover:bg-primary-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30' : 'flex h-10 items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 text-xs font-semibold text-primary-700 transition hover:bg-primary-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30'}>
                <Download size={compact ? 15 : 14} />
                {!compact && <span>{installed ? 'App installed' : 'Install app'}</span>}
            </button>
            {showHelp && <span role="dialog" aria-label="Install Purity app" className="absolute right-0 top-full z-[70] mt-2 w-72 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-2xl">
                <span className="mb-2 flex items-center justify-between gap-3"><strong className="text-xs font-black text-gray-900">Install Purity app</strong><button type="button" onClick={() => setShowHelp(false)} className="p-1 text-gray-400 hover:text-gray-700" aria-label="Close"><X size={14} /></button></span>
                {installed ? <span className="block text-[11px] font-semibold leading-5 text-emerald-700">Purity is already installed on this device.</span> : <>
                    {platform === 'ios' && <span className="block text-[11px] font-semibold leading-5 text-gray-600">Direct installation is not provided by iPhone browsers. In Safari, tap <strong>Share</strong>, choose <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.</span>}
                    {platform === 'android' && <span className="block text-[11px] font-semibold leading-5 text-gray-600">This browser has not exposed direct installation yet. Direct install requires HTTPS, a valid manifest, and the service worker to be ready. Reload the page after deploying those requirements.</span>}
                    {platform === 'desktop' && <span className="block text-[11px] font-semibold leading-5 text-gray-600">This browser has not exposed direct installation yet. Direct install requires HTTPS, a valid manifest, and the service worker to be ready. Reload the page after deploying those requirements.</span>}
                </>}
            </span>}
        </span>
    );
};
