import React from 'react';
import { ArrowUpDown, ChevronDown, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES } from '../../types';

export type PriceRange = 'all' | 'under-150' | '150-300' | 'over-300';
export type SortOption = 'popular' | 'price' | 'rating';

interface FilterBarProps {
    searchQuery: string;
    selectedCategory: string;
    priceRange: PriceRange;
    sortBy: SortOption;
    totalResults: number;
    onCategoryChange: (category: string) => void;
    onPriceRangeChange: (range: PriceRange) => void;
    onSortChange: (sort: SortOption) => void;
    onSearchChange: (query: string) => void;
    onClearAll: () => void;
}

const priceOptions: Array<{ value: PriceRange; label: string }> = [
    { value: 'all', label: 'Any price' },
    { value: 'under-150', label: 'Under AED 150' },
    { value: '150-300', label: 'AED 150 – 300' },
    { value: 'over-300', label: 'AED 300+' },
];

const sortOptions: Array<{ value: SortOption; label: string }> = [
    { value: 'popular', label: 'Most popular' },
    { value: 'price', label: 'Lowest price' },
    { value: 'rating', label: 'Top rated' },
];

const SelectControl: React.FC<{
    label: string;
    value: string;
    options: Array<{ value: string; label: string }>;
    onChange: (value: string) => void;
}> = ({ label, value, options, onChange }) => (
    <label className="relative inline-flex h-8 flex-none items-center rounded-md border border-gray-300 bg-white text-[11px] font-bold text-gray-800 transition-colors hover:border-gray-500 focus-within:border-gray-600 focus-within:ring-2 focus-within:ring-gray-400/20">
        <span className="sr-only">{label}</span>
        <select
            aria-label={label}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-full max-w-[150px] cursor-pointer appearance-none bg-transparent py-0 pl-2.5 pr-7 font-extrabold outline-none"
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
        <ChevronDown size={13} className="pointer-events-none absolute right-1.5 text-gray-600" />
    </label>
);

export const FilterBar: React.FC<FilterBarProps> = ({
    searchQuery,
    selectedCategory,
    priceRange,
    sortBy,
    totalResults,
    onCategoryChange,
    onPriceRangeChange,
    onSortChange,
    onSearchChange,
    onClearAll,
}) => {
    const activeFilterCount = Number(Boolean(searchQuery.trim()))
        + Number(selectedCategory !== 'All')
        + Number(priceRange !== 'all');
    const hasActiveFilters = activeFilterCount > 0;

    return (
        <section className="border-b border-gray-200 bg-white" aria-label="Service filters">
            <div className="mx-auto w-full max-w-[1600px] px-4 lg:px-6">
                <div className="flex min-h-[44px] items-center gap-1.5 overflow-x-auto py-1.5 whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <span className="inline-flex flex-none items-center gap-1 pr-1 text-[11px] font-extrabold text-gray-800">
                        <SlidersHorizontal size={13} className="text-gray-700" />
                        Filters
                    </span>

                    <SelectControl
                        label="Filter by category"
                        value={selectedCategory}
                        onChange={onCategoryChange}
                        options={[{ value: 'All', label: 'All categories' }, ...CATEGORIES.map((category) => ({ value: category, label: category }))]}
                    />

                    <SelectControl
                        label="Filter by price"
                        value={priceRange}
                        onChange={(value) => onPriceRangeChange(value as PriceRange)}
                        options={priceOptions}
                    />

                    <span className="mx-1 h-6 w-px flex-none bg-gray-200" aria-hidden="true" />

                    <label className="relative inline-flex h-8 flex-none items-center gap-1 text-[11px] font-extrabold text-gray-900">
                        <ArrowUpDown size={13} className="text-gray-700" />
                        <span>Sort by</span>
                        <span className="relative">
                            <select
                                aria-label="Sort services"
                                value={sortBy}
                                onChange={(event) => onSortChange(event.target.value as SortOption)}
                                className="max-w-[120px] cursor-pointer appearance-none bg-transparent py-1 pl-1 pr-4 font-extrabold text-gray-900 underline decoration-gray-300 underline-offset-4 outline-none focus:text-gray-700"
                            >
                                {sortOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                            <ChevronDown size={12} className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-gray-600" />
                        </span>
                    </label>

                    {hasActiveFilters && (
                        <>
                            <span className="mx-1 h-6 w-px flex-none bg-gray-200" aria-hidden="true" />
                            {searchQuery.trim() && (
                                <button
                                    type="button"
                                    onClick={() => onSearchChange('')}
                                    title="Clear search filter"
                                    className="inline-flex max-w-[180px] flex-none items-center gap-1 rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-[10px] font-bold text-gray-700 hover:border-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/30"
                                >
                                    <span className="truncate">Search: {searchQuery.trim()}</span>
                                    <X size={12} />
                                </button>
                            )}
                            {selectedCategory !== 'All' && (
                                <button
                                    type="button"
                                    onClick={() => onCategoryChange('All')}
                                    title="Clear category filter"
                                    className="inline-flex max-w-[150px] flex-none items-center gap-1 rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-[10px] font-bold text-gray-700 hover:border-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/30"
                                >
                                    <span className="truncate">{selectedCategory}</span>
                                    <X size={12} />
                                </button>
                            )}
                            {priceRange !== 'all' && (
                                <button
                                    type="button"
                                    onClick={() => onPriceRangeChange('all')}
                                    title="Clear price filter"
                                    className="inline-flex flex-none items-center gap-1 rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-[10px] font-bold text-gray-700 hover:border-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/30"
                                >
                                    <span>{priceOptions.find((option) => option.value === priceRange)?.label}</span>
                                    <X size={12} />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onClearAll}
                                className="inline-flex h-8 flex-none items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 text-[11px] font-bold text-gray-800 hover:border-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/30"
                            >
                                <RotateCcw size={13} />
                                Clear all
                            </button>
                        </>
                    )}

                    <span className="ml-auto flex-none pl-2 text-[11px] font-bold text-gray-600">
                        <span className="font-black text-gray-900">{totalResults}</span> services
                    </span>
                </div>
            </div>
        </section>
    );
};
