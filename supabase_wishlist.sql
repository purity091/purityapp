-- Customer wishlist storage.
-- Run this migration once in the Supabase SQL Editor.

create table if not exists public.wishlist_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  deleted_at timestamptz,
  primary key (user_id, item_id)
);

create index if not exists wishlist_items_user_created_at_idx
  on public.wishlist_items (user_id, created_at);

alter table public.wishlist_items enable row level security;

drop policy if exists "Customers read own wishlist" on public.wishlist_items;
create policy "Customers read own wishlist"
  on public.wishlist_items for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Customers add own wishlist" on public.wishlist_items;
create policy "Customers add own wishlist"
  on public.wishlist_items for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Customers remove own wishlist" on public.wishlist_items;
create policy "Customers remove own wishlist"
  on public.wishlist_items for delete
  to authenticated
  using (auth.uid() = user_id);

grant select, insert, delete on public.wishlist_items to authenticated;
