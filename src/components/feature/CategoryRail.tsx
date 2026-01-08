// @ts-nocheck
import React from 'react';
import { CATEGORIES } from '../../types';
import { Tag, Home, Sofa, Sparkles, Briefcase, Heart, Shirt } from 'lucide-react';

interface CategoryRailProps {
    selected: string;
    onSelect: (cat: string) => void;
}

const getIcon = (cat: string) => {
    switch (cat) {
        case 'Home Cleaning': return <Home size={20} />;
        case 'Furniture': return <Sofa size={20} />;
        case 'Flooring': return <Sparkles size={20} />;
        case 'Commercial': return <Briefcase size={20} />;
        case 'Care': return <Heart size={20} />;
        case 'Laundry': return <Shirt size={20} />;
        default: return <Tag size={20} />;
    }
}

export const CategoryRail: React.FC<CategoryRailProps> = ({ selected, onSelect }) => {
    return (
        <section id="categories-rail" className="py-4">
            <div className="flex overflow-x-auto gap-3 hide-scrollbar pb-1 px-6 md:px-0">
                <button
                    onClick={() => onSelect('All')}
                    className="flex flex-col items-center gap-2 flex-none group"
                >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${selected === 'All'
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25 scale-105'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-primary-600'
                        }`}>
                        <Tag size={20} />
                    </div>
                    <span className={`text-[10px] font-semibold ${selected === 'All' ? 'text-primary-600' : 'text-gray-500'
                        }`}>All</span>
                </button>

                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => onSelect(cat)}
                        className="flex flex-col items-center gap-2 flex-none group"
                    >
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${selected === cat
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25 scale-105'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-primary-600'
                            }`}>
                            {getIcon(cat)}
                        </div>
                        <span className={`text-[10px] font-semibold truncate max-w-[64px] ${selected === cat ? 'text-primary-600' : 'text-gray-500'
                            }`}>{cat}</span>
                    </button>
                ))}
            </div>
        </section>
    );
};
