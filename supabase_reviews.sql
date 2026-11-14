-- Purity verified reviews and ratings.
-- Run after supabase_bookings.sql, supabase_catalog.sql and supabase_soft_delete.sql.
-- A review can only be submitted for the authenticated customer's completed booking.
-- Reviews are archived with deleted_at; hard deletion is intentionally disabled.

alter table public.deals add column if not exists rating numeric(3,2) not null default 0;
alter table public.deals add column if not exists review_count integer not null default 0;

create table if not exists public.service_reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete restrict,
  user_id uuid references auth.users(id) on delete set null,
  catalog_item_id uuid references public.catalog_items(id) on delete set null,
  deal_id uuid references public.deals(id) on delete set null,
  service_id text not null,
  service_name text not null,
  display_name text not null,
  rating smallint not null check (rating between 1 and 5),
  review_text text check (review_text is null or char_length(review_text) between 0 and 2000),
  language_code text not null default 'en' check (language_code in ('en', 'fr', 'hi')),
  status text not null default 'published' check (status in ('published', 'hidden', 'rejected')),
  verified_booking boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  deleted_at timestamptz
);

create index if not exists service_reviews_public_idx
  on public.service_reviews(status, created_at desc)
  where deleted_at is null;
create index if not exists service_reviews_catalog_item_idx
  on public.service_reviews(catalog_item_id, status)
  where deleted_at is null;
create index if not exists service_reviews_deal_idx
  on public.service_reviews(deal_id, status)
  where deleted_at is null;

create or replace function public.refresh_catalog_item_rating(p_catalog_item_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.catalog_items item
  set rating = coalesce((
        select round(avg(review.rating)::numeric, 2)
        from public.service_reviews review
        where review.catalog_item_id = p_catalog_item_id
          and review.status = 'published'
          and review.deleted_at is null
      ), 0),
      review_count = coalesce((
        select count(*)::integer
        from public.service_reviews review
        where review.catalog_item_id = p_catalog_item_id
          and review.status = 'published'
          and review.deleted_at is null
      ), 0),
      updated_at = timezone('utc'::text, now())
  where item.id = p_catalog_item_id;
$$;

create or replace function public.refresh_deal_rating(p_deal_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.deals deal
  set rating = coalesce((
        select round(avg(review.rating)::numeric, 2)
        from public.service_reviews review
        where review.deal_id = p_deal_id
          and review.status = 'published'
          and review.deleted_at is null
      ), 0),
      review_count = coalesce((
        select count(*)::integer
        from public.service_reviews review
        where review.deal_id = p_deal_id
          and review.status = 'published'
          and review.deleted_at is null
      ), 0),
      updated_at = timezone('utc'::text, now())
  where deal.id = p_deal_id;
$$;

create or replace function public.sync_catalog_item_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    if old.catalog_item_id is not null then
      perform public.refresh_catalog_item_rating(old.catalog_item_id);
    end if;
    if old.deal_id is not null then
      perform public.refresh_deal_rating(old.deal_id);
    end if;
    return old;
  end if;

  if new.catalog_item_id is not null then
    perform public.refresh_catalog_item_rating(new.catalog_item_id);
  end if;
  if tg_op = 'UPDATE' and old.catalog_item_id is distinct from new.catalog_item_id
     and old.catalog_item_id is not null then
    perform public.refresh_catalog_item_rating(old.catalog_item_id);
  end if;
  if new.deal_id is not null then
    perform public.refresh_deal_rating(new.deal_id);
  end if;
  if tg_op = 'UPDATE' and old.deal_id is distinct from new.deal_id
     and old.deal_id is not null then
    perform public.refresh_deal_rating(old.deal_id);
  end if;
  return new;
end;
$$;

drop trigger if exists service_reviews_updated_at on public.service_reviews;
create trigger service_reviews_updated_at
before update on public.service_reviews
for each row execute function public.touch_updated_at();

drop trigger if exists service_reviews_rating_sync on public.service_reviews;
create trigger service_reviews_rating_sync
after insert or update of rating, status, deleted_at, catalog_item_id, deal_id or delete
on public.service_reviews
for each row execute function public.sync_catalog_item_rating();

drop trigger if exists service_reviews_prevent_hard_delete on public.service_reviews;
create trigger service_reviews_prevent_hard_delete
before delete on public.service_reviews
for each row execute function public.prevent_hard_delete();

-- Remove legacy seeded/fake aggregates. The only remaining values are computed from
-- published, verified reviews in service_reviews.
update public.catalog_items item
set rating = coalesce((
      select round(avg(review.rating)::numeric, 2)
      from public.service_reviews review
      where review.catalog_item_id = item.id
        and review.status = 'published'
        and review.deleted_at is null
    ), 0),
    review_count = coalesce((
      select count(*)::integer
      from public.service_reviews review
      where review.catalog_item_id = item.id
        and review.status = 'published'
        and review.deleted_at is null
    ), 0),
    updated_at = timezone('utc'::text, now());

update public.deals deal
set rating = coalesce((
      select round(avg(review.rating)::numeric, 2)
      from public.service_reviews review
      where review.deal_id = deal.id
        and review.status = 'published'
        and review.deleted_at is null
    ), 0),
    review_count = coalesce((
      select count(*)::integer
      from public.service_reviews review
      where review.deal_id = deal.id
        and review.status = 'published'
        and review.deleted_at is null
    ), 0),
    updated_at = timezone('utc'::text, now());

create or replace function public.submit_service_review(
  p_booking_id uuid,
  p_rating integer,
  p_review_text text default null,
  p_language_code text default 'en'
)
returns public.service_reviews
language plpgsql
security definer
set search_path = public
as $$
declare
  current_booking public.bookings%rowtype;
  resolved_item_id uuid;
  resolved_deal_id uuid;
  result_review public.service_reviews;
  safe_language text := case when p_language_code in ('en', 'fr', 'hi') then p_language_code else 'en' end;
  safe_name text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required to submit a review';
  end if;
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'Rating must be between 1 and 5';
  end if;
  if p_review_text is not null and char_length(trim(p_review_text)) > 2000 then
    raise exception 'Review is too long';
  end if;

  select * into current_booking
  from public.bookings
  where id = p_booking_id
    and user_id = auth.uid()
    and status = 'completed'
    and deleted_at is null;
  if not found then
    raise exception 'Only a completed booking owned by the current customer can be reviewed';
  end if;

  if exists (select 1 from public.service_reviews where booking_id = p_booking_id) then
    raise exception 'This booking has already been reviewed';
  end if;

  select item.id into resolved_item_id
  from public.catalog_items item
  where item.deleted_at is null
    and (item.id::text = current_booking.service_id or item.slug = current_booking.service_id or item.metadata ->> 'legacy_id' = current_booking.service_id)
  order by case when item.id::text = current_booking.service_id then 0 when item.slug = current_booking.service_id then 1 else 2 end
  limit 1;

  if resolved_item_id is null then
    select deal.id into resolved_deal_id
    from public.deals deal
    where deal.deleted_at is null
      and (deal.id::text = current_booking.service_id or deal.slug = current_booking.service_id)
    order by case when deal.id::text = current_booking.service_id then 0 else 1 end
    limit 1;
  end if;

  safe_name := split_part(trim(current_booking.customer_name), ' ', 1);
  insert into public.service_reviews (
    booking_id, user_id, catalog_item_id, deal_id, service_id, service_name,
    display_name, rating, review_text, language_code, status, verified_booking
  ) values (
    current_booking.id, auth.uid(), resolved_item_id, resolved_deal_id, current_booking.service_id,
    current_booking.service_name, coalesce(nullif(safe_name, ''), 'Purity customer'),
    p_rating, nullif(trim(p_review_text), ''), safe_language, 'published', true
  ) returning * into result_review;

  return result_review;
end;
$$;

create or replace function public.get_public_review_summary()
returns table (average_rating numeric, review_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(round(avg(rating)::numeric, 2), 0), count(*)::bigint
  from public.service_reviews
  where status = 'published' and deleted_at is null and verified_booking = true;
$$;

alter table public.service_reviews enable row level security;
drop policy if exists "Public read verified reviews" on public.service_reviews;
create policy "Public read verified reviews"
  on public.service_reviews for select
  using (status = 'published' and deleted_at is null and verified_booking = true);

drop policy if exists "Customers read own reviews" on public.service_reviews;
create policy "Customers read own reviews"
  on public.service_reviews for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins manage reviews" on public.service_reviews;
create policy "Admins manage reviews"
  on public.service_reviews for all
  using (public.is_admin()) with check (public.is_admin());

revoke all on public.service_reviews from anon, authenticated;
grant select on public.service_reviews to anon, authenticated;
grant insert, update on public.service_reviews to authenticated;
revoke all on function public.submit_service_review(uuid, integer, text, text) from public;
revoke all on function public.get_public_review_summary() from public;
grant execute on function public.submit_service_review(uuid, integer, text, text) to authenticated;
grant execute on function public.get_public_review_summary() to anon, authenticated;
revoke delete on public.service_reviews from anon, authenticated, service_role;
