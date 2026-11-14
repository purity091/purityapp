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
import { useCatalog } from '../context/CatalogContext';
import { Service, CATEGORIES } from '../types';
import { SearchX, Sparkles, Grid3X3, SlidersHorizontal, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

interface HomeNavigationState {
    searchQuery?: string;
    selectedCategory?: string;
    serviceId?: string;
    openMobileTools?: boolean;
    scrollTo?: string;
    openAuth?: boolean;
}

export const HomePage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { services } = useCatalog();
    const { t } = useLanguage();
    const navigationState = (location.state || {}) as HomeNavigationState;
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [searchQuery, setSearchQuery] = useState(navigationState.searchQuery || '');
    const [sortBy, setSortBy] = useState<SortOption>('popular');
    const [priceRange, setPriceRange] = useState<PriceRange>('all');
    const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);
    const categoryLabels = useMemo(() => Object.fromEntries(CATEGORIES.map(category => [category, services.find(service => service.categoryKey === category)?.category || category])), [services]);

    useEffect(() => {
        const state = (location.state || {}) as HomeNavigationState;
        const hasNavigationState = Object.keys(state).length > 0;
        if (!hasNavigationState || state.openAuth) return;

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
    }, [location.pathname, location.state, navigate, services]);

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
            result = result.filter(s => (s.categoryKey || s.category) === selectedCategory);
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
            result.sort((a, b) => {
                const aReviews = a.reviewCount || 0;
                const bReviews = b.reviewCount || 0;
                if ((bReviews > 0 ? 1 : 0) !== (aReviews > 0 ? 1 : 0)) return (bReviews > 0 ? 1 : 0) - (aReviews > 0 ? 1 : 0);
                if (bReviews === 0 && aReviews === 0) return 0;
                return b.rating - a.rating || bReviews - aReviews;
            });
        } else {
            result.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
        }

        return result;
    }, [services, searchQuery, selectedCategory, priceRange, sortBy]);

    const servicesByCategory = useMemo(() => {
        const grouped: Record<string, Service[]> = {};
        for (const s of filteredServices) {
            const categoryKey = s.categoryKey || s.category;
            if (!grouped[categoryKey]) grouped[categoryKey] = [];
            grouped[categoryKey].push(s);
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
            />

            <MobileBrowseControls
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                priceRange={priceRange}
                sortBy={sortBy}
                onCategoryChange={setSelectedCategory}
                onPriceRangeChange={setPriceRange}
                onSortChange={setSortBy}
                onOpenDrawer={() => setIsMobileToolsOpen(true)}
                onClearAll={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setPriceRange('all');
                    setSortBy('popular');
                }}
                categoryLabels={categoryLabels}
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
                    categoryLabels={categoryLabels}
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
                categoryLabels={categoryLabels}
            />

            {/* Catalogue content follows the unified page header */}
            <main className="w-full">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Flash Deals — show on both mobile and desktop */}
                    {!isSearching && selectedCategory === 'All' && (
                        <FlashDeals onSelect={setSelectedService} />
                    )}

                    {/* Search Results Header */}
                    {isSearching && (
                        <div className="mb-6 pt-4">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                                {t('search')}
                            </p>
                            <h2 className="text-xl font-extrabold text-gray-900">
                                {hasResults
                                    ? `${filteredServices.length} ${t('resultsFor')} "${searchQuery}"`
                                    : `${t('noResultsFor')} "${searchQuery}"`
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
                                <h3 className="text-xl font-extrabold text-gray-900">{t('noServices')}</h3>
                                <p className="text-sm text-gray-500 mt-1 max-w-xs">
                                    {t('noServices')} — {t('browseAllServices')}.
                                </p>
                            </div>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setPriceRange('all'); setSortBy('popular'); }}
                                className="bg-primary-600 text-white text-sm font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-primary-700 transition-colors shadow-sm"
                            >
                                <Sparkles size={16} />
                                {t('browseAllServices')}
                            </button>
                        </div>
                    ) : (
                        <div id="services" className="space-y-3 lg:space-y-5 mb-8">
                            {isSearching ? (
                                Object.entries(servicesByCategory).map(([category, catServices]) => (
                                    <div id={`cat-${category}`} key={category}>
                                        <DiscoveryGrid
                                            title={catServices[0]?.category || category}
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
                                            title={catServices[0]?.category || category}
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

const MobileInfoNavigation: React.FC = () => {
    const { t } = useLanguage();
    return (
    <section className="px-4 py-6" aria-label={t('moreAbout')}>
        <p className="mb-3 text-[10px] font-black uppercase text-gray-500">{t('moreAbout')}</p>
        <div className="grid grid-cols-3 gap-2">
            <Link to="/about" className="min-w-0 rounded-xl bg-gray-50 px-2 py-2.5 text-center shadow-sm">
                <span className="block truncate text-[11px] font-extrabold text-gray-900">{t('whyPurity')}</span>
                <span className="mt-0.5 block text-[9px] font-semibold text-gray-500">{t('standards')}</span>
            </Link>
                <Link to="/faq" className="min-w-0 rounded-xl bg-gray-50 px-2 py-2.5 text-center shadow-sm">
                    <span className="block truncate text-[11px] font-extrabold text-gray-900">{t('helpFaqs')}</span>
                <span className="mt-0.5 block text-[9px] font-semibold text-gray-500">{t('beforeBooking')}</span>
            </Link>
            <Link to="/reviews" className="min-w-0 rounded-xl bg-gray-50 px-2 py-2.5 text-center shadow-sm">
                <span className="block truncate text-[11px] font-extrabold text-gray-900">{t('reviews')}</span>
                <span className="mt-0.5 block text-[9px] font-semibold text-gray-500">{t('customerStories')}</span>
            </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
            <Link to="/terms" className="rounded-xl bg-gray-50 px-2 py-2.5 text-center text-[11px] font-extrabold text-gray-700 shadow-sm">{t('terms')}</Link>
            <Link to="/privacy" className="rounded-xl bg-gray-50 px-2 py-2.5 text-center text-[11px] font-extrabold text-gray-700 shadow-sm">{t('privacy')}</Link>
            <Link to="/consumer-rights" className="rounded-xl bg-gray-50 px-2 py-2.5 text-center text-[11px] font-extrabold text-gray-700 shadow-sm">{t('consumerRights')}</Link>
            <Link to="/cookies" className="rounded-xl bg-gray-50 px-2 py-2.5 text-center text-[11px] font-extrabold text-gray-700 shadow-sm">{t('cookies')}</Link>
        </div>
    </section>
    );
};

interface MobileBrowseControlsProps {
    searchQuery: string;
    selectedCategory: string;
    priceRange: PriceRange;
    sortBy: SortOption;
    onCategoryChange: (category: string) => void;
    onPriceRangeChange: (range: PriceRange) => void;
    onSortChange: (sort: SortOption) => void;
    onClearAll: () => void;
    onOpenDrawer?: () => void;
    categoryLabels: Record<string, string>;
}

const MobileBrowseControls: React.FC<MobileBrowseControlsProps> = ({
    searchQuery,
    selectedCategory,
    priceRange,
    sortBy,
    onCategoryChange,
    onPriceRangeChange,
    onSortChange,
    onClearAll,
    onOpenDrawer,
    categoryLabels,
}) => {
    const { t } = useLanguage();
    const hasActiveFilters = Boolean(searchQuery.trim()) || selectedCategory !== 'All' || priceRange !== 'all' || sortBy !== 'popular';
    const activeFilterCount = (selectedCategory !== 'All' ? 1 : 0) + (priceRange !== 'all' ? 1 : 0) + (sortBy !== 'popular' ? 1 : 0);

    return (
        <div className="md:hidden bg-white border-b border-slate-100" aria-label={`${t('services')} & ${t('filters')}`}>
            {/* Horizontal Scrollable Category & Filter Pill Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {/* 1. Filter Drawer Trigger Chip */}
                <button
                    type="button"
                    onClick={onOpenDrawer}
                    className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition active:scale-95 ${
                        activeFilterCount > 0
                            ? 'border-primary-600 bg-primary-50 text-primary-900 ring-2 ring-primary-500/20'
                            : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                    }`}
                >
                    <SlidersHorizontal size={12} className={activeFilterCount > 0 ? 'text-primary-700' : 'text-slate-600'} />
                    <span>{t('filters')}</span>
                    {activeFilterCount > 0 && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-700 text-[10px] font-black text-white px-1 leading-none">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                <span className="h-4 w-px bg-slate-200 shrink-0" aria-hidden="true" />

                {/* 2. All Services Pill */}
                <button
                    type="button"
                    onClick={() => onCategoryChange('All')}
                    className={`flex h-8 shrink-0 items-center rounded-full px-3 text-xs font-bold transition active:scale-95 ${
                        selectedCategory === 'All'
                            ? 'bg-slate-950 text-white shadow-2xs'
                            : 'border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                >
                    {t('allServices')}
                </button>

                {/* 3. Category Pills */}
                {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => onCategoryChange(cat)}
                            className={`flex h-8 shrink-0 items-center rounded-full px-3 text-xs font-bold transition active:scale-95 ${
                                isSelected
                                    ? 'bg-primary-700 text-white shadow-2xs'
                                    : 'border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            {categoryLabels[cat] || cat}
                        </button>
                    );
                })}

                {/* 4. Quick Price Range Filter Chips */}
                <button
                    type="button"
                    onClick={() => onPriceRangeChange(priceRange === 'under-150' ? 'all' : 'under-150')}
                    className={`flex h-8 shrink-0 items-center rounded-full px-3 text-xs font-bold transition active:scale-95 ${
                        priceRange === 'under-150'
                            ? 'bg-emerald-700 text-white shadow-2xs'
                            : 'border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                >
                    {t('underAed150')}
                </button>

                {/* 5. Quick Sort: Top Rated */}
                <button
                    type="button"
                    onClick={() => onSortChange(sortBy === 'rating' ? 'popular' : 'rating')}
                    className={`flex h-8 shrink-0 items-center rounded-full px-3 text-xs font-bold transition active:scale-95 ${
                        sortBy === 'rating'
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                >
                    {t('topRated')} ★
                </button>

                {/* 6. Clear All chip if any filter is active */}
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onClearAll}
                        className="flex h-8 shrink-0 items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 text-xs font-bold text-red-700 transition active:scale-95"
                    >
                        <span>{t('reset')}</span>
                        <X size={12} strokeWidth={2.5} />
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
    categoryLabels: Record<string, string>;
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
    categoryLabels,
}) => {
    const { t } = useLanguage();
    if (!isOpen) return null;

    const selectClass = 'mt-1 block h-9 w-full rounded-lg border border-gray-300 bg-gray-50 px-2.5 text-xs font-bold text-gray-900 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-500/15';
    const priceOptions: Array<{ value: PriceRange; label: string }> = [
        { value: 'all', label: t('anyPrice') },
        { value: 'under-150', label: t('underAed150') },
        { value: '150-300', label: t('aed150to300') },
        { value: 'over-300', label: t('overAed300') },
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
        <div className="fixed inset-0 z-[70] md:hidden" role="dialog" aria-modal="true" aria-label={`${t('services')} & ${t('filters')}`}>
            <button type="button" aria-label={t('close')} className="absolute inset-0 bg-black/35" onClick={onClose} />
            <aside className="absolute right-0 top-0 flex h-full w-[min(88vw,22rem)] flex-col bg-white shadow-2xl">
                <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 px-3">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal size={16} className="text-primary-700" />
                        <h2 className="text-sm font-black text-gray-900">{t('services')} &amp; {t('filters')}</h2>
                    </div>
                    <button type="button" onClick={onClose} aria-label={t('close')} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200">
                        <X size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-3 pb-6">
                    <section>
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="flex items-center gap-1.5 text-xs font-black text-gray-900"><Grid3X3 size={14} className="text-primary-700" /> {t('services')}</h3>
                            <span className="text-[10px] font-bold text-gray-500">{totalResults} {t('available')}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                            <button type="button" onClick={() => chooseCategory('All')} className={`rounded-lg border px-2 py-2 text-left text-[11px] font-bold ${selectedCategory === 'All' ? 'border-primary-600 bg-primary-50 text-primary-900' : 'border-gray-200 bg-gray-50 text-gray-800'}`}>{t('allServices')}</button>
                            {CATEGORIES.map(category => (
                                <button type="button" key={category} onClick={() => chooseCategory(category)} className={`truncate rounded-lg border px-2 py-2 text-left text-[11px] font-bold ${selectedCategory === category ? 'border-primary-600 bg-primary-50 text-primary-900' : 'border-gray-200 bg-gray-50 text-gray-800'}`}>{categoryLabels[category] || category}</button>
                            ))}
                        </div>
                    </section>

                    <section className="mt-4 border-t border-gray-200 pt-3">
                        <h3 className="mb-2 text-xs font-black text-gray-900">{t('filters')}</h3>
                        <div className="space-y-2.5">
                            <label className="block text-[10px] font-bold text-gray-600">{t('categories')}<select aria-label={t('categories')} value={selectedCategory} onChange={(event) => onCategoryChange(event.target.value)} className={selectClass}><option value="All">{t('allCategories')}</option>{CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}</select></label>
                            <label className="block text-[10px] font-bold text-gray-600">{t('anyPrice')}<select aria-label={t('anyPrice')} value={priceRange} onChange={(event) => onPriceRangeChange(event.target.value as PriceRange)} className={selectClass}>{priceOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                            <label className="block text-[10px] font-bold text-gray-600">{t('sortBy')}<select aria-label={t('sortBy')} value={sortBy} onChange={(event) => onSortChange(event.target.value as SortOption)} className={selectClass}><option value="popular">{t('mostPopular')}</option><option value="price">{t('lowestPrice')}</option><option value="rating">{t('topRated')}</option></select></label>
                        </div>
                    </section>
                </div>

                <div className="flex shrink-0 gap-2 border-t border-gray-200 p-3">
                    <button type="button" onClick={onClearAll} className="h-9 flex-1 rounded-lg border border-gray-300 text-xs font-bold text-gray-800 hover:bg-gray-50">{t('clearAll')}</button>
                    <button type="button" onClick={onClose} className="h-9 flex-1 rounded-lg bg-primary-700 text-xs font-bold text-white hover:bg-primary-800">{t('search')}</button>
                </div>
            </aside>
        </div>
    );
};
