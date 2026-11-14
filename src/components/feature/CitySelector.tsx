import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Lock, MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const CITIES = ['Dubai'];

interface CitySelectorProps {
    compact?: boolean;
    dense?: boolean;
}

export const CitySelector: React.FC<CitySelectorProps> = ({ compact = false, dense = false }) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const selectorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    return (
        <div ref={selectorRef} className="relative flex-shrink-0">
            <button
                type="button"
                onClick={() => setIsOpen(value => !value)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label={t('chooseCity')}
                className={`flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50/80 font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-white hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 ${
                    dense ? 'h-8 px-2.5 text-[11px]' : compact ? 'h-9 px-3 text-xs' : 'h-8 px-2.5 text-xs'
                }`}
            >
                <MapPin size={12} className="text-primary-700 shrink-0" />
                <span>Dubai</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                <ChevronDown size={11} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div role="listbox" aria-label={t('serviceLocation')} className={`absolute top-full z-[60] mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/15 ${compact ? 'right-0 w-[min(20rem,calc(100vw-2rem))]' : 'left-0 w-72'}`}>
                    <div className="border-b border-gray-200 bg-gray-900 px-4 py-3">
                        <p className="text-[11px] font-black uppercase text-white">{t('serviceLocation')}</p>
                        <p className="mt-1 text-xs font-semibold text-gray-300">{t('chooseCity')}</p>
                    </div>

                    <div className="p-2">
                        {CITIES.map((city, index) => {
                            const isAvailable = index === 0;
                            return (
                                <button
                                    key={city}
                                    type="button"
                                    role="option"
                                    aria-selected={isAvailable}
                                    disabled={!isAvailable}
                                    onClick={() => isAvailable && setIsOpen(false)}
                                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 ${isAvailable ? 'bg-primary-50 text-primary-900 hover:bg-primary-100' : 'cursor-not-allowed text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${isAvailable ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        {isAvailable ? <Check size={14} strokeWidth={3} /> : <Lock size={12} />}
                                    </span>
                                    <span className="flex-1">
                                        <span className="block text-xs font-extrabold">{city}</span>
                                        <span className={`block text-[11px] font-semibold ${isAvailable ? 'text-emerald-700' : 'text-gray-600'}`}>
                                            {isAvailable ? t('availableNow') : t('comingSoon')}
                                        </span>
                                    </span>
                                    {isAvailable && <span className="text-[10px] font-black text-primary-800">{t('selected')}</span>}
                                </button>
                            );
                        })}
                    </div>

                    <div className="border-t border-gray-200 px-4 py-3 text-center">
                        <p className="text-[11px] font-semibold leading-relaxed text-gray-600">{t('moreCitiesSoon')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
