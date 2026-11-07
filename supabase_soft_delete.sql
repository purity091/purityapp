-- Purity data retention hardening.
-- Run after supabase_bookings.sql, supabase_wishlist.sql, supabase_catalog.sql
-- and supabase_api.sql.
-- No application table may be hard-deleted. Records are hidden with deleted_at.

begin;

create or replace function public.prevent_hard_delete()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Hard delete is disabled. Use soft delete by setting deleted_at.'
    using errcode = '55000';
end;
$$;

alter table public.bookings add column if not exists deleted_at timestamptz;
alter table public.customer_profiles add column if not exists deleted_at timestamptz;
alter table public.notifications add column if not exists deleted_at timestamptz;
alter table public.admin_booking_audit_log add column if not exists deleted_at timestamptz;
alter table public.wishlist_items add column if not exists deleted_at timestamptz;
alter table public.booking_pricing_rules add column if not exists deleted_at timestamptz;
alter table public.catalog_categories add column if not exists deleted_at timestamptz;
alter table public.catalog_items add column if not exists deleted_at timestamptz;
alter table public.catalog_item_variants add column if not exists deleted_at timestamptz;
alter table public.catalog_item_media add column if not exists deleted_at timestamptz;
alter table public.service_areas add column if not exists deleted_at timestamptz;
alter table public.catalog_item_areas add column if not exists deleted_at timestamptz;
alter table public.deals add column if not exists deleted_at timestamptz;
alter table public.deal_items add column if not exists deleted_at timestamptz;
alter table public.deal_codes add column if not exists deleted_at timestamptz;
alter table public.deal_redemptions add column if not exists deleted_at timestamptz;
alter table public.booking_deals add column if not exists deleted_at timestamptz;

create index if not exists bookings_active_created_at_idx
  on public.bookings(created_at desc, id desc) where deleted_at is null;
create index if not exists notifications_active_user_created_at_idx
  on public.notifications(user_id, created_at desc) where deleted_at is null;
create index if not exists catalog_items_active_listing_idx
  on public.catalog_items(status, sort_order, popularity_score desc) where deleted_at is null;
create index if not exists deals_active_listing_idx
  on public.deals(status, starts_at, ends_at, sort_order) where deleted_at is null;
create index if not exists wishlist_items_active_user_idx
  on public.wishlist_items(user_id, created_at) where deleted_at is null;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'bookings', 'customer_profiles', 'notifications', 'admin_booking_audit_log',
    'wishlist_items', 'booking_pricing_rules', 'catalog_categories', 'catalog_items',
    'catalog_item_variants', 'catalog_item_media', 'service_areas', 'catalog_item_areas',
    'deals', 'deal_items', 'deal_codes', 'deal_redemptions', 'booking_deals'
  ] loop
    execute format('drop trigger if exists prevent_hard_delete on public.%I', table_name);
    execute format(
      'create trigger prevent_hard_delete before delete on public.%I for each row execute function public.prevent_hard_delete()',
      table_name
    );
  end loop;
end;
$$;

-- Soft-delete a booking. The record and its customer data remain recoverable.
create or replace function public.soft_delete_booking(p_booking_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_booking public.bookings;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  update public.bookings
  set deleted_at = coalesce(deleted_at, timezone('utc'::text, now())),
      status = 'cancelled'
  where id = p_booking_id and deleted_at is null
  returning * into deleted_booking;

  if not found then raise exception 'Booking was not found or already archived'; end if;
  return deleted_booking;
end;
$$;

revoke all on function public.soft_delete_booking(uuid) from public;
grant execute on function public.soft_delete_booking(uuid) to authenticated;

create or replace function public.get_booking_stats()
returns table (
  total bigint,
  pending bigint,
  confirmed bigint,
  completed bigint,
  cancelled bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;

  return query
  select
    count(*)::bigint,
    count(*) filter (where status = 'pending')::bigint,
    count(*) filter (where status = 'confirmed')::bigint,
    count(*) filter (where status = 'completed')::bigint,
    count(*) filter (where status = 'cancelled')::bigint
  from public.bookings
  where deleted_at is null;
end;
$$;

-- Soft deletion must be visible in the immutable audit trail as deletion,
-- not merely as a normal status change to cancelled.
create or replace function public.audit_booking_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then return new; end if;

  if tg_op = 'DELETE' then
    insert into public.admin_booking_audit_log (booking_id, admin_user_id, customer_name, service_name, action, from_status)
    values (old.id, auth.uid(), old.customer_name, old.service_name, 'deleted', old.status);
    return old;
  end if;

  if old.deleted_at is null and new.deleted_at is not null then
    insert into public.admin_booking_audit_log (booking_id, admin_user_id, customer_name, service_name, action, from_status)
    values (new.id, auth.uid(), new.customer_name, new.service_name, 'deleted', old.status);
  elsif old.status is distinct from new.status then
    insert into public.admin_booking_audit_log (booking_id, admin_user_id, customer_name, service_name, action, from_status, to_status)
    values (new.id, auth.uid(), new.customer_name, new.service_name, 'status_changed', old.status, new.status);
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_admin_audit on public.bookings;
create trigger bookings_admin_audit
  after update of status, deleted_at or delete on public.bookings
  for each row execute function public.audit_booking_change();

-- Re-enable or archive a wishlist item without deleting its history.
create or replace function public.set_wishlist_item(p_item_id text, p_saved boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then raise exception 'Authentication required'; end if;

  if p_saved then
    update public.wishlist_items
    set deleted_at = null
    where user_id = current_user_id and item_id = trim(p_item_id);

    if not found then
      insert into public.wishlist_items (user_id, item_id)
      values (current_user_id, trim(p_item_id));
    end if;
  else
    update public.wishlist_items
    set deleted_at = coalesce(deleted_at, timezone('utc'::text, now()))
    where user_id = current_user_id and item_id = trim(p_item_id);
  end if;

  return true;
end;
$$;

revoke all on function public.set_wishlist_item(text, boolean) from public;
grant execute on function public.set_wishlist_item(text, boolean) to authenticated;

-- Active records are the only records visible to normal customer/public reads.
drop policy if exists "Customers read own bookings" on public.bookings;
create policy "Customers read own bookings" on public.bookings for select
  using ((auth.uid() = user_id and deleted_at is null) or public.is_admin());

drop policy if exists "Customers read own notifications" on public.notifications;
create policy "Customers read own notifications" on public.notifications for select
  using (auth.uid() = user_id and deleted_at is null);

drop policy if exists "Customers update own notifications" on public.notifications;
create policy "Customers update own notifications" on public.notifications for update
  using (auth.uid() = user_id and deleted_at is null)
  with check (auth.uid() = user_id and deleted_at is null);

drop policy if exists "Customers read own profile" on public.customer_profiles;
create policy "Customers read own profile" on public.customer_profiles for select
  using ((auth.uid() = user_id and deleted_at is null) or public.is_admin());

drop policy if exists "Customers update own profile" on public.customer_profiles;
create policy "Customers update own profile" on public.customer_profiles for update
  using (auth.uid() = user_id and deleted_at is null)
  with check (auth.uid() = user_id and deleted_at is null);

drop policy if exists "Customers read own wishlist" on public.wishlist_items;
create policy "Customers read own wishlist" on public.wishlist_items for select
  to authenticated using (auth.uid() = user_id and deleted_at is null);

drop policy if exists "Customers add own wishlist" on public.wishlist_items;
create policy "Customers add own wishlist" on public.wishlist_items for insert
  to authenticated with check (auth.uid() = user_id and deleted_at is null);

drop policy if exists "Customers remove own wishlist" on public.wishlist_items;
create policy "Customers remove own wishlist" on public.wishlist_items for delete
  to authenticated using (false);

drop policy if exists "Public read active categories" on public.catalog_categories;
create policy "Public read active categories" on public.catalog_categories for select
  using ((is_active and deleted_at is null) or public.is_admin());

drop policy if exists "Public read published catalog" on public.catalog_items;
create policy "Public read published catalog" on public.catalog_items for select
  using ((status = 'published' and deleted_at is null) or public.is_admin());

drop policy if exists "Public read active variants" on public.catalog_item_variants;
create policy "Public read active variants" on public.catalog_item_variants for select
  using ((is_active and deleted_at is null and exists (
    select 1 from public.catalog_items i
    where i.id = item_id and i.status = 'published' and i.deleted_at is null
  )) or public.is_admin());

drop policy if exists "Public read catalog media" on public.catalog_item_media;
create policy "Public read catalog media" on public.catalog_item_media for select
  using ((deleted_at is null and exists (
    select 1 from public.catalog_items i
    where i.id = item_id and i.status = 'published' and i.deleted_at is null
  )) or public.is_admin());

drop policy if exists "Public read active areas" on public.service_areas;
create policy "Public read active areas" on public.service_areas for select
  using ((is_active and deleted_at is null) or public.is_admin());

drop policy if exists "Public read item areas" on public.catalog_item_areas;
create policy "Public read item areas" on public.catalog_item_areas for select
  using ((is_active and deleted_at is null) or public.is_admin());

drop policy if exists "Public read live deals" on public.deals;
create policy "Public read live deals" on public.deals for select
  using ((status = 'published' and deleted_at is null and starts_at <= now() and (ends_at is null or ends_at > now())) or public.is_admin());

drop policy if exists "Public read live deal items" on public.deal_items;
create policy "Public read live deal items" on public.deal_items for select
  using ((deleted_at is null and exists (
    select 1 from public.deals d
    where d.id = deal_id and d.status = 'published' and d.deleted_at is null
      and d.starts_at <= now() and (d.ends_at is null or d.ends_at > now())
  )) or public.is_admin());

drop policy if exists "Customers read own redemptions" on public.deal_redemptions;
create policy "Customers read own redemptions" on public.deal_redemptions for select
  using ((auth.uid() = user_id and deleted_at is null) or public.is_admin());

drop policy if exists "Customers read booking deals" on public.booking_deals;
create policy "Customers read booking deals" on public.booking_deals for select
  using ((deleted_at is null and exists (
    select 1 from public.bookings b
    where b.id = booking_id and b.user_id = auth.uid() and b.deleted_at is null
  )) or public.is_admin());

-- The client never receives DELETE permission. The trigger also protects against
-- accidental or privileged SQL deletes on application tables.
revoke delete on public.bookings, public.customer_profiles, public.notifications,
  public.admin_booking_audit_log, public.wishlist_items, public.booking_pricing_rules,
  public.catalog_categories, public.catalog_items, public.catalog_item_variants,
  public.catalog_item_media, public.service_areas, public.catalog_item_areas,
  public.deals, public.deal_items, public.deal_codes, public.deal_redemptions,
  public.booking_deals from anon, authenticated, service_role;

commit;
