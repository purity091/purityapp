# Purity

React + TypeScript booking platform for Purity home-cleaning services in Dubai.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Production build

```bash
npm run lint
npm run build
```

Copy `.env.example` to `.private/.env` when local environment configuration is needed. The `.private/` folder is ignored by Git and Vite is configured to load environment files from it. Never commit real credentials or deployment secrets.

The Supabase schemas are in `supabase_bookings.sql`, `supabase_wishlist.sql`, `supabase_catalog.sql`, `supabase_api.sql`, `supabase_soft_delete.sql` and `supabase_catalog_seed.sql`. Apply the first five in that order, then run `supabase_catalog_seed.sql` to import the current Purity services and legacy offers. `supabase_soft_delete.sql` is mandatory: it adds `deleted_at`, blocks hard deletes, and provides soft-delete RPCs. Supabase mode is enabled only when `VITE_USE_SUPABASE=true` and the public URL and anonymous key are configured.

If an existing Supabase project reports `column ... deleted_at does not exist`, run `supabase_soft_delete_hotfix.sql` once in the Supabase SQL Editor, then run the complete `supabase_soft_delete.sql` file. The hotfix is repeatable and only adds missing columns/indexes; it does not delete or overwrite data.

## Customer accounts and PWA

Customer accounts use Supabase Auth with a required email, UAE mobile number, and password. The email is used for sign-in and password recovery; the mobile number is stored only for service communication. Run all five SQL migrations in the Supabase SQL Editor, then configure these Vite variables in the production environment:

```bash
VITE_USE_SUPABASE=true
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_AUTH_REDIRECT_URL=https://your-domain.example/?reset=1
```

In Supabase Auth settings, enable Email provider. To keep registration without an extra confirmation step, disable email confirmation; otherwise Supabase will request its normal email confirmation. Customer bookings are protected by RLS and each account only receives its own bookings and notifications. Booking creation must go through the `create_booking` RPC from `supabase_api.sql`; it validates customer data, calculates the total in the database, forces `pending` status, and supports idempotent retries through `p_client_request_id`. Direct authenticated inserts into `bookings` are revoked by that migration.

The admin bookings screen uses server-side filtering, exact counts, and 25-row pagination; it does not load the complete bookings table into the browser.

For the existing admin dashboard, create an admin user in Supabase Auth and set `raw_app_meta_data.role` to `admin` using a privileged SQL session. The frontend never receives a service key.

Admin routes are `/admin` (login), `/admin/overview`, `/admin/dashboard` (bookings), `/admin/catalog` (services and packages), `/admin/deals` (offers), `/admin/customers`, and `/admin/audit-log`. Every protected route requires a Supabase Auth session whose `app_metadata.role` is `admin`.

The scalable catalog schema is in `supabase_catalog.sql`. It supports hierarchical categories, services, packages, service variants, multiple media assets, service areas, time-bound deals, bundle contents, coupon codes, inventory, per-customer limits, atomic redemptions, and historical booking price snapshots. Supabase is the only source for application data; the UI does not fall back to a local catalog when the database is unavailable.

All application tables use `deleted_at` for retention. The frontend never performs a hard delete. Booking archive uses an update, wishlist archive uses `set_wishlist_item`, and the database trigger rejects direct `DELETE` statements on application tables.

## Postman collection for mobile development

The complete mobile API collection is available in `Purity-Supabase.postman_collection.json`, with a separate environment in `Purity-Supabase.postman_environment.json`. Import both files into Postman, select the environment, fill `supabase_url` and `anon_key`, then run `01 - Authentication > Sign In`. The test script stores `access_token`, `refresh_token` and `user_id` automatically for the remaining requests.

The collection covers authentication, published catalog, deals, categories, service areas, customer profile, secure booking RPC, customer bookings, notifications, wishlist soft-delete, admin booking management, statistics and audit logs. Do not give the mobile developer `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY` or `CRON_SECRET`.

## Supabase keepalive

The Vercel deployment includes a protected `/api/keepalive` endpoint and a daily Vercel Cron job. The endpoint performs a minimal read of `bookings.id` using the server-only Supabase key, which helps prevent inactivity on plans that pause databases.

Add these environment variables to the Vercel project:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=replace-with-your-server-only-secret-key
CRON_SECRET=your-long-random-cron-secret
```

Never use `SUPABASE_SECRET_KEY` or `CRON_SECRET` as `VITE_*` variables. After deploying, check `https://your-domain.example/api/keepalive` without an authorization header; a `401` response confirms that the endpoint is protected. The scheduled request is authorized automatically by Vercel when `CRON_SECRET` is configured.

Example deal flow after catalog import:

```sql
insert into public.deals (slug, title, status, starts_at, ends_at, discount_type, discount_value, price, compare_at_price, inventory_total, inventory_remaining, per_user_limit)
values ('spring-home-refresh', 'Spring Home Refresh', 'published', now(), now() + interval '30 days', 'fixed', 100, 299, 399, 500, 500, 1);

-- Link the offer to one or more services/packages:
insert into public.deal_items (deal_id, item_id, quantity)
select d.id, i.id, 1 from public.deals d, public.catalog_items i
where d.slug = 'spring-home-refresh' and i.slug = 'regular-cleaning';
```

Use `claim_deal(deal_id, booking_id, quantity, code)` from a trusted authenticated flow to reserve stock and create a unique voucher code atomically.

## Legal pages and consent

The public legal routes are `/terms`, `/privacy`, `/consumer-rights`, and `/cookies`. They are linked from the desktop footer and mobile home navigation. Registration and booking require acceptance of the Terms of Use and Privacy Policy. Optional Google Analytics, Google Tag Manager, and Yandex Metrika scripts are loaded only after cookie analytics consent; essential application storage remains available for authentication, PWA, and preferences.

The legal pages use the company information supplied for publication: PURITY PREMIUM TECHNICAL SERVICES L.L.C, Limited Liability Company (LLC), Main License No. 917883, registered office Office F-204-62, Al Baraha, Dubai, United Arab Emirates. The supplied address reference is retained on the pages in its original form. The designated contact is info@purity-services.com and +971 54 455 6106.

The production build generates the PWA manifest and service worker automatically. The install button is available in the navigation; browsers that do not expose an install prompt show the native “Add to Home Screen” guidance.
