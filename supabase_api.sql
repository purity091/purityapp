-- Purity application API hardening migration.
-- Run after supabase_bookings.sql, supabase_wishlist.sql and supabase_catalog.sql.
-- This migration moves booking validation, pricing and idempotency to PostgreSQL.

alter table public.bookings
  add column if not exists client_request_id text;

create unique index if not exists bookings_user_client_request_idx
  on public.bookings(user_id, client_request_id)
  where user_id is not null and client_request_id is not null;

create table if not exists public.booking_pricing_rules (
  service_key text primary key,
  service_name text not null,
  pricing_mode text not null check (pricing_mode in ('fixed', 'hourly', 'workers', 'rooms', 'carpets', 'mattresses', 'sofa_seats', 'curtains')),
  base_price numeric(12,2) not null default 0 check (base_price >= 0),
  one_unit_price numeric(12,2) check (one_unit_price is null or one_unit_price >= 0),
  two_unit_price numeric(12,2) check (two_unit_price is null or two_unit_price >= 0),
  unit_price numeric(12,2) check (unit_price is null or unit_price >= 0),
  large_unit_price numeric(12,2) check (large_unit_price is null or large_unit_price >= 0),
  chemical_eligible boolean not null default false,
  chemical_fee numeric(12,2) not null default 30 check (chemical_fee >= 0),
  is_active boolean not null default true,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

insert into public.booking_pricing_rules (
  service_key, service_name, pricing_mode, base_price, one_unit_price,
  two_unit_price, unit_price, large_unit_price, chemical_eligible, chemical_fee
) values
  ('deep-clean', 'Deep Cleaning', 'hourly', 45, null, null, null, null, true, 30),
  ('10', 'Regular Cleaning', 'hourly', 35, null, null, null, null, true, 30),
  ('1', 'Floor Cleaning', 'rooms', 0, 200, 300, 150, null, false, 0),
  ('2', 'Carpet Cleaning', 'carpets', 0, null, null, 200, null, false, 0),
  ('3', 'Mattress Cleaning', 'mattresses', 0, 150, null, null, 200, false, 0),
  ('4', 'Sofa Cleaning', 'sofa_seats', 0, null, null, 35, null, false, 0),
  ('curtain-cleaning', 'Curtain Cleaning', 'curtains', 0, null, null, 200, null, false, 0),
  ('7', 'Office Cleaning', 'hourly', 35, null, null, null, null, false, 0),
  ('8', 'Housekeeping / Part-time Maid', 'hourly', 35, null, null, null, null, false, 0),
  ('11', 'Babysitting At Home', 'workers', 250, null, null, null, null, false, 0),
  ('move-in-out', 'Move In/Out Cleaning', 'hourly', 35, null, null, null, null, true, 30),
  ('13', 'Party Cleaning', 'hourly', 35, null, null, null, null, true, 30),
  ('14', 'Wash and Iron', 'hourly', 35, null, null, null, null, true, 30),
  ('15', 'Pet Sitting', 'hourly', 35, null, null, null, null, true, 30),
  ('offer-welcome', 'New Customer Welcome Deal', 'fixed', 99, null, null, null, null, false, 0),
  ('offer-timesaving', 'Ultimate Time-Saving Deal', 'fixed', 299, null, null, null, null, false, 0),
  ('offer-freshness', 'Total Home Freshness Boost', 'fixed', 699, null, null, null, null, false, 0),
  ('pkg-essential', 'Essential Home Refresh Package', 'fixed', 899, null, null, null, null, false, 0),
  ('pkg-family', 'Family Comfort Deluxe Package', 'fixed', 999, null, null, null, null, false, 0),
  ('pkg-villa', 'Villa Serenity Deep Restoration', 'fixed', 1399, null, null, null, null, false, 0),
  ('offer-villa-complete', 'Complete Inside & Outside Villa Cleaning', 'fixed', 2500, null, null, null, null, false, 0)
on conflict (service_key) do update set
  service_name = excluded.service_name,
  pricing_mode = excluded.pricing_mode,
  base_price = excluded.base_price,
  one_unit_price = excluded.one_unit_price,
  two_unit_price = excluded.two_unit_price,
  unit_price = excluded.unit_price,
  large_unit_price = excluded.large_unit_price,
  chemical_eligible = excluded.chemical_eligible,
  chemical_fee = excluded.chemical_fee,
  updated_at = timezone('utc'::text, now());

alter table public.booking_pricing_rules enable row level security;
drop policy if exists "Admins manage booking pricing rules" on public.booking_pricing_rules;
create policy "Admins manage booking pricing rules"
  on public.booking_pricing_rules for all
  using (public.is_admin())
  with check (public.is_admin());

revoke all on public.booking_pricing_rules from anon, authenticated;
grant select, insert, update, delete on public.booking_pricing_rules to authenticated;

create or replace function public.create_booking(
  p_service_id text,
  p_customer_name text,
  p_phone_number text,
  p_neighborhood text,
  p_address text,
  p_latitude double precision,
  p_longitude double precision,
  p_hours integer,
  p_date date,
  p_time text,
  p_number_of_workers integer,
  p_number_of_rooms integer default null,
  p_number_of_carpets integer default null,
  p_number_of_single_mattresses integer default null,
  p_number_of_large_mattresses integer default null,
  p_number_of_sofa_seats integer default null,
  p_number_of_curtains integer default null,
  p_include_chemicals boolean default false,
  p_notes text default null,
  p_client_request_id text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_phone text := regexp_replace(trim(coalesce(p_phone_number, '')), '[[:space:]()-]', '', 'g');
  rule public.booking_pricing_rules%rowtype;
  catalog_item record;
  deal_item record;
  existing_booking public.bookings%rowtype;
  resolved_name text;
  resolved_price numeric(12,2);
  calculated_total numeric(12,2);
  requested_service_key text := trim(coalesce(p_service_id, ''));
begin
  if current_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  if length(requested_service_key) = 0 then raise exception 'Service is required'; end if;
  if length(trim(coalesce(p_customer_name, ''))) not between 2 and 120 then raise exception 'Customer name must be between 2 and 120 characters'; end if;
  if length(trim(coalesce(p_neighborhood, ''))) not between 2 and 160 then raise exception 'Neighborhood is required'; end if;
  if length(trim(coalesce(p_address, ''))) not between 5 and 500 then raise exception 'A valid service address is required'; end if;
  if normalized_phone like '05%' then normalized_phone := '+971' || substr(normalized_phone, 2); end if;
  if normalized_phone !~ '^\+9715[0-9]{8}$' then raise exception 'A valid UAE mobile number is required'; end if;
  if p_latitude is null or p_longitude is null or p_latitude not between -90 and 90 or p_longitude not between -180 and 180 then raise exception 'A valid map location is required'; end if;
  if p_date is null then raise exception 'Booking date is required'; end if;
  if p_date < timezone('Asia/Dubai', now())::date then raise exception 'Booking date cannot be in the past'; end if;
  if length(trim(coalesce(p_time, ''))) = 0 then raise exception 'Booking time is required'; end if;
  if p_hours is null or p_hours < 1 or p_hours > 24 then raise exception 'Hours must be between 1 and 24'; end if;
  if p_number_of_workers is null or p_number_of_workers < 1 or p_number_of_workers > 20 then raise exception 'Number of workers must be between 1 and 20'; end if;
  if coalesce(p_number_of_rooms, 0) < 0 or coalesce(p_number_of_rooms, 0) > 100 then raise exception 'Invalid number of rooms'; end if;
  if coalesce(p_number_of_carpets, 0) < 0 or coalesce(p_number_of_carpets, 0) > 100 then raise exception 'Invalid number of carpets'; end if;
  if coalesce(p_number_of_single_mattresses, 0) < 0 or coalesce(p_number_of_single_mattresses, 0) > 100 then raise exception 'Invalid number of single mattresses'; end if;
  if coalesce(p_number_of_large_mattresses, 0) < 0 or coalesce(p_number_of_large_mattresses, 0) > 100 then raise exception 'Invalid number of large mattresses'; end if;
  if coalesce(p_number_of_sofa_seats, 0) < 0 or coalesce(p_number_of_sofa_seats, 0) > 100 then raise exception 'Invalid number of sofa seats'; end if;
  if coalesce(p_number_of_curtains, 0) < 0 or coalesce(p_number_of_curtains, 0) > 100 then raise exception 'Invalid number of curtains'; end if;
  if length(coalesce(p_notes, '')) > 2000 then raise exception 'Notes are too long'; end if;
  if length(coalesce(p_client_request_id, '')) > 120 then raise exception 'Invalid client request id'; end if;

  if p_client_request_id is not null then
    select * into existing_booking
    from public.bookings
    where user_id = current_user_id and client_request_id = p_client_request_id
    limit 1;
    if found then return existing_booking; end if;
  end if;

  select * into rule
  from public.booking_pricing_rules as pricing
  where pricing.service_key = requested_service_key and pricing.is_active
  limit 1;

  if not found then
    -- Catalog items and deals without an explicit rule are accepted as fixed-price.
    -- Variable pricing must be configured in booking_pricing_rules first.
    select id, slug, name, base_price into catalog_item
    from public.catalog_items
    where status = 'published' and (id::text = requested_service_key or slug = requested_service_key)
    limit 1;
    if found then
      resolved_name := catalog_item.name;
      resolved_price := catalog_item.base_price;
    else
      select id, slug, title, price into deal_item
      from public.deals
      where status = 'published'
        and starts_at <= now()
        and (ends_at is null or ends_at > now())
        and (id::text = requested_service_key or slug = requested_service_key)
      limit 1;
      if found then
        resolved_name := deal_item.title;
        resolved_price := deal_item.price;
      else
        raise exception 'Service pricing is not configured';
      end if;
    end if;
    calculated_total := resolved_price;
  else
    resolved_name := rule.service_name;
    case rule.pricing_mode
      when 'fixed' then calculated_total := rule.base_price;
      when 'hourly' then calculated_total := rule.base_price * p_hours * p_number_of_workers;
      when 'workers' then calculated_total := rule.base_price * p_number_of_workers;
      when 'rooms' then
        if coalesce(p_number_of_rooms, 0) < 1 then raise exception 'At least one room is required'; end if;
        calculated_total := case p_number_of_rooms when 1 then coalesce(rule.one_unit_price, rule.base_price) when 2 then coalesce(rule.two_unit_price, rule.base_price * 2) else coalesce(rule.unit_price, rule.base_price) * p_number_of_rooms end;
      when 'carpets' then
        if coalesce(p_number_of_carpets, 0) < 1 then raise exception 'At least one carpet is required'; end if;
        calculated_total := coalesce(rule.unit_price, rule.base_price) * p_number_of_carpets;
      when 'mattresses' then
        if coalesce(p_number_of_single_mattresses, 0) + coalesce(p_number_of_large_mattresses, 0) = 0 then calculated_total := coalesce(rule.one_unit_price, rule.base_price); else calculated_total := coalesce(rule.one_unit_price, rule.base_price) * coalesce(p_number_of_single_mattresses, 0) + coalesce(rule.large_unit_price, rule.base_price) * coalesce(p_number_of_large_mattresses, 0); end if;
      when 'sofa_seats' then
        if coalesce(p_number_of_sofa_seats, 0) < 1 then raise exception 'At least one sofa seat is required'; end if;
        calculated_total := coalesce(rule.unit_price, rule.base_price) * p_number_of_sofa_seats;
      when 'curtains' then
        if coalesce(p_number_of_curtains, 0) < 1 then raise exception 'At least one curtain is required'; end if;
        calculated_total := coalesce(rule.unit_price, rule.base_price) * p_number_of_curtains;
      else raise exception 'Unsupported pricing rule';
    end case;
    if p_include_chemicals and rule.chemical_eligible then calculated_total := calculated_total + rule.chemical_fee; end if;
  end if;

  if calculated_total is null or calculated_total < 0 then raise exception 'Could not calculate booking price'; end if;

  insert into public.bookings (
    user_id, client_request_id, customer_name, phone_number, neighborhood, address,
    latitude, longitude, service_id, service_name, date, time, hours,
    number_of_workers, number_of_rooms, number_of_carpets, number_of_single_mattresses,
    number_of_large_mattresses, number_of_sofa_seats, number_of_curtains,
    include_chemicals, notes, total_price, status
  ) values (
    current_user_id, nullif(trim(p_client_request_id), ''), trim(p_customer_name), normalized_phone,
    trim(p_neighborhood), trim(p_address), p_latitude, p_longitude, requested_service_key,
    resolved_name, p_date::text, trim(p_time), p_hours, p_number_of_workers,
    nullif(p_number_of_rooms, 0), nullif(p_number_of_carpets, 0),
    nullif(p_number_of_single_mattresses, 0), nullif(p_number_of_large_mattresses, 0),
    nullif(p_number_of_sofa_seats, 0), nullif(p_number_of_curtains, 0),
    coalesce(p_include_chemicals, false), nullif(trim(coalesce(p_notes, '')), ''),
    round(calculated_total, 2), 'pending'
  ) returning * into existing_booking;

  return existing_booking;
exception
  when unique_violation then
    if p_client_request_id is not null then
      select * into existing_booking
      from public.bookings
      where user_id = current_user_id and client_request_id = p_client_request_id
      limit 1;
      if found then return existing_booking; end if;
    end if;
    raise;
end;
$$;

revoke all on function public.create_booking(text, text, text, text, text, double precision, double precision, integer, date, text, integer, integer, integer, integer, integer, integer, integer, boolean, text, text) from public;
grant execute on function public.create_booking(text, text, text, text, text, double precision, double precision, integer, date, text, integer, integer, integer, integer, integer, integer, integer, boolean, text, text) to authenticated;

-- Direct customer inserts would bypass the server-side pricing function.
-- Admin update/delete policies remain available for the dashboard.
revoke insert on public.bookings from anon, authenticated;
