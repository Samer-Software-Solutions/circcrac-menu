-- Adds a CMS-configurable banner image for the public menu hero.

alter table public.settings
  add column banner_path text
    check (banner_path is null or length(btrim(banner_path)) > 0);
