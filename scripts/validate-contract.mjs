import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFileSync(resolve(root, file), 'utf8');
const checks = [
    ['secure booking migration exists', existsSync(resolve(root, 'supabase_api.sql'))],
    ['soft-delete migration exists', existsSync(resolve(root, 'supabase_soft_delete.sql'))],
    ['verified reviews migration exists', existsSync(resolve(root, 'supabase_reviews.sql'))],
    ['verified review rules are enforced', read('supabase_reviews.sql').includes('submit_service_review') && read('supabase_reviews.sql').includes("status = 'completed'") && read('supabase_reviews.sql').includes('revoke delete on public.service_reviews')],
    ['ratings are calculated from published reviews', read('supabase_reviews.sql').includes('refresh_catalog_item_rating') && read('supabase_reviews.sql').includes('refresh_deal_rating') && read('supabase_reviews.sql').includes('get_public_review_summary') && read('src/components/feature/GoogleReviews.tsx').includes("supabase.rpc('get_public_review_summary')")],
    ['fake review cards are removed', !read('src/components/feature/GoogleReviews.tsx').includes('const REVIEWS') && !read('src/components/feature/GoogleReviews.tsx').includes('4.9 / 5.0')],
    ['catalog cards require real review counts', read('src/context/CatalogContext.tsx').includes('reviewCount > 0 ?') && read('src/components/feature/DiscoveryGrid.tsx').includes('service.reviewCount') && read('src/components/feature/FlashDeals.tsx').includes('deal.reviewCount')],
    ['booking modal uses real service ratings', !read('src/components/feature/BookingModal.tsx').includes('4.9 out of 5') && read('src/components/feature/BookingModal.tsx').includes('service.reviewCount')],
    ['rating sort ignores unreviewed legacy aggregates', read('src/pages/HomePage.tsx').includes('a.reviewCount') && read('src/pages/HomePage.tsx').includes('b.reviewCount')],
    ['offers load review aggregates when available', read('src/context/CatalogContext.tsx').includes("select('id, rating, review_count')") && read('supabase_reviews.sql').includes('deal_id uuid')],
    ['multilingual catalog migration exists', existsSync(resolve(root, 'supabase_multilingual_catalog.sql'))],
    ['French translation seed exists', existsSync(resolve(root, 'supabase_catalog_translations_fr_seed.sql'))],
    ['Hindi translation seed exists', existsSync(resolve(root, 'supabase_catalog_translations_hi_seed.sql'))],
    ['multilingual translation tables are defined', read('supabase_multilingual_catalog.sql').includes('catalog_item_translations') && read('supabase_multilingual_catalog.sql').includes('deal_translations') && read('supabase_multilingual_catalog.sql').includes('catalog_category_translations')],
    ['translation seeds are idempotent', ['supabase_catalog_translations_fr_seed.sql', 'supabase_catalog_translations_hi_seed.sql'].every(file => read(file).includes('on conflict (item_id, language_code) do update') && read(file).includes('on conflict (deal_id, language_code) do update') && read(file).includes('on conflict (category_id, language_code) do update'))],
    ['create_booking RPC is defined', read('supabase_api.sql').includes('create or replace function public.create_booking')],
    ['direct booking insert is revoked', read('supabase_api.sql').includes('revoke insert on public.bookings')],
    ['hard deletes are blocked in SQL', read('supabase_soft_delete.sql').includes('prevent_hard_delete') && read('supabase_soft_delete.sql').includes('revoke delete')],
    ['booking archive RPC is used', read('supabase_soft_delete.sql').includes('soft_delete_booking') && read('src/context/BookingContext.tsx').includes("supabase.rpc('soft_delete_booking'")],
    ['wishlist archive RPC is used', read('supabase_soft_delete.sql').includes('set_wishlist_item') && read('src/context/WishlistContext.tsx').includes("supabase.rpc('set_wishlist_item'")],
    ['frontend calls create_booking RPC', read('src/context/BookingContext.tsx').includes("supabase.rpc('create_booking'")],
    ['frontend has no direct booking insert', !read('src/context/BookingContext.tsx').includes("from('bookings').insert")],
    ['frontend has no direct delete calls', !read('src/context/BookingContext.tsx').includes(".delete()") && !read('src/context/WishlistContext.tsx').includes(".delete()")],
    ['catalog has no local fallback imports', !read('src/context/CatalogContext.tsx').includes("../data/services") && !read('src/context/CatalogContext.tsx').includes("../data/packages")],
    ['admin catalog supports add, edit and soft archive', read('src/pages/CatalogAdminPage.tsx').includes("from('catalog_items').insert") && read('src/pages/CatalogAdminPage.tsx').includes("from('catalog_items').update") && read('src/pages/CatalogAdminPage.tsx').includes('deleted_at') && !read('src/pages/CatalogAdminPage.tsx').includes("from('catalog_items').delete")],
    ['admin deals supports add, edit and soft archive', read('src/pages/AdminDealsPage.tsx').includes("from('deals').insert") && read('src/pages/AdminDealsPage.tsx').includes("from('deals').update") && read('src/pages/AdminDealsPage.tsx').includes('deleted_at') && !read('src/pages/AdminDealsPage.tsx').includes("from('deals').delete")],
    ['storefront only shows live deals', read('src/context/CatalogContext.tsx').includes(".lte('starts_at', now)") && read('src/context/CatalogContext.tsx').includes("ends_at.is.null,ends_at.gt.")],
    ['catalog resolves requested language with English fallback', read('src/context/CatalogContext.tsx').includes("new Set([localeCode(language), 'en'])") && read('src/context/CatalogContext.tsx').includes("language_code === 'en'")],
    ['localized service cards use language context', read('src/components/feature/DiscoveryGrid.tsx').includes("useLanguage()") && read('src/components/feature/FlashDeals.tsx').includes("useLanguage()") && read('src/components/feature/BookingModal.tsx').includes("useLanguage()")],
    ['booking pricing uses stable service slugs', read('src/types/index.ts').includes('slug?: string') && read('src/components/feature/BookingModal.tsx').includes('HOURLY_SERVICE_SLUGS') && read('src/components/feature/BookingModal.tsx').includes("service.slug === 'floor-cleaning'")],
    ['admin translation editor is routed', read('src/App.tsx').includes('/admin/translations') && existsSync(resolve(root, 'src/pages/AdminTranslationsPage.tsx'))],
    ['deal featured state is mapped from Supabase', read('src/context/CatalogContext.tsx').includes('is_featured') && read('src/context/CatalogContext.tsx').includes('row.is_featured')],
  ['mobile auth redirect is configurable', read('src/context/AuthContext.tsx').includes('VITE_AUTH_REDIRECT_URL')],
    ['API documentation exists', existsSync(resolve(root, 'API_DOCUMENTATION.html'))],
    ['Postman collection exists', existsSync(resolve(root, 'Purity-Supabase.postman_collection.json'))],
    ['Postman environment exists', existsSync(resolve(root, 'Purity-Supabase.postman_environment.json'))],
];

const failures = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
if (failures.length) process.exit(1);
