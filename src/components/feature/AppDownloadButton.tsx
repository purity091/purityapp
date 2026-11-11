// @ts-nocheck
import React, { useState } from 'react';
import { Smartphone, QrCode, Sparkles, ChevronDown, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getDownloadUrl = () => {
    const configuredUrl = import.meta.env.VITE_APP_DOWNLOAD_URL;
    if (configuredUrl) return configuredUrl;
    return typeof window !== 'undefined' ? window.location.origin : 'https://purity-services.com';
};

interface AppDownloadButtonProps {
    compact?: boolean;
    isOpen?: boolean;
    onToggle?: () => void;
    onClose?: () => void;
}

export const AppDownloadButton: React.FC<AppDownloadButtonProps> = ({
    compact = false,
    isOpen: controlledIsOpen,
    onToggle,
    onClose,
}) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isControlled = controlledIsOpen !== undefined;
    const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

    const toggleOpen = () => {
        if (onToggle) {
            onToggle();
        } else {
            setInternalIsOpen(prev => !prev);
        }
    };

    const closeDropdown = () => {
        if (onClose) {
            onClose();
        } else {
            setInternalIsOpen(false);
        }
    };

    const downloadUrl = getDownloadUrl();
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(downloadUrl)}`;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={toggleOpen}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-label="Purity mobile app — coming soon"
                title="Purity mobile app — coming soon"
                className={compact
                    ? `relative flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
                        isOpen
                            ? 'border-primary-600 bg-primary-700 text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                    }`
                    : `inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition-all ${
                        isOpen
                            ? 'bg-primary-50 text-primary-900 ring-1 ring-primary-500/20'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                    }`}
            >
                <Smartphone size={compact ? 14 : 15} className={isOpen ? (compact ? 'text-white' : 'text-primary-700') : 'text-slate-500'} />
                {!compact && (
                    <>
                        <span>App</span>
                        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-black text-amber-900 border border-amber-200 leading-none">
                            Soon
                        </span>
                        <ChevronDown size={12} strokeWidth={2.5} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </>
                )}
            </button>

            {/* ── DROPDOWN MENU POPOVER ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.14 }}
                        role="menu"
                        className="absolute right-0 top-full z-[70] mt-3 w-80 overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left shadow-2xl shadow-slate-950/15"
                    >
                        {/* Header Banner */}
                        <div className="border-b border-slate-100 bg-gradient-to-b from-amber-50/70 to-white p-4">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-900 shadow-2xs">
                                        <Smartphone size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-950 leading-tight">Purity Mobile App</h4>
                                        <p className="text-[11px] font-semibold text-slate-500">iOS &amp; Android</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-900 shadow-2xs">
                                    <Sparkles size={11} className="text-amber-700" /> Coming soon
                                </span>
                            </div>

                            <p className="mt-3 text-xs leading-5 text-slate-600">
                                The official Purity mobile app is currently under final testing. Fast bookings, live tracking &amp; app-exclusive discounts are coming very soon!
                            </p>
                        </div>

                        {/* QR Code & App Stores Section */}
                        <div className="p-4 space-y-3 bg-slate-50/60">
                            {/* QR Preview Card */}
                            <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs">
                                <img
                                    src={qrUrl}
                                    alt="QR code for Purity Mobile App"
                                    className="h-20 w-20 shrink-0 rounded-lg border border-slate-100 object-contain p-1"
                                    loading="lazy"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                                        <QrCode size={13} className="text-primary-700" /> Scan QR Code
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-500 leading-4">
                                        Point your phone camera to bookmark or get notified directly on launch.
                                    </p>
                                </div>
                            </div>

                            {/* Store Badges Preview */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 shadow-2xs">
                                    <svg className="h-5 w-5 fill-slate-900 shrink-0" viewBox="0 0 24 24">
                                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-.98 1.71-.85 2.72.99.08 2.02-.49 2.56-1.22z"/>
                                    </svg>
                                    <div className="text-left">
                                        <span className="block text-[8px] uppercase font-bold text-slate-400 leading-none">App Store</span>
                                        <span className="block text-[10px] font-black text-amber-800 leading-tight">Coming soon</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 shadow-2xs">
                                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M3.6 2.4L13.7 12 3.6 21.6c-.4-.3-.6-.8-.6-1.4V3.8c0-.6.2-1.1.6-1.4z"/>
                                        <path fill="#FBBC05" d="M17.1 8.7L13.7 12l3.4 3.3 3.9-2.2c1.1-.6 1.1-1.6 0-2.2l-3.9-2.2z"/>
                                        <path fill="#EA4335" d="M3.6 2.4l10.1 9.6 3.4-3.3L5.3 1.8c-.6-.3-1.2-.2-1.7.6z"/>
                                        <path fill="#34A853" d="M17.1 15.3l-3.4-3.3L3.6 21.6c.5.8 1.1.9 1.7.6l11.8-6.9z"/>
                                    </svg>
                                    <div className="text-left">
                                        <span className="block text-[8px] uppercase font-bold text-slate-400 leading-none">Google Play</span>
                                        <span className="block text-[10px] font-black text-amber-800 leading-tight">Coming soon</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Notification Action */}
                        <div className="border-t border-slate-100 bg-white p-3">
                            <a
                                href="https://wa.me/971544556106?text=Hello%20Purity,%20please%20notify%20me%20when%20the%20mobile%20app%20is%20ready!"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={closeDropdown}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-700 px-3 py-2.5 text-xs font-bold text-white shadow-2xs transition hover:bg-primary-800 active:scale-[0.99]"
                            >
                                <span>Notify me on launch (قريباً)</span>
                                <ArrowRight size={13} />
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
