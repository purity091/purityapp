-- Purity soft-delete schema repair for databases created before the soft-delete migration.
-- Run this once in Supabase SQL Editor, then run supabase_soft_delete.sql in full.
-- This is safe to run repeatedly and does not remove or overwrite existing data.

begin;

alter table if exists public.bookings add column if not exists deleted_at timestamptz;
alter table if exists public.customer_profiles add column if not exists deleted_at timestamptz;
alter table if exists public.notifications add column if not exists deleted_at timestamptz;
alter table if exists public.admin_booking_audit_log add column if not exists deleted_at timestamptz;
alter table if exists public.wishlist_items add column if not exists deleted_at timestamptz;
alter table if exists public.booking_pricing_rules add column if not exists deleted_at timestamptz;
alter table if exists public.catalog_categories add column if not exists deleted_at timestamptz;
alter table if exists public.catalog_items add column if not exists deleted_at timestamptz;
alter table if exists public.catalog_item_variants add column if not exists deleted_at timestamptz;
alter table if exists public.catalog_item_media add column if not exists deleted_at timestamptz;
alter table if exists public.service_areas add column if not exists deleted_at timestamptz;
alter table if exists public.catalog_item_areas add column if not exists deleted_at timestamptz;
alter table if exists public.deals add column if not exists deleted_at timestamptz;
alter table if exists public.deal_items add column if not exists deleted_at timestamptz;
alter table if exists public.deal_codes add column if not exists deleted_at timestamptz;
alter table if exists public.deal_redemptions add column if not exists deleted_at timestamptz;
alter table if exists public.booking_deals add column if not exists deleted_at timestamptz;

create index if not exists bookings_active_created_at_idx
  on public.bookings(created_at desc, id desc) where deleted_at is null;
create index if not exists catalog_items_active_listing_idx
  on public.catalog_items(status, sort_order, popularity_score desc) where deleted_at is null;

notify pgrst, 'reload schema';

commit;
