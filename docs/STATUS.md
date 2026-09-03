# CricCrac Menu — Project Status

Last updated: 2026-09-03

## Scope and working agreement

- This application serves exactly one restaurant.
- Public customers do not authenticate. Only administrators use Supabase Auth.
- Supported languages are exactly English (`en`) and Arabic (`ar`).
- Continue using a fresh dedicated subagent for each implementation stage.
- Read `AGENTS.md` and the relevant local Next.js 16 documentation before code
  changes.
- Run ESLint, TypeScript, and the production build before completing every
  implementation stage.

## Completed work

### Stage 1 — Supabase foundation

Status: complete and committed in `5511cf8`.

- Added `categories`, `menu_items`, and singleton `settings` schema migrations.
- Added constraints, ordering indexes, automatic `updated_at`, and category
  deletion restriction.
- Added RLS: anonymous users only see public menu data; authenticated users can
  manage application data.
- Added the public `menu-images` bucket with authenticated-only writes.
- Added strict database types and browser/server Supabase clients.
- Added deterministic bilingual POC seed content.
- The migrations and seed have been applied to the hosted Supabase project.
- Verified hosted anonymous visibility: 3 categories, 5 items, and 1 settings
  row. The storage bucket is live and public.

### Stage 2 — Internationalization foundation

Status: complete and committed in `a51bd62`.

- Added `next-intl` routing for exactly `/en` and `/ar`.
- `/` remains the permanent QR entry and redirects to the detected/default
  locale.
- Locale choice persists through the `NEXT_LOCALE` cookie.
- Added document-level `lang` and `dir`, Geist for English, and Noto Sans Arabic
  for Arabic.
- Added typed message dictionaries, navigation helpers, localized metadata,
  language switching, and localized 404 content.
- The locale proxy excludes `/admin`, APIs, Next internals, and static files so
  it can later be composed with admin session handling.

### Stage 3A — Public menu

Status: complete and committed in `d682d1`.

- Reads the live menu through a server-only anonymous Supabase client.
- Uses a tagged `public-menu` cache with a 300-second fallback lifetime. Future
  CMS mutations must invalidate this tag.
- Renders localized restaurant settings, ordered enabled categories, ordered
  items, localized descriptions, and locale-aware currency prices.
- Keeps unavailable items visible with an accessible unavailable state.
- Uses optimized prominent images when storage paths exist and intentional
  text-first cards when images are missing.
- Includes a sticky, horizontally scrollable category navigator with active
  section tracking and reduced-motion support.
- Includes translated loading, empty, and data-error states.
- Responsive and RTL behavior was checked at mobile and desktop sizes in both
  locales, including long text and missing images.

## Architecture decisions already made

- The permanent QR URL is `/`; public content uses explicit locale URLs.
- Public menu reads use the anonymous key and RLS, never the service-role key.
- The public menu is server-rendered. Only focused interactions such as category
  tracking and locale switching create client boundaries.
- Any Supabase account admitted to this closed application is an administrator.
  Public signup must remain disabled and administrators are created manually.
- Categories containing items cannot be deleted until their items are moved or
  deleted.
- Food images and the restaurant logo share the `menu-images` bucket and the
  database stores stable object paths.
- No restaurant, tenant, organization, membership, billing, ordering, cart, or
  payment concepts should be introduced.

## Remaining stages

### Stage 3B — Admin authentication and CMS shell (next)

- Add `/admin/login`, email/password login, logout, and clear error states.
- Extend the single `src/proxy.ts` so Supabase sessions are refreshed while the
  existing locale behavior remains unchanged.
- Add a server-only authorization/data-access function and enforce it close to
  protected data and every future Server Action. Proxy redirects are only an
  optimistic first check.
- Add the protected `/admin` layout and responsive CMS navigation using
  shadcn/Base UI.
- Do not add public signup, roles, membership tables, or multi-restaurant logic.
- Prerequisite: disable public signup and manually create at least one admin in
  Supabase Auth.
- Current hosted Auth check: public signup is enabled and there are zero users,
  so both prerequisite actions are still outstanding.

### Stage 4 — Category management

- Category list, create/edit forms, delete handling, enabled toggles, and
  drag-and-drop ordering.
- Use React Hook Form, Zod, server-side validation, protected Server Actions,
  and `dnd-kit` for ordering.
- Invalidate the `public-menu` cache after successful mutations.

### Stage 5 — Menu item and image management

- Item list and bilingual create/edit forms.
- Category assignment, exact price editing, descriptions, availability, and
  drag-and-drop ordering within categories.
- Upload, replace, and remove images in Supabase Storage with validation and
  cleanup of replaced objects.
- Invalidate the `public-menu` cache after successful mutations.

### Stage 6 — Restaurant settings and QR code

- Edit bilingual restaurant names, logo, currency, primary color, and default
  language.
- Generate the permanent public-menu QR code with reliable PNG and SVG export
  suitable for printing.
- Invalidate the `public-menu` cache after settings changes.

### Stage 7 — Final QA and deployment

- Complete mobile, tablet, desktop, English, Arabic, RTL, accessibility,
  performance, auth, and RLS checks.
- Test long/missing content, unavailable items, image failure, empty states,
  ordering, and all CMS mutations.
- Run ESLint, TypeScript, and a production build, then prepare deployment and
  environment configuration.

## Suggested next-thread prompt

> Read `AGENTS.md`, `docs/STATUS.md`, and the relevant project docs. Continue
> with Stage 3B using a fresh dedicated subagent. First verify the current Git
> status and that Supabase public signup is disabled and an administrator exists.
> Preserve the completed public menu and compose admin session handling into the
> existing single `src/proxy.ts`.
