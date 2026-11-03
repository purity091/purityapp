-- Run this script once in Supabase SQL Editor.
-- Customer authentication uses Supabase Auth with email + password.
-- The required UAE mobile number is stored for service communication only.

create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  phone_number text not null,
  neighborhood text not null,
  address text,
  latitude double precision,
  longitude double precision,
  service_id text not null,
  service_name text not null,
  date text not null,
  time text not null,
  hours integer not null default 0,
  number_of_workers integer not null default 1,
  number_of_rooms integer,
  number_of_carpets integer,
  number_of_single_mattresses integer,
  number_of_large_mattresses integer,
  number_of_sofa_seats integer,
  number_of_curtains integer,
  include_chemicals boolean default false,
  notes text,
  total_price numeric not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled'))
);

alter table public.bookings add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.bookings add column if not exists address text;
alter table public.bookings add column if not exists latitude double precision;
alter table public.bookings add column if not exists longitude double precision;

create table if not exists public.customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone_number text not null unique,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.customer_profiles add column if not exists email text;
create index if not exists customer_profiles_phone_idx on public.customer_profiles(phone_number);
create unique index if not exists customer_profiles_email_idx on public.customer_profiles(email) where email is not null;

-- Backfill email values for profiles created before the email column existed.
update public.customer_profiles profile
set email = auth_user.email
from auth.users auth_user
where auth_user.id = profile.user_id
  and profile.email is distinct from auth_user.email;

create or replace function public.handle_new_customer_profile()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.email is not null and new.raw_user_meta_data ->> 'phone_number' is not null then
    if exists (
      select 1
      from public.customer_profiles
      where phone_number = new.raw_user_meta_data ->> 'phone_number'
        and user_id <> new.id
    ) then
      raise exception 'Mobile number already registered';
    end if;
    insert into public.customer_profiles (user_id, email, phone_number)
    values (new.id, new.email, new.raw_user_meta_data ->> 'phone_number')
    on conflict (user_id) do update
      set email = excluded.email,
          phone_number = excluded.phone_number,
          updated_at = timezone('utc'::text, now());
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_customer_profile on auth.users;
create trigger on_auth_user_created_customer_profile
  after insert on auth.users
  for each row execute function public.handle_new_customer_profile();

-- Phone numbers are contact information only. There is no browser-accessible
-- phone-to-email lookup and phone login is intentionally not enabled.
drop function if exists public.resolve_customer_email_by_phone(text);

create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  title text not null,
  message text not null,
  kind text not null default 'booking',
  created_at timestamptz default timezone('utc'::text, now()) not null,
  read_at timestamptz
);

-- Admin listing indexes. The trigram indexes keep name/phone searches fast at scale.
create extension if not exists pg_trgm;
create index if not exists bookings_user_id_created_at_idx on public.bookings(user_id, created_at desc);
create index if not exists bookings_status_created_at_idx on public.bookings(status, created_at desc, id desc);
create index if not exists bookings_created_at_idx on public.bookings(created_at desc, id desc);
create index if not exists bookings_customer_name_trgm_idx on public.bookings using gin (customer_name gin_trgm_ops);
create index if not exists bookings_phone_number_trgm_idx on public.bookings using gin (phone_number gin_trgm_ops);
create index if not exists notifications_user_id_created_at_idx on public.notifications(user_id, created_at desc);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

create or replace function public.get_booking_stats()
returns table (
  total bigint,
  pending bigint,
  confirmed bigint,
  completed bigint,
  cancelled bigint
)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  return query
  select
    count(*)::bigint,
    count(*) filter (where status = 'pending')::bigint,
    count(*) filter (where status = 'confirmed')::bigint,
    count(*) filter (where status = 'completed')::bigint,
    count(*) filter (where status = 'cancelled')::bigint
  from public.bookings;
end;
$$;

revoke all on function public.get_booking_stats() from public;
grant execute on function public.get_booking_stats() to authenticated;

-- Immutable server-side audit trail for sensitive admin actions.
create table if not exists public.admin_booking_audit_log (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid,
  admin_user_id uuid references auth.users(id) on delete set null,
  customer_name text,
  service_name text,
  action text not null check (action in ('status_changed', 'deleted')),
  from_status text,
  to_status text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.admin_booking_audit_log add column if not exists customer_name text;
alter table public.admin_booking_audit_log add column if not exists service_name text;

create index if not exists admin_booking_audit_booking_idx
  on public.admin_booking_audit_log(booking_id, created_at desc);
create index if not exists admin_booking_audit_admin_idx
  on public.admin_booking_audit_log(admin_user_id, created_at desc);

alter table public.admin_booking_audit_log enable row level security;
drop policy if exists "Admins read booking audit log" on public.admin_booking_audit_log;
create policy "Admins read booking audit log"
  on public.admin_booking_audit_log for select
  using (public.is_admin());
grant select on public.admin_booking_audit_log to authenticated;
revoke all on public.admin_booking_audit_log from anon;

create or replace function public.audit_booking_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    insert into public.admin_booking_audit_log (booking_id, admin_user_id, customer_name, service_name, action, from_status)
    values (old.id, auth.uid(), old.customer_name, old.service_name, 'deleted', old.status);
    return old;
  end if;

  if old.status is distinct from new.status then
    insert into public.admin_booking_audit_log (booking_id, admin_user_id, customer_name, service_name, action, from_status, to_status)
    values (new.id, auth.uid(), new.customer_name, new.service_name, 'status_changed', old.status, new.status);
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_admin_audit on public.bookings;
create trigger bookings_admin_audit
  after update of status or delete on public.bookings
  for each row execute function public.audit_booking_change();

-- After creating the admin in Supabase Auth, run this from a privileged SQL session:
-- update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb where email = 'admin@example.com';

alter table public.bookings enable row level security;
alter table public.notifications enable row level security;
alter table public.customer_profiles enable row level security;

drop policy if exists "Enable insert for everyone" on public.bookings;
drop policy if exists "Enable all for authenticated users" on public.bookings;
drop policy if exists "Customers read own bookings" on public.bookings;
drop policy if exists "Customers create own bookings" on public.bookings;
drop policy if exists "Admins manage bookings" on public.bookings;
drop policy if exists "Customers read own notifications" on public.notifications;
drop policy if exists "Customers update own notifications" on public.notifications;
drop policy if exists "Customers read own profile" on public.customer_profiles;
drop policy if exists "Customers update own profile" on public.customer_profiles;
drop policy if exists "Admins manage customer profiles" on public.customer_profiles;

create policy "Customers read own bookings" on public.bookings for select
  using (auth.uid() = user_id or public.is_admin());
create policy "Customers create own bookings" on public.bookings for insert
  with check (auth.uid() = user_id);
create policy "Admins manage bookings" on public.bookings for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Customers read own notifications" on public.notifications for select
  using (auth.uid() = user_id);
create policy "Customers update own notifications" on public.notifications for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Customers read own profile" on public.customer_profiles for select
  using (auth.uid() = user_id or public.is_admin());
create policy "Customers update own profile" on public.customer_profiles for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Admins manage customer profiles" on public.customer_profiles for all
  using (public.is_admin()) with check (public.is_admin());

grant select, update on public.customer_profiles to authenticated;
revoke all on public.customer_profiles from anon;

create or replace function public.notify_booking_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  should_notify boolean;
begin
  should_notify := case when tg_op = 'INSERT' then true else old.status is distinct from new.status end;
  if new.user_id is not null and should_notify then
    insert into public.notifications (user_id, booking_id, title, message, kind)
    values (
      new.user_id,
      new.id,
      case when tg_op = 'INSERT' then 'Booking received' else 'Booking status updated' end,
      case when tg_op = 'INSERT'
        then 'Your booking request was received and is waiting for confirmation.'
        else 'Your booking is now ' || replace(new.status, '_', ' ') || '.'
      end,
      'booking'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_notify_customer on public.bookings;
create trigger bookings_notify_customer
  after insert or update of status on public.bookings
  for each row execute function public.notify_booking_change();
