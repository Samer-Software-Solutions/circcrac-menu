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

### Stage 3B — Admin authentication and CMS shell

Status: code complete; hosted authentication readiness remains outstanding.

- Added `/admin/login` email/password sign-in using React Hook Form and a
  shared Zod schema, with independent server-side validation and accessible
  field and credential errors.
- Added logout, including a fresh server-side administrator check before the
  local Supabase session is cleared, on both desktop and mobile CMS shells.
- Composed Supabase session refresh into the single `src/proxy.ts` with the
  existing locale behavior. Refreshed request cookies and the SSR library's
  required no-cache response headers are applied to normal, i18n, and redirect
  responses. Proxy uses `getClaims` only for optimistic `/admin` redirects.
- Added a server-only authorization DAL that uses `getUser` for fresh
  server-confirmed authorization in the protected admin layout and protected
  actions. Future protected data access and actions must use `requireAdmin`.
- Added a responsive CMS shell, navigation, overview, and protected
  intentionally scoped placeholder screens for later management stages.
- No signup, roles, memberships, service-role client, tenant concepts, or
  database changes were introduced.

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

## Remaining work

### Hosted authentication readiness

- Hosted prerequisite: Supabase Auth currently has public signup enabled
  (`disable_signup = false`) and zero administrators. Before the CMS can be
  used, disable public signup and manually create an administrator in Supabase
  Auth. This stage intentionally did not mutate hosted Auth or create
  credentials.

## Remaining stages

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

> Read `AGENTS.md`, `docs/STATUS.md`, and the relevant project docs. First
> verify the current Git status and hosted Auth readiness: public signup must be
> disabled and a manually created administrator must exist. Do not reimplement
> completed Stage 3B. Once hosted Auth is ready, continue with Stage 4 category
> management using a fresh dedicated subagent, preserving the public menu and
> Stage 3B authorization patterns.
