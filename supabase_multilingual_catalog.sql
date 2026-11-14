-- Purity multilingual catalog
-- Run after supabase_catalog.sql and supabase_soft_delete.sql.
-- The English columns remain the compatibility/source-of-truth fallback. These
-- tables hold translated customer-facing content without changing prices, IDs,
-- media, booking references, or historical snapshots.

create table if not exists public.catalog_category_translations (
  id uuid default gen_random_uuid() primary key,
  category_id uuid not null references public.catalog_categories(id) on delete restrict,
  language_code text not null check (language_code = lower(language_code) and language_code ~ '^[a-z]{2}(-[a-z]{2})?$'),
  name text not null,
  description text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  deleted_at timestamptz,
  unique (category_id, language_code)
);

create table if not exists public.catalog_item_translations (
  id uuid default gen_random_uuid() primary key,
  item_id uuid not null references public.catalog_items(id) on delete restrict,
  language_code text not null check (language_code = lower(language_code) and language_code ~ '^[a-z]{2}(-[a-z]{2})?$'),
  name text not null,
  short_description text,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  deleted_at timestamptz,
  unique (item_id, language_code)
);

create table if not exists public.deal_translations (
  id uuid default gen_random_uuid() primary key,
  deal_id uuid not null references public.deals(id) on delete restrict,
  language_code text not null check (language_code = lower(language_code) and language_code ~ '^[a-z]{2}(-[a-z]{2})?$'),
  title text not null,
  subtitle text,
  description text,
  terms text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  deleted_at timestamptz,
  unique (deal_id, language_code)
);

create index if not exists catalog_category_translations_lookup_idx on public.catalog_category_translations(category_id, language_code) where deleted_at is null;
create index if not exists catalog_item_translations_lookup_idx on public.catalog_item_translations(item_id, language_code) where deleted_at is null;
create index if not exists deal_translations_lookup_idx on public.deal_translations(deal_id, language_code) where deleted_at is null;

drop trigger if exists catalog_category_translations_touch_updated_at on public.catalog_category_translations;
create trigger catalog_category_translations_touch_updated_at before update on public.catalog_category_translations for each row execute function public.touch_updated_at();
drop trigger if exists catalog_item_translations_touch_updated_at on public.catalog_item_translations;
create trigger catalog_item_translations_touch_updated_at before update on public.catalog_item_translations for each row execute function public.touch_updated_at();
drop trigger if exists deal_translations_touch_updated_at on public.deal_translations;
create trigger deal_translations_touch_updated_at before update on public.deal_translations for each row execute function public.touch_updated_at();

-- Translation rows are retained permanently. Empty translations are archived by
-- setting deleted_at; direct DELETE is rejected even for authenticated clients.
create or replace function public.prevent_translation_hard_delete()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Hard delete is disabled for multilingual catalog data';
end;
$$;

drop trigger if exists catalog_category_translations_no_hard_delete on public.catalog_category_translations;
create trigger catalog_category_translations_no_hard_delete before delete on public.catalog_category_translations for each row execute function public.prevent_translation_hard_delete();
drop trigger if exists catalog_item_translations_no_hard_delete on public.catalog_item_translations;
create trigger catalog_item_translations_no_hard_delete before delete on public.catalog_item_translations for each row execute function public.prevent_translation_hard_delete();
drop trigger if exists deal_translations_no_hard_delete on public.deal_translations;
create trigger deal_translations_no_hard_delete before delete on public.deal_translations for each row execute function public.prevent_translation_hard_delete();

alter table public.catalog_category_translations enable row level security;
alter table public.catalog_item_translations enable row level security;
alter table public.deal_translations enable row level security;

drop policy if exists "Public read live category translations" on public.catalog_category_translations;
create policy "Public read live category translations" on public.catalog_category_translations for select using (
  deleted_at is null and exists (
    select 1 from public.catalog_categories c
    where c.id = category_id and c.is_active = true and c.deleted_at is null
  )
);
drop policy if exists "Admins manage category translations" on public.catalog_category_translations;
create policy "Admins manage category translations" on public.catalog_category_translations for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read live item translations" on public.catalog_item_translations;
create policy "Public read live item translations" on public.catalog_item_translations for select using (
  deleted_at is null and exists (
    select 1 from public.catalog_items i
    where i.id = item_id and i.status = 'published' and i.deleted_at is null
  )
);
drop policy if exists "Admins manage item translations" on public.catalog_item_translations;
create policy "Admins manage item translations" on public.catalog_item_translations for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read live deal translations" on public.deal_translations;
create policy "Public read live deal translations" on public.deal_translations for select using (
  deleted_at is null and exists (
    select 1 from public.deals d
    where d.id = deal_id and d.status = 'published' and d.starts_at <= now()
      and (d.ends_at is null or d.ends_at > now()) and d.deleted_at is null
  )
);
drop policy if exists "Admins manage deal translations" on public.deal_translations;
create policy "Admins manage deal translations" on public.deal_translations for all using (public.is_admin()) with check (public.is_admin());

grant select on public.catalog_category_translations, public.catalog_item_translations, public.deal_translations to anon, authenticated;
grant insert, update on public.catalog_category_translations, public.catalog_item_translations, public.deal_translations to authenticated;

-- Backfill English so every existing record has a complete translation row.
insert into public.catalog_category_translations (category_id, language_code, name, description)
select id, 'en', name, description from public.catalog_categories
on conflict (category_id, language_code) do update set
  name = excluded.name,
  description = excluded.description,
  deleted_at = null,
  updated_at = timezone('utc'::text, now());

insert into public.catalog_item_translations (item_id, language_code, name, short_description, description, metadata)
select id, 'en', name, short_description, description, metadata from public.catalog_items
on conflict (item_id, language_code) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  metadata = excluded.metadata,
  deleted_at = null,
  updated_at = timezone('utc'::text, now());

insert into public.deal_translations (deal_id, language_code, title, subtitle, description, terms, metadata)
select id, 'en', title, subtitle, description, terms, metadata from public.deals
on conflict (deal_id, language_code) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  description = excluded.description,
  terms = excluded.terms,
  metadata = excluded.metadata,
  deleted_at = null,
  updated_at = timezone('utc'::text, now());
