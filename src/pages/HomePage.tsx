import React, { useState, useMemo, useEffect } from 'react';
import { FilterBar, PriceRange, SortOption } from '../components/feature/FilterBar';
import { FlashDeals } from '../components/feature/FlashDeals';
import { DiscoveryGrid } from '../components/feature/DiscoveryGrid';
import { DesktopPageHeader } from '../components/feature/DesktopPageHeader';
import { GoogleReviews } from '../components/feature/GoogleReviews';
import { TrustSection } from '../components/feature/TrustSection';
import { HappinessSection } from '../components/feature/HappinessSection';
import { FAQSection } from '../components/feature/FAQSection';
import { BookingModal } from '../components/feature/BookingModal';
import { services } from '../data/services';
import { Service, CATEGORIES } from '../types';
import { SearchX, Sparkles, Grid3X3, SlidersHorizontal, X, ChevronRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface HomeNavigationState {
    searchQuery?: string;
    selectedCategory?: string;
    serviceId?: string;
    openMobileTools?: boolean;
    scrollTo?: string;
}

export const HomePage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const navigationState = (location.state || {}) as HomeNavigationState;
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [searchQuery, setSearchQuery] = useState(navigationState.searchQuery || '');
    const [sortBy, setSortBy] = useState<SortOption>('popular');
    const [priceRange, setPriceRange] = useState<PriceRange>('all');
    const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);

    useEffect(() => {
        const state = (location.state || {}) as HomeNavigationState;
        const hasNavigationState = Object.keys(state).length > 0;
        if (!hasNavigationState) return;

        if (state.searchQuery !== undefined) setSearchQuery(state.searchQuery);
        if (state.selectedCategory) setSelectedCategory(state.selectedCategory);
        if (state.serviceId) {
            const nextService = services.find((service) => service.id === state.serviceId);
            if (nextService) setSelectedService(nextService);
        }
        if (state.openMobileTools) setIsMobileToolsOpen(true);

        const targetId = state.scrollTo || (state.selectedCategory ? (state.selectedCategory === 'All' ? 'services' : `cat-${state.selectedCategory}`) : undefined);
        if (targetId) {
            window.setTimeout(() => {
                const target = document.getElementById(targetId);
                target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
        }

        navigate(location.pathname, { replace: true, state: null });
    }, [location.pathname, location.state, navigate]);

    // Filtered + sorted services
    const filteredServices = useMemo(() => {
        let result = [...services];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.category.toLowerCase().includes(q) ||
                s.description.toLowerCase().includes(q)
            );
        }

        if (selectedCategory !== 'All') {
            result = result.filter(s => s.category === selectedCategory);
        }

        if (priceRange === 'under-150') {
            result = result.filter(s => s.price < 150);
        } else if (priceRange === '150-300') {
            result = result.filter(s => s.price >= 150 && s.price <= 300);
        } else if (priceRange === 'over-300') {
            result = result.filter(s => s.price > 300);
        }

        if (sortBy === 'price') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'rating') {
            result.sort((a, b) => b.rating - a.rating);
        } else {
            result.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
        }

        return result;
    }, [searchQuery, selectedCategory, priceRange, sortBy]);

    const servicesByCategory = useMemo(() => {
        const grouped: Record<string, Service[]> = {};
        for (const s of filteredServices) {
            if (!grouped[s.category]) grouped[s.category] = [];
            grouped[s.category].push(s);
        }
        return grouped;
    }, [filteredServices]);

    const isSearching = searchQuery.trim().length > 0;
    const hasResults = filteredServices.length > 0;

    return (
        <div className="min-h-screen w-full bg-white pb-4 md:pb-0">

            {/* Desktop Unified Non-Floating Sticky Header */}
            <DesktopPageHeader
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSearchSubmit={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                totalDealsCount={filteredServices.length}
                onServiceSelect={setSelectedService}
                onCategorySelect={setSelectedCategory}
                onOpenMobileTools={() => setIsMobileToolsOpen(true)}
            />

            <MobileBrowseControls
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                priceRange={priceRange}
                sortBy={sortBy}
                totalResults={filteredServices.length}
                onCategoryChange={setSelectedCategory}
                onPriceRangeChange={setPriceRange}
                onSortChange={setSortBy}
                onClearAll={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setPriceRange('all');
                    setSortBy('popular');
                }}
            />

            {/* Fast, visible controls for filtering and sorting the catalogue */}
            <div className="hidden md:block">
                <FilterBar
                    searchQuery={searchQuery}
                    selectedCategory={selectedCategory}
                    priceRange={priceRange}
                    sortBy={sortBy}
                    totalResults={filteredServices.length}
                    onCategoryChange={setSelectedCategory}
                    onPriceRangeChange={setPriceRange}
                    onSortChange={setSortBy}
                    onSearchChange={setSearchQuery}
                    onClearAll={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                        setPriceRange('all');
                        setSortBy('popular');
                    }}
                />
            </div>

            <MobileToolsDrawer
                isOpen={isMobileToolsOpen}
                selectedCategory={selectedCategory}
                priceRange={priceRange}
                sortBy={sortBy}
                totalResults={filteredServices.length}
                onClose={() => setIsMobileToolsOpen(false)}
                onCategoryChange={setSelectedCategory}
                onPriceRangeChange={setPriceRange}
                onSortChange={setSortBy}
                onClearAll={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setPriceRange('all');
                    setSortBy('popular');
                }}
            />

            {/* Catalogue content follows the unified page header */}
            <main className="w-full">
                <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Flash Deals — show on both mobile and desktop */}
                    {!isSearching && selectedCategory === 'All' && (
                        <FlashDeals onSelect={setSelectedService} />
                    )}

                    {/* Search Results Header */}
                    {isSearching && (
                        <div className="mb-6 pt-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                Search Results
                            </p>
                            <h2 className="text-xl font-extrabold text-gray-900">
                                {hasResults
                                    ? `${filteredServices.length} result${filteredServices.length !== 1 ? 's' : ''} for "${searchQuery}"`
                                    : `No results for "${searchQuery}"`
                                }
                            </h2>
                        </div>
                    )}

                    {/* Empty State */}
                    {!hasResults ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center space-y-5">
                            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center">
                                <SearchX size={36} className="text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-extrabold text-gray-900">No services found</h3>
                                <p className="text-sm text-gray-500 mt-1 max-w-xs">
                                    Try a different search term or browse all categories.
                                </p>
                            </div>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setPriceRange('all'); setSortBy('popular'); }}
                                className="bg-primary-600 text-white text-sm font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-primary-700 transition-colors shadow-sm"
                            >
                                <Sparkles size={16} />
                                Browse All Services
                            </button>
                        </div>
                    ) : (
                        <div id="services" className="space-y-3 lg:space-y-5 mb-8">
                            {isSearching ? (
                                Object.entries(servicesByCategory).map(([category, catServices]) => (
                                    <div id={`cat-${category}`} key={category}>
                                        <DiscoveryGrid
                                            title={category}
                                            services={catServices}
                                            onSelect={setSelectedService}
                                        />
                                    </div>
                                ))
                            ) : (
                                CATEGORIES.map(category => {
                                    const catServices = servicesByCategory[category];
                                    if (!catServices || catServices.length === 0) return null;
                                    if (selectedCategory !== 'All' && selectedCategory !== category) return null;
                                    return (
                                        <div id={`cat-${category}`} key={category}>
                                            <DiscoveryGrid
                                                title={category}
                                                services={catServices}
                                                onSelect={setSelectedService}
                                            />
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* Full Width Sections */}
                {!isSearching && (
                    <>
                        <div className="md:hidden">
                            <MobileInfoNavigation />
                        </div>
                        <div className="hidden md:block">
                            <HappinessSection />
                            <FAQSection />
                            <GoogleReviews />
                            <TrustSection />
                        </div>
                    </>
                )}
            </main>

            <BookingModal
                isOpen={!!selectedService}
                onClose={() => setSelectedService(null)}
                service={selectedService}
            />
        </div>
    );
};

const MobileInfoNavigation: React.FC = () => (
    <section className="border-t border-gray-200 px-4 py-6" aria-label="More about Purity">
        <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-gray-500">More about Purity</p>
        <div className="grid grid-cols-3 gap-2">
            <Link to="/about" className="min-w-0 border border-gray-200 bg-white px-2 py-2.5 text-center">
                <span className="block truncate text-[11px] font-extrabold text-gray-900">Why Purity</span>
                <span className="mt-0.5 block text-[9px] font-semibold text-gray-500">Our standards</span>
            </Link>
            <Link to="/faq" className="min-w-0 border border-gray-200 bg-white px-2 py-2.5 text-center">
                <span className="block truncate text-[11px] font-extrabold text-gray-900">FAQ</span>
                <span className="mt-0.5 block text-[9px] font-semibold text-gray-500">Before booking</span>
            </Link>
            <Link to="/reviews" className="min-w-0 border border-gray-200 bg-white px-2 py-2.5 text-center">
                <span className="block truncate text-[11px] font-extrabold text-gray-900">Reviews</span>
                <span className="mt-0.5 block text-[9px] font-semibold text-gray-500">Customer stories</span>
            </Link>
        </div>
    </section>
);

interface MobileBrowseControlsProps {
    searchQuery: string;
    selectedCategory: string;
    priceRange: PriceRange;
    sortBy: SortOption;
    totalResults: number;
    onCategoryChange: (category: string) => void;
    onPriceRangeChange: (range: PriceRange) => void;
    onSortChange: (sort: SortOption) => void;
    onClearAll: () => void;
}

const MobileBrowseControls: React.FC<MobileBrowseControlsProps> = ({
    searchQuery,
    selectedCategory,
    priceRange,
    sortBy,
    totalResults,
    onCategoryChange,
    onPriceRangeChange,
    onSortChange,
    onClearAll,
}) => {
    const priceOptions: Array<{ value: PriceRange; label: string }> = [
        { value: 'all', label: 'Any price' },
        { value: 'under-150', label: 'Under AED 150' },
        { value: '150-300', label: 'AED 150 - 300' },
        { value: 'over-300', label: 'AED 300+' },
    ];

    const hasActiveFilters = Boolean(searchQuery.trim()) || selectedCategory !== 'All' || priceRange !== 'all';
    const selectClass = 'block h-7 min-w-0 w-full rounded-md border border-gray-300 bg-white px-1.5 text-[10px] font-semibold text-gray-800 outline-none';

    return (
        <div className="md:hidden border-b border-gray-200 bg-white" aria-label="Mobile service navigation and filters">
            <nav className="flex items-center gap-1 px-4 pt-2.5 pb-1 text-[11px] leading-4" aria-label="Breadcrumb">
                <div className="flex min-w-0 items-center gap-1">
                    <Link to="/" className="shrink-0 font-semibold text-gray-500">Home</Link>
                    <ChevronRight size={12} className="shrink-0 text-gray-400" aria-hidden="true" />
                    <span className="shrink-0 font-bold text-gray-900">Services</span>
                    {selectedCategory !== 'All' && (
                        <>
                            <ChevronRight size={12} className="shrink-0 text-gray-400" aria-hidden="true" />
                            <span className="truncate font-semibold text-primary-700">{selectedCategory}</span>
                        </>
                    )}
                    {searchQuery.trim() && (
                        <>
                            <ChevronRight size={12} className="shrink-0 text-gray-400" aria-hidden="true" />
                            <span className="truncate font-semibold text-gray-600">Search</span>
                        </>
                    )}
                </div>
                <span className="ml-auto shrink-0 text-[10px] font-semibold text-gray-500">{totalResults}</span>
            </nav>

            <div className={`grid gap-1.5 overflow-hidden px-4 pb-2 pt-1 ${hasActiveFilters ? 'grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_1.75rem]' : 'grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]'}`}>
                <label className="sr-only" htmlFor="mobile-category-filter">Category</label>
                <select
                    id="mobile-category-filter"
                    aria-label="Filter by category"
                    value={selectedCategory}
                    onChange={(event) => onCategoryChange(event.target.value)}
                    className={selectClass}
                >
                    <option value="All">All services</option>
                    {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>

                <label className="sr-only" htmlFor="mobile-price-filter">Price</label>
                <select
                    id="mobile-price-filter"
                    aria-label="Filter by price"
                    value={priceRange}
                    onChange={(event) => onPriceRangeChange(event.target.value as PriceRange)}
                    className={selectClass}
                >
                    {priceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>

                <label className="sr-only" htmlFor="mobile-sort-filter">Sort</label>
                <select
                    id="mobile-sort-filter"
                    aria-label="Sort services"
                    value={sortBy}
                    onChange={(event) => onSortChange(event.target.value as SortOption)}
                    className={selectClass}
                >
                    <option value="popular">Most popular</option>
                    <option value="price">Lowest price</option>
                    <option value="rating">Top rated</option>
                </select>

                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onClearAll}
                        aria-label="Clear filters"
                        title="Clear filters"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>
        </div>
    );
};

interface MobileToolsDrawerProps {
    isOpen: boolean;
    selectedCategory: string;
    priceRange: PriceRange;
    sortBy: SortOption;
    totalResults: number;
    onClose: () => void;
    onCategoryChange: (category: string) => void;
    onPriceRangeChange: (range: PriceRange) => void;
    onSortChange: (sort: SortOption) => void;
    onClearAll: () => void;
}

const MobileToolsDrawer: React.FC<MobileToolsDrawerProps> = ({
    isOpen,
    selectedCategory,
    priceRange,
    sortBy,
    totalResults,
    onClose,
    onCategoryChange,
    onPriceRangeChange,
    onSortChange,
    onClearAll,
}) => {
    if (!isOpen) return null;

    const selectClass = 'mt-1 block h-9 w-full rounded-lg border border-gray-300 bg-gray-50 px-2.5 text-xs font-bold text-gray-900 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-500/15';
    const priceOptions: Array<{ value: PriceRange; label: string }> = [
        { value: 'all', label: 'Any price' },
        { value: 'under-150', label: 'Under AED 150' },
        { value: '150-300', label: 'AED 150 - 300' },
        { value: 'over-300', label: 'AED 300+' },
    ];

    const chooseCategory = (category: string) => {
        onCategoryChange(category);
        onClose();
        window.setTimeout(() => {
            const target = category === 'All' ? 'services' : `cat-${category}`;
            document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
    };

    return (
        <div className="fixed inset-0 z-[70] md:hidden" role="dialog" aria-modal="true" aria-label="Services and filters">
            <button type="button" aria-label="Close services and filters" className="absolute inset-0 bg-black/35" onClick={onClose} />
            <aside className="absolute right-0 top-0 flex h-full w-[min(88vw,22rem)] flex-col bg-white shadow-2xl">
                <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 px-3">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal size={16} className="text-primary-700" />
                        <h2 className="text-sm font-black text-gray-900">Services & Filters</h2>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200">
                        <X size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-3 pb-6">
                    <section>
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="flex items-center gap-1.5 text-xs font-black text-gray-900"><Grid3X3 size={14} className="text-primary-700" /> Browse services</h3>
                            <span className="text-[10px] font-bold text-gray-500">{totalResults} available</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                            <button type="button" onClick={() => chooseCategory('All')} className={`rounded-lg border px-2 py-2 text-left text-[11px] font-bold ${selectedCategory === 'All' ? 'border-primary-600 bg-primary-50 text-primary-900' : 'border-gray-200 bg-gray-50 text-gray-800'}`}>All services</button>
                            {CATEGORIES.map(category => (
                                <button type="button" key={category} onClick={() => chooseCategory(category)} className={`truncate rounded-lg border px-2 py-2 text-left text-[11px] font-bold ${selectedCategory === category ? 'border-primary-600 bg-primary-50 text-primary-900' : 'border-gray-200 bg-gray-50 text-gray-800'}`}>{category}</button>
                            ))}
                        </div>
                    </section>

                    <section className="mt-4 border-t border-gray-200 pt-3">
                        <h3 className="mb-2 text-xs font-black text-gray-900">Refine results</h3>
                        <div className="space-y-2.5">
                            <label className="block text-[10px] font-bold text-gray-600">Category<select aria-label="Filter by category" value={selectedCategory} onChange={(event) => onCategoryChange(event.target.value)} className={selectClass}><option value="All">All categories</option>{CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}</select></label>
                            <label className="block text-[10px] font-bold text-gray-600">Price<select aria-label="Filter by price" value={priceRange} onChange={(event) => onPriceRangeChange(event.target.value as PriceRange)} className={selectClass}>{priceOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                            <label className="block text-[10px] font-bold text-gray-600">Sort<select aria-label="Sort services" value={sortBy} onChange={(event) => onSortChange(event.target.value as SortOption)} className={selectClass}><option value="popular">Most popular</option><option value="price">Lowest price</option><option value="rating">Top rated</option></select></label>
                        </div>
                    </section>
                </div>

                <div className="flex shrink-0 gap-2 border-t border-gray-200 p-3">
                    <button type="button" onClick={onClearAll} className="h-9 flex-1 rounded-lg border border-gray-300 text-xs font-bold text-gray-800 hover:bg-gray-50">Clear all</button>
                    <button type="button" onClick={onClose} className="h-9 flex-1 rounded-lg bg-primary-700 text-xs font-bold text-white hover:bg-primary-800">Show results</button>
                </div>
            </aside>
        </div>
    );
};
