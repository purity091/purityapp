import React, { createContext, useContext, useEffect, useState } from 'react';
import { Service } from '../types';
import { services as fallbackServices } from '../data/services';
import { packages as fallbackPackages } from '../data/packages';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';

interface CatalogContextValue {
    services: Service[];
    packages: Service[];
    loading: boolean;
    usingDatabase: boolean;
}

interface CatalogRow {
    id: string;
    slug: string;
    item_type: 'service' | 'package';
    name: string;
    short_description?: string | null;
    description?: string | null;
    base_price: number | string;
    compare_at_price?: number | string | null;
    price_unit?: string | null;
    rating?: number | string | null;
    total_bookings?: number | string | null;
    sort_order?: number | null;
    metadata?: Record<string, unknown> | null;
    catalog_categories?: { name?: string | null } | Array<{ name?: string | null }> | null;
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
    sort_order?: number | null;
}

interface CatalogData {
    services: Service[];
    packages: Service[];
}

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);
let catalogRequest: Promise<CatalogData | null> | null = null;

const metadataString = (metadata: Record<string, unknown> | null | undefined, key: string) => {
    const value = metadata?.[key];
    return typeof value === 'string' ? value : undefined;
};

const metadataBoolean = (metadata: Record<string, unknown> | null | undefined, key: string) => metadata?.[key] === true;

const categoryName = (row: CatalogRow) => {
    if (Array.isArray(row.catalog_categories)) return row.catalog_categories[0]?.name || 'Home Cleaning';
    return row.catalog_categories?.name || 'Home Cleaning';
};

const mapCatalogItem = (row: CatalogRow): Service => {
    const metadata = row.metadata || {};
    const media = [...(row.catalog_item_media || [])].sort((a, b) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)) || (a.sort_order || 0) - (b.sort_order || 0));
    return {
        id: row.id,
        name: row.name,
        description: row.description || row.short_description || '',
        price: Number(row.base_price),
        originalPrice: row.compare_at_price == null ? undefined : Number(row.compare_at_price),
        image: media[0]?.url || metadataString(metadata, 'image') || '/logo.png',
        category: categoryName(row),
        rating: Number(row.rating || 0),
        offerTag: metadataString(metadata, 'offer_tag'),
        isPopular: metadataBoolean(metadata, 'is_popular'),
        soldCount: Number(row.total_bookings || 0),
        icon: metadataString(metadata, 'icon'),
        features: Array.isArray(metadata.features) ? metadata.features.filter((item): item is string => typeof item === 'string') : undefined,
        priceUnit: row.price_unit || undefined,
    };
};

const mapDeal = (row: DealRow): Service => {
    const metadata = row.metadata || {};
    return {
        id: row.id,
        name: row.title,
        description: row.description || '',
        price: Number(row.price),
        originalPrice: row.compare_at_price == null ? undefined : Number(row.compare_at_price),
        image: row.image_url || metadataString(metadata, 'image') || '/logo.png',
        category: metadataString(metadata, 'category') || 'Offers',
        rating: Number(metadata.rating || 0),
        offerTag: metadataString(metadata, 'offer_tag') || 'Limited offer',
        isPopular: metadataBoolean(metadata, 'is_featured'),
        soldCount: Number(metadata.sold_count || 0),
        priceUnit: 'per package',
    };
};

const fetchCatalog = async (): Promise<CatalogData | null> => {
    try {
        const [servicesResult, dealsResult] = await Promise.all([
            supabase.from('catalog_items').select('id, slug, item_type, name, short_description, description, base_price, compare_at_price, price_unit, rating, total_bookings, sort_order, metadata, catalog_categories(name), catalog_item_media(url, alt_text, is_primary, sort_order)').eq('status', 'published').order('sort_order', { ascending: true }),
            supabase.from('deals').select('id, slug, title, description, image_url, price, compare_at_price, currency, metadata, sort_order').eq('status', 'published').order('sort_order', { ascending: true }),
        ]);
        if (servicesResult.error || dealsResult.error) {
            console.warn('Catalog database is not ready; using the local catalog fallback.', servicesResult.error || dealsResult.error);
            return null;
        }
        const databaseItems = (servicesResult.data || []) as CatalogRow[];
        const databaseServices = databaseItems.filter((item) => item.item_type === 'service').map(mapCatalogItem);
        const databasePackages = databaseItems.filter((item) => item.item_type === 'package').map(mapCatalogItem);
        const databaseDeals = ((dealsResult.data || []) as DealRow[]).map(mapDeal);
        const databasePackagesAndDeals = [...databasePackages, ...databaseDeals];
        return {
            services: databaseServices.length ? databaseServices : fallbackServices,
            packages: databasePackagesAndDeals.length ? databasePackagesAndDeals : fallbackPackages,
        };
    } catch (error) {
        console.warn('Could not load the catalog; using the local catalog fallback.', error);
        return null;
    }
};

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');
    const [catalog, setCatalog] = useState<CatalogData>({ services: fallbackServices, packages: fallbackPackages });
    const [loading, setLoading] = useState(isSupabaseConfigured() && !isAdminRoute);
    const [usingDatabase, setUsingDatabase] = useState(false);

    useEffect(() => {
        if (!isSupabaseConfigured() || isAdminRoute) {
            setLoading(false);
            return;
        }
        if (!catalogRequest) catalogRequest = fetchCatalog();
        let active = true;
        catalogRequest
            .then(data => {
                if (!active) return;
                if (data) {
                    setCatalog(data);
                    setUsingDatabase(data.services !== fallbackServices || data.packages !== fallbackPackages);
                }
            })
            .catch(error => {
                if (active) console.warn('Catalog request failed; keeping the local catalog fallback.', error);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [isAdminRoute]);

    return <CatalogContext.Provider value={{ ...catalog, loading, usingDatabase }}>{children}</CatalogContext.Provider>;
};

export const useCatalog = () => {
    const context = useContext(CatalogContext);
    if (!context) throw new Error('useCatalog must be used within a CatalogProvider');
    return context;
};
