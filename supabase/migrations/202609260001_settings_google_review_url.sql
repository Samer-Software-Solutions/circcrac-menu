-- Adds a CMS-configurable Google review link. When set, the public menu shows
-- a floating button that opens the restaurant's Google review page.

alter table public.settings
  add column google_review_url text
    check (
      google_review_url is null
      or (google_review_url ~ '^https://[^\s]+$' and length(google_review_url) <= 2048)
    );
