import React, { createContext, useContext, useEffect, useState } from 'react';
import { Service } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';
import { Language, useLanguage } from './LanguageContext';

interface CatalogContextValue {
    services: Service[];
    packages: Service[];
    loading: boolean;
    usingDatabase: boolean;
}

interface CatalogRow {
    id: string;
    category_id?: string | null;
    slug: string;
    item_type: 'service' | 'package';
    name: string;
    short_description?: string | null;
    description?: string | null;
    base_price: number | string;
    compare_at_price?: number | string | null;
    price_unit?: string | null;
    rating?: number | string | null;
    review_count?: number | string | null;
    total_bookings?: number | string | null;
    sort_order?: number | null;
    metadata?: Record<string, unknown> | null;
    catalog_categories?: { id?: string | null; name?: string | null } | Array<{ id?: string | null; name?: string | null }> | null;
    catalog_item_media?: Array<{ url: string; alt_text?: string | null; is_primary?: boolean; sort_order?: number | null }> | null;
}

interface DealRow {
    id: string;
    slug: string;
    title: string;
    description?: string | null;
    image_url?: string | null;
    price: number | string;
    compare_at_price?: number | string | null;
    currency?: string | null;
    metadata?: Record<string, unknown> | null;
    rating?: number | string | null;
    review_count?: number | string | null;
    sort_order?: number | null;
    is_featured?: boolean | null;
}

interface CategoryTranslationRow { category_id: string; language_code: string; name: string; description?: string | null; }
interface ItemTranslationRow { item_id: string; language_code: string; name: string; short_description?: string | null; description?: string | null; metadata?: Record<string, unknown> | null; }
interface DealTranslationRow { deal_id: string; language_code: string; title: string; subtitle?: string | null; description?: string | null; terms?: string | null; metadata?: Record<string, unknown> | null; }

interface CatalogData {
    services: Service[];
    packages: Service[];
}

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);
const catalogRequests = new Map<Language, Promise<CatalogData | null>>();

export const invalidateCatalogCache = () => {
    catalogRequests.clear();
};

const metadataString = (metadata: Record<string, unknown> | null | undefined, key: string) => {
    const value = metadata?.[key];
    return typeof value === 'string' ? value : undefined;
};

const metadataBoolean = (metadata: Record<string, unknown> | null | undefined, key: string) => metadata?.[key] === true;

const localeCode = (language: Language) => language.toLowerCase().split('-')[0];

const translatedValue = <T extends { language_code: string }>(rows: T[] | undefined, language: Language) => {
    const requested = localeCode(language);
    return rows?.find(row => row.language_code === requested) || rows?.find(row => row.language_code === 'en');
};

const categoryName = (row: CatalogRow, translations: CategoryTranslationRow[], language: Language) => {
    const category = Array.isArray(row.catalog_categories) ? row.catalog_categories[0] : row.catalog_categories;
    const translation = translatedValue(translations.filter(item => item.category_id === row.category_id), language);
    return translation?.name || category?.name || 'Home Cleaning';
};

const baseCategoryName = (row: CatalogRow) => {
    const category = Array.isArray(row.catalog_categories) ? row.catalog_categories[0] : row.catalog_categories;
    return category?.name || 'Home Cleaning';
};

const mapCatalogItem = (row: CatalogRow, translations: ItemTranslationRow[], categoryTranslations: CategoryTranslationRow[], language: Language): Service => {
    const metadata = row.metadata || {};
    const translation = translatedValue(translations.filter(item => item.item_id === row.id), language);
    const translatedMetadata = translation?.metadata || {};
    const features = translatedMetadata.features ?? metadata.features;
    const media = [...(row.catalog_item_media || [])].sort((a, b) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)) || (a.sort_order || 0) - (b.sort_order || 0));
    const reviewCount = Number(row.review_count || 0);
    return {
        id: row.id,
        slug: row.slug,
        name: translation?.name || row.name,
        description: translation?.description || translation?.short_description || row.description || row.short_description || '',
        price: Number(row.base_price),
        originalPrice: row.compare_at_price == null ? undefined : Number(row.compare_at_price),
        image: media[0]?.url || metadataString(metadata, 'image') || '/logo.png',
        category: categoryName(row, categoryTranslations, language),
        categoryKey: baseCategoryName(row),
        rating: reviewCount > 0 ? Number(row.rating || 0) : 0,
        reviewCount,
        offerTag: metadataString(translatedMetadata, 'offer_tag') || metadataString(metadata, 'offer_tag'),
        isPopular: metadataBoolean(metadata, 'is_popular'),
        soldCount: Number(row.total_bookings || 0),
        icon: metadataString(metadata, 'icon'),
        features: Array.isArray(features) ? features.filter((item: unknown): item is string => typeof item === 'string') : undefined,
        priceUnit: row.price_unit || undefined,
    };
};

const mapDeal = (row: DealRow, translations: DealTranslationRow[], language: Language): Service => {
    const metadata = row.metadata || {};
    const translation = translatedValue(translations.filter(item => item.deal_id === row.id), language);
    const translatedMetadata = translation?.metadata || {};
    const reviewCount = Number(row.review_count || 0);
    return {
        id: row.id,
        slug: row.slug,
        name: translation?.title || row.title,
        description: translation?.description || row.description || '',
        price: Number(row.price),
        originalPrice: row.compare_at_price == null ? undefined : Number(row.compare_at_price),
        image: row.image_url || metadataString(metadata, 'image') || '/logo.png',
        category: metadataString(translatedMetadata, 'category') || metadataString(metadata, 'category') || 'Offers',
        rating: reviewCount > 0 ? Number(row.rating || 0) : 0,
        reviewCount,
        offerTag: metadataString(translatedMetadata, 'offer_tag') || metadataString(metadata, 'offer_tag') || 'Limited offer',
        isPopular: Boolean(row.is_featured || metadataBoolean(metadata, 'is_featured')),
        soldCount: Number(metadata.sold_count || 0),
        priceUnit: 'per package',
    };
};

const fetchCatalog = async (language: Language): Promise<CatalogData | null> => {
    try {
        const now = new Date().toISOString();
        const languages = [...new Set([localeCode(language), 'en'])];
        const [servicesResult, dealsResult, itemTranslationsResult, categoryTranslationsResult, dealTranslationsResult] = await Promise.all([
            supabase.from('catalog_items').select('id, category_id, slug, item_type, name, short_description, description, base_price, compare_at_price, price_unit, rating, review_count, total_bookings, sort_order, metadata, catalog_categories(id, name), catalog_item_media(url, alt_text, is_primary, sort_order)').eq('status', 'published').is('deleted_at', null).order('sort_order', { ascending: true }),
            supabase.from('deals').select('id, slug, title, description, image_url, price, compare_at_price, currency, metadata, sort_order, is_featured').eq('status', 'published').is('deleted_at', null).lte('starts_at', now).or(`ends_at.is.null,ends_at.gt.${now}`).order('sort_order', { ascending: true }),
            supabase.from('catalog_item_translations').select('item_id, language_code, name, short_description, description, metadata').in('language_code', languages).is('deleted_at', null),
            supabase.from('catalog_category_translations').select('category_id, language_code, name, description').in('language_code', languages).is('deleted_at', null),
            supabase.from('deal_translations').select('deal_id, language_code, title, subtitle, description, terms, metadata').in('language_code', languages).is('deleted_at', null),
        ]);
        if (servicesResult.error) throw servicesResult.error;
        if (dealsResult.error) console.warn('Could not load active deals; services will still be shown.', dealsResult.error);
        const translationErrors = [itemTranslationsResult.error, categoryTranslationsResult.error, dealTranslationsResult.error].filter(Boolean);
        if (translationErrors.length > 0) console.warn('Multilingual catalog migration is not available yet; using base catalog text.', translationErrors[0]);
        const databaseItems = (servicesResult.data || []) as CatalogRow[];
        const itemTranslations = itemTranslationsResult.error ? [] : (itemTranslationsResult.data || []) as ItemTranslationRow[];
        const categoryTranslations = categoryTranslationsResult.error ? [] : (categoryTranslationsResult.data || []) as CategoryTranslationRow[];
        const dealTranslations = dealTranslationsResult.error ? [] : (dealTranslationsResult.data || []) as DealTranslationRow[];
        const databaseServices = databaseItems.filter((item) => item.item_type === 'service').map(item => mapCatalogItem(item, itemTranslations, categoryTranslations, language));
        const databasePackages = databaseItems.filter((item) => item.item_type === 'package').map(item => mapCatalogItem(item, itemTranslations, categoryTranslations, language));
        let databaseDeals: Service[] = [];
        if (!dealsResult.error) {
            const dealRows = (dealsResult.data || []) as DealRow[];
            const dealIds = dealRows.map(deal => deal.id);
            const dealRatingsResult = dealIds.length > 0
                ? await supabase.from('deals').select('id, rating, review_count').in('id', dealIds)
                : { data: [], error: null };
            const dealRatings = new Map((dealRatingsResult.data || []).map(row => [row.id, row]));
            databaseDeals = dealRows.map(deal => mapDeal({ ...deal, ...(dealRatings.get(deal.id) || {}) }, dealTranslations, language));
        }
        const databasePackagesAndDeals = [...databasePackages, ...databaseDeals];
        return {
            services: databaseServices,
            packages: databasePackagesAndDeals,
        };
    } catch (error) {
        console.error('Could not load the catalog from Supabase.', error);
        return null;
    }
};

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const { language } = useLanguage();
    const isAdminRoute = location.pathname.startsWith('/admin');
    const [catalog, setCatalog] = useState<CatalogData>({ services: [], packages: [] });
    const [loading, setLoading] = useState(isSupabaseConfigured() && !isAdminRoute);
    const [usingDatabase, setUsingDatabase] = useState(false);

    useEffect(() => {
        if (!isSupabaseConfigured() || isAdminRoute) {
            setLoading(false);
            return;
        }
        const cachedRequest = catalogRequests.get(language);
        if (!cachedRequest) catalogRequests.set(language, fetchCatalog(language));
        let active = true;
        setLoading(true);
        catalogRequests.get(language)!
            .then(data => {
                if (!active) return;
                if (data) {
                    setCatalog(data);
                    setUsingDatabase(true);
                }
            })
            .catch(error => {
                if (active) console.error('Catalog request failed; Supabase is the only catalog source.', error);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [isAdminRoute, language]);

    return <CatalogContext.Provider value={{ ...catalog, loading, usingDatabase }}>{children}</CatalogContext.Provider>;
};

export const useCatalog = () => {
    const context = useContext(CatalogContext);
    if (!context) throw new Error('useCatalog must be used within a CatalogProvider');
    return context;
};
