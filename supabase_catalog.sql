-- Purity Catalog and Groupon-style Deals
-- Run after supabase_bookings.sql.
-- This schema keeps the public catalog normalized and leaves the current
-- TypeScript catalog available as a fallback during migration.

create extension if not exists pg_trgm;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create table if not exists public.catalog_categories (
  id uuid default gen_random_uuid() primary key,
  parent_id uuid references public.catalog_categories(id) on delete set null,
  slug text not null unique check (slug = lower(slug)),
  name text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
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
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.catalog_item_variants (
  id uuid default gen_random_uuid() primary key,
  item_id uuid not null references public.catalog_items(id) on delete cascade,
  sku text unique,
  name text not null,
  pricing_model text not null default 'fixed' check (pricing_model in ('fixed', 'hourly', 'per_unit', 'from')),
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= price),
  currency char(3) not null default 'AED',
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  is_default boolean not null default false,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.catalog_item_media (
  id uuid default gen_random_uuid() primary key,
  item_id uuid not null references public.catalog_items(id) on delete cascade,
  variant_id uuid references public.catalog_item_variants(id) on delete cascade,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.service_areas (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique check (slug = lower(slug)),
  name text not null,
  city text not null default 'Dubai',
  country_code char(2) not null default 'AE',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.catalog_item_areas (
  item_id uuid not null references public.catalog_items(id) on delete cascade,
  area_id uuid not null references public.service_areas(id) on delete cascade,
  extra_fee numeric(12,2) not null default 0 check (extra_fee >= 0),
  is_active boolean not null default true,
  primary key (item_id, area_id)
);

-- A deal is a time-bound campaign. It can target one service, a package,
-- or several catalog items through deal_items.
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
  inventory_total integer check (inventory_total is null or inventory_total >= 0),
  inventory_remaining integer check (inventory_remaining is null or inventory_remaining >= 0),
  per_user_limit integer check (per_user_limit is null or per_user_limit > 0),
  min_order_value numeric(12,2) check (min_order_value is null or min_order_value >= 0),
  audience text not null default 'all' check (audience in ('all', 'new_customers', 'returning_customers')),
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  check (ends_at is null or ends_at > starts_at),
  check (discount_type <> 'percentage' or discount_value <= 100),
  check (inventory_total is null or inventory_remaining is null or inventory_remaining <= inventory_total)
);

alter table public.deals add column if not exists image_url text;

create table if not exists public.deal_items (
  id uuid default gen_random_uuid() primary key,
  deal_id uuid not null references public.deals(id) on delete cascade,
  item_id uuid not null references public.catalog_items(id) on delete restrict,
  variant_id uuid references public.catalog_item_variants(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  price_override numeric(12,2) check (price_override is null or price_override >= 0)
);

create table if not exists public.deal_codes (
  id uuid default gen_random_uuid() primary key,
  deal_id uuid not null references public.deals(id) on delete cascade,
  code text not null unique check (code = upper(code)),
  max_uses integer check (max_uses is null or max_uses > 0),
  used_count integer not null default 0 check (used_count >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now())
);

-- A redemption is the inventory/audit record. The code is generated server-side
-- so customers cannot invent a valid Groupon-style voucher from the browser.
create table if not exists public.deal_redemptions (
  id uuid default gen_random_uuid() primary key,
  deal_id uuid not null references public.deals(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  booking_id uuid references public.bookings(id) on delete set null,
  redemption_code text not null unique,
  quantity integer not null default 1 check (quantity > 0),
  status text not null default 'reserved' check (status in ('reserved', 'redeemed', 'cancelled', 'expired')),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  expires_at timestamptz,
  redeemed_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Price snapshots keep historical bookings correct even if an offer changes later.
create table if not exists public.booking_deals (
  booking_id uuid not null references public.bookings(id) on delete cascade,
  deal_id uuid not null references public.deals(id) on delete restrict,
  redemption_id uuid references public.deal_redemptions(id) on delete set null,
  title_snapshot text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  created_at timestamptz not null default timezone('utc'::text, now()),
  primary key (booking_id, deal_id)
);

create index if not exists catalog_categories_active_sort_idx on public.catalog_categories(is_active, sort_order, name);
create index if not exists catalog_items_listing_idx on public.catalog_items(status, category_id, sort_order, popularity_score desc);
create index if not exists catalog_items_name_trgm_idx on public.catalog_items using gin(name gin_trgm_ops);
create index if not exists catalog_items_description_trgm_idx on public.catalog_items using gin(description gin_trgm_ops);
create index if not exists catalog_variants_item_active_idx on public.catalog_item_variants(item_id, is_active, is_default desc);
create unique index if not exists catalog_variants_one_default_idx on public.catalog_item_variants(item_id) where is_default = true;
create index if not exists catalog_media_item_sort_idx on public.catalog_item_media(item_id, sort_order);
create index if not exists item_areas_area_active_idx on public.catalog_item_areas(area_id, is_active, item_id);
create index if not exists deals_listing_idx on public.deals(status, starts_at, ends_at, is_featured desc, sort_order);
create index if not exists deal_items_item_idx on public.deal_items(item_id, deal_id);
create unique index if not exists deal_items_deal_item_variant_idx on public.deal_items(deal_id, item_id, coalesce(variant_id, '00000000-0000-0000-0000-000000000000'::uuid));
create index if not exists deal_redemptions_user_idx on public.deal_redemptions(user_id, created_at desc);
create index if not exists deal_redemptions_deal_status_idx on public.deal_redemptions(deal_id, status);
create index if not exists booking_deals_deal_idx on public.booking_deals(deal_id, created_at desc);

drop trigger if exists catalog_categories_touch_updated_at on public.catalog_categories;
create trigger catalog_categories_touch_updated_at before update on public.catalog_categories for each row execute function public.touch_updated_at();
drop trigger if exists catalog_items_touch_updated_at on public.catalog_items;
create trigger catalog_items_touch_updated_at before update on public.catalog_items for each row execute function public.touch_updated_at();
drop trigger if exists catalog_variants_touch_updated_at on public.catalog_item_variants;
create trigger catalog_variants_touch_updated_at before update on public.catalog_item_variants for each row execute function public.touch_updated_at();
drop trigger if exists deals_touch_updated_at on public.deals;
create trigger deals_touch_updated_at before update on public.deals for each row execute function public.touch_updated_at();
drop trigger if exists redemption_touch_updated_at on public.deal_redemptions;
create trigger redemption_touch_updated_at before update on public.deal_redemptions for each row execute function public.touch_updated_at();

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

alter table public.catalog_categories enable row level security;
alter table public.catalog_items enable row level security;
alter table public.catalog_item_variants enable row level security;
alter table public.catalog_item_media enable row level security;
alter table public.service_areas enable row level security;
alter table public.catalog_item_areas enable row level security;
alter table public.deals enable row level security;
alter table public.deal_items enable row level security;
alter table public.deal_codes enable row level security;
alter table public.deal_redemptions enable row level security;
alter table public.booking_deals enable row level security;

drop policy if exists "Public read active categories" on public.catalog_categories;
drop policy if exists "Admins manage categories" on public.catalog_categories;
create policy "Public read active categories" on public.catalog_categories for select using (is_active or public.is_admin());
create policy "Admins manage categories" on public.catalog_categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read published catalog" on public.catalog_items;
drop policy if exists "Admins manage catalog" on public.catalog_items;
create policy "Public read published catalog" on public.catalog_items for select using (status = 'published' or public.is_admin());
create policy "Admins manage catalog" on public.catalog_items for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read active variants" on public.catalog_item_variants;
drop policy if exists "Admins manage variants" on public.catalog_item_variants;
create policy "Public read active variants" on public.catalog_item_variants for select using (is_active and exists (select 1 from public.catalog_items i where i.id = item_id and i.status = 'published') or public.is_admin());
create policy "Admins manage variants" on public.catalog_item_variants for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read catalog media" on public.catalog_item_media;
drop policy if exists "Admins manage catalog media" on public.catalog_item_media;
create policy "Public read catalog media" on public.catalog_item_media for select using (exists (select 1 from public.catalog_items i where i.id = item_id and i.status = 'published') or public.is_admin());
create policy "Admins manage catalog media" on public.catalog_item_media for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read active areas" on public.service_areas;
drop policy if exists "Admins manage areas" on public.service_areas;
create policy "Public read active areas" on public.service_areas for select using (is_active or public.is_admin());
create policy "Admins manage areas" on public.service_areas for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read item areas" on public.catalog_item_areas;
drop policy if exists "Admins manage item areas" on public.catalog_item_areas;
create policy "Public read item areas" on public.catalog_item_areas for select using (is_active or public.is_admin());
create policy "Admins manage item areas" on public.catalog_item_areas for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read live deals" on public.deals;
drop policy if exists "Admins manage deals" on public.deals;
create policy "Public read live deals" on public.deals for select using ((status = 'published' and starts_at <= now() and (ends_at is null or ends_at > now())) or public.is_admin());
create policy "Admins manage deals" on public.deals for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read live deal items" on public.deal_items;
drop policy if exists "Admins manage deal items" on public.deal_items;
create policy "Public read live deal items" on public.deal_items for select using (exists (select 1 from public.deals d where d.id = deal_id and d.status = 'published' and d.starts_at <= now() and (d.ends_at is null or d.ends_at > now())) or public.is_admin());
create policy "Admins manage deal items" on public.deal_items for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage deal codes" on public.deal_codes;
create policy "Admins manage deal codes" on public.deal_codes for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Customers read own redemptions" on public.deal_redemptions;
drop policy if exists "Admins manage redemptions" on public.deal_redemptions;
create policy "Customers read own redemptions" on public.deal_redemptions for select using (auth.uid() = user_id or public.is_admin());
create policy "Admins manage redemptions" on public.deal_redemptions for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Customers read booking deals" on public.booking_deals;
drop policy if exists "Admins manage booking deals" on public.booking_deals;
create policy "Customers read booking deals" on public.booking_deals for select using (exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid()) or public.is_admin());
create policy "Admins manage booking deals" on public.booking_deals for all using (public.is_admin()) with check (public.is_admin());

grant select on public.catalog_categories, public.catalog_items, public.catalog_item_variants, public.catalog_item_media, public.service_areas, public.catalog_item_areas, public.deals, public.deal_items to anon, authenticated;
grant select on public.deal_redemptions, public.booking_deals to authenticated;
grant all on public.catalog_categories, public.catalog_items, public.catalog_item_variants, public.catalog_item_media, public.service_areas, public.catalog_item_areas, public.deals, public.deal_items, public.deal_codes, public.deal_redemptions, public.booking_deals to authenticated;

-- Atomically reserves inventory and enforces per-user limits.
drop function if exists public.claim_deal(uuid, uuid, integer);
create or replace function public.claim_deal(p_deal_id uuid, p_booking_id uuid default null, p_quantity integer default 1, p_code text default null)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  selected_deal public.deals%rowtype;
  selected_code public.deal_codes%rowtype;
  already_claimed integer;
  new_redemption_id uuid;
begin
  if current_user_id is null then raise exception 'Authentication required'; end if;
  if p_quantity < 1 then raise exception 'Quantity must be positive'; end if;

  select * into selected_deal from public.deals
  where id = p_deal_id and status = 'published' and starts_at <= now() and (ends_at is null or ends_at > now())
  for update;
  if not found then raise exception 'Deal is not available'; end if;

  if p_code is not null then
    select * into selected_code from public.deal_codes
    where deal_id = p_deal_id and code = upper(trim(p_code)) and is_active
      and (max_uses is null or used_count + p_quantity <= max_uses)
    for update;
    if not found then raise exception 'Deal code is invalid or exhausted'; end if;
  end if;

  if p_booking_id is not null and not exists (select 1 from public.bookings where id = p_booking_id and user_id = current_user_id) then
    raise exception 'Booking does not belong to the current user';
  end if;

  select coalesce(sum(quantity), 0) into already_claimed
  from public.deal_redemptions
  where deal_id = p_deal_id and user_id = current_user_id and status in ('reserved', 'redeemed');
  if selected_deal.per_user_limit is not null and already_claimed + p_quantity > selected_deal.per_user_limit then
    raise exception 'Per-user deal limit reached';
  end if;
  if selected_deal.inventory_remaining is not null and selected_deal.inventory_remaining < p_quantity then
    raise exception 'Deal is sold out';
  end if;

  insert into public.deal_redemptions (deal_id, user_id, booking_id, redemption_code, quantity, unit_price, discount_amount, expires_at)
  values (p_deal_id, current_user_id, p_booking_id, upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)), p_quantity, selected_deal.price, 0, selected_deal.ends_at)
  returning id into new_redemption_id;

  if selected_deal.inventory_remaining is not null then
    update public.deals set inventory_remaining = inventory_remaining - p_quantity where id = p_deal_id;
  end if;
  if p_code is not null then
    update public.deal_codes set used_count = used_count + p_quantity where id = selected_code.id;
  end if;
  return new_redemption_id;
end;
$$;

revoke all on function public.claim_deal(uuid, uuid, integer, text) from public;
grant execute on function public.claim_deal(uuid, uuid, integer, text) to authenticated;
