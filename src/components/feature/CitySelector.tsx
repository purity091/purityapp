import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Lock, MapPin } from 'lucide-react';

const CITIES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'];

interface CitySelectorProps {
    compact?: boolean;
    dense?: boolean;
}

export const CitySelector: React.FC<CitySelectorProps> = ({ compact = false, dense = false }) => {
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
                aria-label="Select service city"
                className={`flex items-center gap-1.5 rounded-md border border-gray-300 bg-white text-gray-800 font-bold transition-colors hover:border-gray-500 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/30 ${dense ? 'h-8 px-2.5 text-[11px]' : compact ? 'h-11 px-4 text-xs' : 'px-2.5 py-1.5 text-xs'}`}
            >
                <MapPin size={dense ? 13 : compact ? 14 : 12} className="text-gray-700" />
                <span>Dubai, UAE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <ChevronDown size={dense ? 13 : compact ? 14 : 12} className={`ml-0.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div role="listbox" aria-label="Service cities" className={`absolute top-full z-[60] mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/15 ${compact ? 'right-0 w-[min(20rem,calc(100vw-2rem))]' : 'left-0 w-72'}`}>
                    <div className="border-b border-gray-200 bg-gray-900 px-4 py-3">
                        <p className="text-[11px] font-black uppercase tracking-widest text-white">Service location</p>
                        <p className="mt-1 text-xs font-semibold text-gray-300">Choose your city</p>
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
                                            {isAvailable ? 'Available now' : 'Coming soon'}
                                        </span>
                                    </span>
                                    {isAvailable && <span className="text-[10px] font-black text-primary-800">Selected</span>}
                                </button>
                            );
                        })}
                    </div>

                    <div className="border-t border-gray-200 px-4 py-3 text-center">
                        <p className="text-[11px] font-semibold leading-relaxed text-gray-600">We’re expanding across the UAE. More cities are coming soon.</p>
                    </div>
                </div>
            )}
        </div>
    );
};
