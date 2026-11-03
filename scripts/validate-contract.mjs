import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFileSync(resolve(root, file), 'utf8');
const checks = [
  ['secure booking migration exists', existsSync(resolve(root, 'supabase_api.sql'))],
  ['create_booking RPC is defined', read('supabase_api.sql').includes('create or replace function public.create_booking')],
  ['direct booking insert is revoked', read('supabase_api.sql').includes('revoke insert on public.bookings')],
  ['frontend calls create_booking RPC', read('src/context/BookingContext.tsx').includes("supabase.rpc('create_booking'")],
  ['frontend has no direct booking insert', !read('src/context/BookingContext.tsx').includes("from('bookings').insert")],
  ['mobile auth redirect is configurable', read('src/context/AuthContext.tsx').includes('VITE_AUTH_REDIRECT_URL')],
  ['API documentation exists', existsSync(resolve(root, 'API_DOCUMENTATION.html'))],
];

const failures = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
if (failures.length) process.exit(1);
