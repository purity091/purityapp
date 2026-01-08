import React from 'react';
import { Search, MapPin, Bell, ChevronDown, SlidersHorizontal } from 'lucide-react';

export const HomeHeader: React.FC = () => {
    return (
        <div className="bg-white/95 backdrop-blur-xl pt-4 pb-4 border-b border-gray-100 sticky top-0 md:top-20 z-40 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6">
                {/* Search & Filter Row */}
                <div className="flex gap-3">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search services..."
                            className="w-full bg-gray-100 text-gray-900 rounded-xl h-12 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-gray-400"
                        />
                    </div>
                    <button className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center active:scale-95 transition-transform text-gray-900 hover:text-primary-600 hover:bg-gray-200 group">
                        <SlidersHorizontal size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                </div>
            </div>
        </div>
    );
};
