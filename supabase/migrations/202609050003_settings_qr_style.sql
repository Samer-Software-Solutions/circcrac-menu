-- Adds CMS-configurable QR code styling: dot color, background color, and a
-- logo overlay kept independent from the restaurant settings logo.

alter table public.settings
  add column qr_dot_color text not null default '#E0332D'
    check (qr_dot_color ~ '^#[0-9A-Fa-f]{6}$'),
  add column qr_background_color text not null default '#242021'
    check (qr_background_color ~ '^#[0-9A-Fa-f]{6}$'),
  add column qr_logo_path text
    check (qr_logo_path is null or length(btrim(qr_logo_path)) > 0);
