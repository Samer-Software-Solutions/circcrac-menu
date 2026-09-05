-- Adds a CMS-configurable bilingual tagline shown under the restaurant name
-- on the public menu hero, replacing the auto-generated category list.

alter table public.settings
  add column tagline_en text
    check (tagline_en is null or length(btrim(tagline_en)) > 0),
  add column tagline_ar text
    check (tagline_ar is null or length(btrim(tagline_ar)) > 0);
