-- Core schema for the single-restaurant CricCrac menu.

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name_en text not null check (length(btrim(name_en)) > 0),
  name_ar text not null check (length(btrim(name_ar)) > 0),
  sort_order integer not null default 0 check (sort_order >= 0),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  name_en text not null check (length(btrim(name_en)) > 0),
  name_ar text not null check (length(btrim(name_ar)) > 0),
  description_en text,
  description_ar text,
  price numeric(10, 2) not null check (price >= 0),
  image_path text check (image_path is null or length(btrim(image_path)) > 0),
  available boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  restaurant_name_en text not null check (length(btrim(restaurant_name_en)) > 0),
  restaurant_name_ar text not null check (length(btrim(restaurant_name_ar)) > 0),
  logo_path text check (logo_path is null or length(btrim(logo_path)) > 0),
  currency text not null default 'QAR' check (currency ~ '^[A-Z]{3}$'),
  primary_color text check (
    primary_color is null or primary_color ~ '^#[0-9A-Fa-f]{6}$'
  ),
  default_language text not null default 'en' check (default_language in ('en', 'ar')),
  updated_at timestamptz not null default now()
);

-- A constant expression is unique at most once, allowing at most one
-- settings record without adding a tenant or restaurant discriminator column.
create unique index settings_singleton_idx on public.settings ((true));

create index categories_sort_order_idx on public.categories (sort_order, id);
create index menu_items_category_sort_order_idx
  on public.menu_items (category_id, sort_order, id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger menu_items_set_updated_at
before update on public.menu_items
for each row execute function public.set_updated_at();

create trigger settings_set_updated_at
before update on public.settings
for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.settings enable row level security;

revoke all on table public.categories from anon, authenticated;
revoke all on table public.menu_items from anon, authenticated;
revoke all on table public.settings from anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select on table public.categories to anon;
grant select on table public.menu_items to anon;
grant select on table public.settings to anon;
grant all on table public.categories to authenticated;
grant all on table public.menu_items to authenticated;
grant all on table public.settings to authenticated;

create policy "Public can read enabled categories"
on public.categories
for select
to anon
using (enabled);

create policy "Authenticated admins can manage categories"
on public.categories
for all
to authenticated
using (true)
with check (true);

create policy "Public can read items in enabled categories"
on public.menu_items
for select
to anon
using (
  exists (
    select 1
    from public.categories
    where categories.id = menu_items.category_id
      and categories.enabled
  )
);

create policy "Authenticated admins can manage menu items"
on public.menu_items
for all
to authenticated
using (true)
with check (true);

create policy "Public can read settings"
on public.settings
for select
to anon
using (true);

create policy "Authenticated admins can manage settings"
on public.settings
for all
to authenticated
using (true)
with check (true);
