import React, { useState } from 'react';
import { Download, QrCode, Smartphone } from 'lucide-react';
import { Modal } from '../ui/Modal';

const getDownloadUrl = () => {
    const configuredUrl = import.meta.env.VITE_APP_DOWNLOAD_URL;
    if (configuredUrl) return configuredUrl;
    return typeof window !== 'undefined' ? window.location.origin : 'https://purity-services.com';
};

export const AppDownloadButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const downloadUrl = getDownloadUrl();
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data=${encodeURIComponent(downloadUrl)}`;

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                title="Purity app — coming soon"
                aria-label="Open Purity app download information"
                className={compact
                    ? 'flex h-9 w-9 items-center justify-center rounded-lg border border-primary-200 bg-primary-50 text-primary-700 transition hover:bg-primary-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30'
                    : 'flex h-10 items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 text-xs font-semibold text-primary-700 transition hover:bg-primary-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30'}
            >
                <Smartphone size={compact ? 15 : 14} />
                {!compact && <span>App</span>}
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Purity mobile app">
                <div className="mx-auto flex max-w-md flex-col items-center text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                        <Smartphone size={24} />
                    </div>
                    <h4 className="text-lg font-black text-slate-950">Coming soon</h4>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                        The Purity mobile app is being prepared. Download links will be activated here as soon as the app is published.
                    </p>
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                        <img src={qrUrl} alt="QR code for the Purity mobile app" className="h-52 w-52 rounded-xl" loading="lazy" />
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-500">
                        <QrCode size={15} /> Scan when the download link is live
                    </div>
                    <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-500">
                        <Download size={14} /> The QR destination is configured with VITE_APP_DOWNLOAD_URL.
                    </div>
                </div>
            </Modal>
        </>
    );
};
