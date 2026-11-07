import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFileSync(resolve(root, file), 'utf8');
const checks = [
    ['secure booking migration exists', existsSync(resolve(root, 'supabase_api.sql'))],
    ['soft-delete migration exists', existsSync(resolve(root, 'supabase_soft_delete.sql'))],
    ['create_booking RPC is defined', read('supabase_api.sql').includes('create or replace function public.create_booking')],
    ['direct booking insert is revoked', read('supabase_api.sql').includes('revoke insert on public.bookings')],
    ['hard deletes are blocked in SQL', read('supabase_soft_delete.sql').includes('prevent_hard_delete') && read('supabase_soft_delete.sql').includes('revoke delete')],
    ['booking archive RPC is used', read('supabase_soft_delete.sql').includes('soft_delete_booking') && read('src/context/BookingContext.tsx').includes("supabase.rpc('soft_delete_booking'")],
    ['wishlist archive RPC is used', read('supabase_soft_delete.sql').includes('set_wishlist_item') && read('src/context/WishlistContext.tsx').includes("supabase.rpc('set_wishlist_item'")],
    ['frontend calls create_booking RPC', read('src/context/BookingContext.tsx').includes("supabase.rpc('create_booking'")],
    ['frontend has no direct booking insert', !read('src/context/BookingContext.tsx').includes("from('bookings').insert")],
    ['frontend has no direct delete calls', !read('src/context/BookingContext.tsx').includes(".delete()") && !read('src/context/WishlistContext.tsx').includes(".delete()")],
    ['catalog has no local fallback imports', !read('src/context/CatalogContext.tsx').includes("../data/services") && !read('src/context/CatalogContext.tsx').includes("../data/packages")],
  ['mobile auth redirect is configurable', read('src/context/AuthContext.tsx').includes('VITE_AUTH_REDIRECT_URL')],
    ['API documentation exists', existsSync(resolve(root, 'API_DOCUMENTATION.html'))],
    ['Postman collection exists', existsSync(resolve(root, 'Purity-Supabase.postman_collection.json'))],
    ['Postman environment exists', existsSync(resolve(root, 'Purity-Supabase.postman_environment.json'))],
];

const failures = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
if (failures.length) process.exit(1);
