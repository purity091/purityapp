-- Purity initial service catalog.
-- Safe to run after the schema files or by itself on a new Supabase project.
-- Safe to re-run: services are upserted by slug and no rows are deleted.

begin;

create extension if not exists pgcrypto;

-- Keep this seed self-contained. The complete definitions remain in
-- supabase_catalog.sql; IF NOT EXISTS makes this block harmless when that
-- schema has already been applied.
create table if not exists public.catalog_categories (
  id uuid default gen_random_uuid() primary key,
  parent_id uuid references public.catalog_categories(id) on delete set null,
  slug text not null unique check (slug = lower(slug)),
  name text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  deleted_at timestamptz
);

create table if not exists public.catalog_items (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references public.catalog_categories(id) on delete set null,
  item_type text not null default 'service' check (item_type in ('service', 'package')),
  status text not null default 'draft' check (status in ('draft', 'published', 'paused', 'archived')),
  slug text not null unique check (slug = lower(slug)),
  name text not null,
  short_description text,
  description text,
  base_price numeric(12,2) not null default 0 check (base_price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= base_price),
  currency char(3) not null default 'AED',
  price_unit text,
  rating numeric(3,2) not null default 0 check (rating between 0 and 5),
  review_count integer not null default 0 check (review_count >= 0),
  popularity_score numeric(12,4) not null default 0,
  total_bookings bigint not null default 0 check (total_bookings >= 0),
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  deleted_at timestamptz
);

-- Legacy Purity offers are stored as database deals so the storefront,
-- admin panel and mobile API all read the same records.
create table if not exists public.deals (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique check (slug = lower(slug)),
  title text not null,
  subtitle text,
  description text,
  terms text,
  image_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'paused', 'expired', 'archived')),
  starts_at timestamptz not null default timezone('utc'::text, now()),
  ends_at timestamptz,
  discount_type text not null default 'fixed' check (discount_type in ('fixed', 'percentage', 'none')),
  discount_value numeric(12,2) not null default 0 check (discount_value >= 0),
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= price),
  currency char(3) not null default 'AED',
  inventory_total integer,
  inventory_remaining integer,
  per_user_limit integer,
  min_order_value numeric(12,2),
  audience text not null default 'all' check (audience in ('all', 'new_customers', 'returning_customers')),
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  deleted_at timestamptz,
  check (ends_at is null or ends_at > starts_at)
);

insert into public.catalog_categories (slug, name, sort_order, is_active)
values
  ('home-cleaning', 'Home Cleaning', 10, true),
  ('furniture', 'Furniture', 20, true),
  ('flooring', 'Flooring', 30, true),
  ('commercial', 'Commercial', 40, true),
  ('care', 'Care', 50, true),
  ('laundry', 'Laundry', 60, true),
  ('upholstery-cleaning', 'Upholstery Cleaning', 70, true),
  ('event-services', 'Event Services', 80, true)
on conflict (slug) do update set name = excluded.name, is_active = true;

with seed(slug, legacy_id, name, description, base_price, compare_at_price, price_unit, category_slug, image_url, rating, total_bookings, sort_order) as (
  values
    ('deep-cleaning', 'deep-clean', 'Deep Cleaning', 'Intensive top-to-bottom cleaning for homes, offices and commercial spaces.', 45, null, 'per hour', 'home-cleaning', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800', 5.0, 200, 10),
    ('regular-cleaning', '10', 'Regular Cleaning', 'Reliable routine cleaning for homes and offices, scheduled daily, weekly or bi-weekly.', 35, null, 'per hour', 'home-cleaning', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800', 4.8, 600, 20),
    ('floor-cleaning', '1', 'Floor Cleaning', 'Professional cleaning for tile, marble, granite, vinyl, laminate, hardwood and concrete floors.', 200, 300, 'starts from', 'flooring', 'https://images.unsplash.com/photo-1581858726788-75bc0f6a1d65?auto=format&fit=crop&q=80&w=800', 4.9, 320, 30),
    ('carpet-cleaning', '2', 'Carpet Cleaning', 'Deep sanitation that removes dust mites, allergens, bacteria, odours and embedded stains.', 200, 250, 'per carpet', 'home-cleaning', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=800', 4.8, 210, 40),
    ('mattress-cleaning', '3', 'Mattress Cleaning', 'Deep hygiene, allergen removal, stain treatment and deodorisation for mattresses.', 150, 200, 'per mattress', 'furniture', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800', 5.0, 540, 50),
    ('sofa-cleaning', '4', 'Sofa Cleaning', 'Fabric, leather, suede and microfiber sofa cleaning with stain and odour removal.', 35, 180, 'per seat', 'furniture', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800', 4.7, 420, 60),
    ('curtain-cleaning', 'curtain-cleaning', 'Curtain Cleaning', 'Professional curtain cleaning that protects fabric while removing dust, allergens and stains.', 200, null, 'per curtain', 'upholstery-cleaning', 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=800', 4.8, 150, 70),
    ('office-cleaning', '7', 'Office Cleaning', 'Structured workplace cleaning, disinfection, floor care, pantry and restroom cleaning.', 35, 70, 'per hour', 'commercial', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800', 4.9, 50, 80),
    ('housekeeping-part-time-maid', '8', 'Housekeeping / Part-time Maid', 'Flexible household support including cleaning, laundry assistance, dishwashing and organisation.', 35, null, 'per hour', 'home-cleaning', 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=800', 4.9, 1200, 90),
    ('babysitting-at-home', '11', 'Babysitting At Home', 'Reliable in-home childcare with supervision, activities, feeding and flexible schedules.', 250, null, 'per day', 'care', 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800', 4.9, 90, 100),
    ('move-in-out-cleaning', 'move-in-out', 'Move In/Out Cleaning', 'Comprehensive cleaning for empty homes before moving in or after moving out.', 35, null, 'per hour', 'home-cleaning', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800', 4.9, 150, 110),
    ('party-cleaning', '13', 'Party Cleaning', 'Pre- and post-event cleaning that restores your venue quickly and professionally.', 35, null, 'per hour', 'event-services', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800', 4.8, 80, 120),
    ('wash-and-iron', '14', 'Wash and Iron', 'Professional laundry care, stain treatment, ironing, folding and optional delivery.', 35, null, 'per hour', 'laundry', 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&q=80&w=800', 4.8, 300, 130),
    ('pet-sitting', '15', 'Pet Sitting', 'Reliable pet care including feeding, playtime, companionship and flexible schedules.', 35, null, 'per hour', 'care', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800', 4.9, 75, 140)
)
insert into public.catalog_items (
  category_id, item_type, status, slug, name, short_description, description,
  base_price, compare_at_price, price_unit, rating, total_bookings, sort_order, metadata
)
select
  category.id, 'service', 'published', seed.slug, seed.name, seed.description, seed.description,
  seed.base_price, seed.compare_at_price, seed.price_unit, seed.rating, seed.total_bookings, seed.sort_order,
  jsonb_build_object('legacy_id', seed.legacy_id, 'image', seed.image_url)
from seed
join public.catalog_categories category on category.slug = seed.category_slug
on conflict (slug) do update set
  category_id = excluded.category_id,
  item_type = 'service',
  status = 'published',
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  base_price = excluded.base_price,
  compare_at_price = excluded.compare_at_price,
  price_unit = excluded.price_unit,
  rating = excluded.rating,
  total_bookings = excluded.total_bookings,
  sort_order = excluded.sort_order,
   metadata = excluded.metadata;

-- Import the offers/packages that existed in the previous frontend version.
-- They are intentionally database-backed now; no local package fallback is used.
with legacy_offers(slug, title, description, price, compare_at_price, image_url, category, offer_tag, rating, sold_count, sort_order) as (
  values
    ('offer-welcome', 'New Customer Welcome Deal', 'Try us once with zero risk. A professional deep clean for your apartment or studio.', 99, 200, 'https://images.unsplash.com/photo-1550963295-019d8a8a61c5?auto=format&fit=crop&q=80&w=800', 'Deep Cleaning', 'Popular Gift', 5.0, 340, 10),
    ('offer-timesaving', 'Ultimate Time-Saving Deal', 'Massive value for busy homes. Walk into a cleaner, calmer home without long-term commitment.', 299, 600, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800', 'Value Pack', 'Best Seller', 4.9, 512, 20),
    ('offer-freshness', 'Total Home Freshness Boost', 'Elite-level hygiene. Eliminate bacteria and germs while restoring comfort to your home.', 699, 1200, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800', 'Sanitization', 'Top Rated', 5.0, 189, 30),
    ('pkg-essential', 'Essential Home Refresh Package', 'Perfect for 1-bedroom apartments. Complete control and comfort sanitized to hotel standards.', 899, 1200, 'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&q=80&w=800', 'Package', 'Exclusive', 4.8, 275, 40),
    ('pkg-family', 'Family Comfort Deluxe Package', 'Where family comfort meets hygiene. Specialized for homes with children and pets.', 999, 1400, 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800', 'Package', 'Popular', 4.9, 410, 50),
    ('pkg-villa', 'Villa Serenity Deep Restoration', 'Complete villa restoration. Every corner, every surface, handled with precision.', 1399, 2000, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800', 'Villa Package', 'Villa Special', 5.0, 160, 60),
    ('offer-villa-complete', 'Complete Inside & Outside Villa Cleaning', 'Your Villa completely renewed with two specialized teams working simultaneously.', 2500, 4000, 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800', 'Premium Villa Package', 'VIP Deal', 5.0, 95, 70)
)
insert into public.deals (
  slug, title, description, image_url, status, starts_at, discount_type,
  discount_value, price, compare_at_price, currency, is_featured, sort_order, metadata
)
select
  slug,
  title,
  description,
  image_url,
  'published',
  timezone('utc'::text, now()),
  'percentage',
  round(((compare_at_price::numeric - price::numeric) / compare_at_price::numeric) * 100, 2),
  price,
  compare_at_price,
  'AED',
  true,
  sort_order,
  jsonb_build_object(
    'category', category,
    'offer_tag', offer_tag,
    'rating', rating,
    'sold_count', sold_count,
    'legacy_id', slug
  )
from legacy_offers
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  image_url = excluded.image_url,
  status = 'published',
  starts_at = excluded.starts_at,
  discount_type = excluded.discount_type,
  discount_value = excluded.discount_value,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  currency = excluded.currency,
  is_featured = excluded.is_featured,
  sort_order = excluded.sort_order,
  metadata = excluded.metadata,
  deleted_at = null;

notify pgrst, 'reload schema';
commit;
