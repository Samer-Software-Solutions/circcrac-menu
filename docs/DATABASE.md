# CricCrac Menu — Database

## General rules

The database belongs to exactly one restaurant. There are no restaurant,
organization, tenant, or membership tables, and application tables do not have
tenant discriminator columns. The restaurant is represented by the singleton
`settings` row.

Schema changes are stored as timestamped SQL migrations in
`supabase/migrations/`. Keep the TypeScript definitions in
`src/types/database.ts` synchronized with every schema migration.

## Categories

Table: `public.categories`

| Column | Type | Rules |
| --- | --- | --- |
| `id` | `uuid` | Primary key; defaults to `gen_random_uuid()` |
| `name_en` | `text` | Required and non-blank |
| `name_ar` | `text` | Required and non-blank |
| `sort_order` | `integer` | Required; defaults to `0`; cannot be negative |
| `enabled` | `boolean` | Required; defaults to `true` |
| `created_at` | `timestamptz` | Required; defaults to `now()` |
| `updated_at` | `timestamptz` | Required; defaults to `now()`; updated by trigger |

Categories are displayed by `sort_order ASC`. The ID is an additional stable
tie-breaker when two rows temporarily have the same order.

## Menu items

Table: `public.menu_items`

| Column | Type | Rules |
| --- | --- | --- |
| `id` | `uuid` | Primary key; defaults to `gen_random_uuid()` |
| `category_id` | `uuid` | Required foreign key to `categories.id`; `ON DELETE RESTRICT` |
| `name_en` | `text` | Required and non-blank |
| `name_ar` | `text` | Required and non-blank |
| `description_en` | `text` | Optional |
| `description_ar` | `text` | Optional |
| `price` | `numeric(10,2)` | Required exact decimal; cannot be negative |
| `image_path` | `text` | Optional; non-blank when present |
| `available` | `boolean` | Required; defaults to `true` |
| `sort_order` | `integer` | Required; defaults to `0`; cannot be negative |
| `created_at` | `timestamptz` | Required; defaults to `now()` |
| `updated_at` | `timestamptz` | Required; defaults to `now()`; updated by trigger |

Items are displayed within a category by `sort_order ASC`, using the ID as a
stable tie-breaker. A category containing items cannot be deleted until its
items are moved or deleted. Temporarily unavailable items stay in the table
with `available = false` and remain visible on the public menu.

## Settings

Table: `public.settings`

| Column | Type | Rules |
| --- | --- | --- |
| `id` | `uuid` | Primary key; defaults to `gen_random_uuid()` |
| `restaurant_name_en` | `text` | Required and non-blank |
| `restaurant_name_ar` | `text` | Required and non-blank |
| `logo_path` | `text` | Optional; non-blank when present |
| `currency` | `text` | Required three-letter uppercase code; defaults to `QAR` |
| `primary_color` | `text` | Optional `#RRGGBB` color |
| `default_language` | `text` | Required; `en` or `ar`; defaults to `en` |
| `updated_at` | `timestamptz` | Required; defaults to `now()`; updated by trigger |

A unique index on the constant expression `true` allows at most one settings
row without adding a restaurant or tenant column. The seed creates that one
row. Application settings should be updated in place.

## Row-level security and privileges

RLS is enabled on all three application tables. Table privileges and policies
work together as follows:

- `anon` can select enabled categories.
- `anon` can select menu items only when their category is enabled. The item
  `available` flag does not hide the row, so the UI can show an unavailable
  state.
- `anon` can select the settings row.
- `authenticated` can select, insert, update, and delete all application rows.
  In this single-restaurant application, every account admitted through
  Supabase Auth is an administrator; public signup should remain disabled.
- Neither role receives privileges outside those explicitly granted by the
  migration. No service-role client is used by the application.

## Storage

Supabase Storage uses one public bucket named `menu-images` for food images and
the restaurant logo.

- Public object reads are allowed.
- Only `authenticated` users can upload, replace, or delete objects.
- Files are limited to 5 MiB.
- Allowed MIME types are JPEG, PNG, WebP, and AVIF.
- Database columns store stable object paths rather than signed URLs.

The storage migration upserts the bucket configuration and recreates its named
policies, making those parts safe to re-run. The application only permits
Next.js image optimization for this project's Supabase host and the public
`menu-images` object path.

## Proof-of-concept seed

`supabase/seed.sql` provides replaceable bilingual proof-of-concept content:

- one settings row using QAR;
- ordered enabled categories plus one disabled category;
- ordered English and Arabic menu items;
- one unavailable item and an item in the disabled category;
- nullable image paths until real assets are uploaded.

All seed IDs are deterministic UUIDs. Inserts upsert their owned rows so local
resets and deliberate seed re-runs produce predictable POC data. The CMS will
later replace this content with the restaurant's real menu.

## Migration workflow

For every database change:

1. Add a migration under `supabase/migrations/`.
2. Update this document.
3. Regenerate or update `src/types/database.ts`.
4. Test RLS with both anonymous and authenticated clients.

The committed migrations are the source of truth. Do not make undocumented
schema changes directly in the Supabase dashboard.
