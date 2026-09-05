-- Adds CMS-configurable QR code shape: dot style, corner square style,
-- corner dot style, and the logo's size relative to the code.

alter table public.settings
  add column qr_dot_type text not null default 'square'
    check (qr_dot_type in ('dots', 'rounded', 'classy', 'classy-rounded', 'square', 'extra-rounded')),
  add column qr_corner_square_type text not null default 'square'
    check (qr_corner_square_type in ('dot', 'dots', 'rounded', 'classy', 'classy-rounded', 'square', 'extra-rounded')),
  add column qr_corner_dot_type text not null default 'square'
    check (qr_corner_dot_type in ('dot', 'dots', 'rounded', 'classy', 'classy-rounded', 'square', 'extra-rounded')),
  add column qr_logo_size numeric(3, 2) not null default 0.30
    check (qr_logo_size >= 0.10 and qr_logo_size <= 0.50);
