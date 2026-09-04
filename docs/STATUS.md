# CricCrac Menu — Project Status

Last updated: 2026-09-04

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

Status: complete.

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

### Stage 4 — Category management

Status: code complete.

- Added an independently protected category read and `/admin/categories` CMS
  screen with responsive list, empty, and data-error states.
- Added bilingual React Hook Form create/edit validation plus independent Zod
  validation in every protected Server Action.
- Added enabled/disabled controls, item-aware deletion messaging for the
  database's `ON DELETE RESTRICT` behavior, and accessible pointer/keyboard
  drag-and-drop ordering through `dnd-kit`.
- Category mutations use Next 16 `updateTag` to expire the `public-menu` cache
  tag immediately after a successful write. Reorder requests validate against
  the complete current category ID set before applying the new order.

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

### Hosted authentication readiness

- Status: ready. Public signup has been disabled and an administrator was
  created manually in Supabase Auth. The hosted project was verified to contain
  one administrator on 2026-09-03; no credentials are stored in the repository.

## Latest completed stage

### Stage 5 — Menu item and image management

Status: code complete.

- Added a protected responsive menu-item CMS list with useful empty and data-error states.
- Added bilingual React Hook Form/Zod create and edit validation, plus independent
  Zod validation in every protected item action.
- Added category assignment, optional bilingual descriptions, exact
  `numeric(10,2)`-compatible non-negative price validation, and availability controls.
- Added accessible pointer and keyboard `dnd-kit` ordering scoped to individual categories.
- Added JPEG/PNG/WebP/AVIF upload, replace, and remove workflows for the public
  `menu-images` bucket. Files are limited to 5 MiB, get unique safe item paths,
  and are cleaned up appropriately on failed database writes or after replacement/deletion.
- Added reference checks before object deletion (including item and settings image
  paths), with clear administrator warnings if a storage cleanup fails.
- Configured Next Server Actions with a 6 MiB request limit so valid 5 MiB uploads
  reach application validation. All successful public-data mutations call
  `updateTag('public-menu')`.
- Verified with ESLint, `tsc --noEmit`, and a production build.

### Stage 3A.1 — Public menu hero redesign

Status: code complete, merged to `main`. UI is intentionally a first pass —
see `docs/DESIGN.md` "Known rough edges" for the planned follow-up polish.

- Replaced the plain header/intro with a hero banner (`MenuHero`): a collage
  of up to 3 existing menu-item photos, or a `primaryColor` gradient +
  monogram fallback when no item photos exist yet, overlapped by a card with
  the logo, restaurant name, and a category-name subtitle. No `settings`
  schema change was made — see `docs/DESIGN.md` before adding a dedicated
  banner field.
- Evolved `CategoryNavigation` into a filled-pill tab bar plus a hamburger
  button that opens a Base UI `Dialog` bottom sheet listing every category
  for one-tap quick-jump navigation.
- Updated `MenuSkeleton` to mirror the new hero/nav structure so there is no
  layout shift while the page loads.
- Added `PublicMenu.openQuickJump` / `closeQuickJump` / `quickJumpTitle` to
  both `messages/en.json` and `messages/ar.json`.
- Verified at mobile and desktop widths, in both locales, with true RTL
  mirroring (logo/hamburger side, tab order, subtitle alignment) — not just
  right-aligned text. Verified with ESLint, `tsc --noEmit`, and a production
  build.
- An alternate full redesign (editorial/print-menu style) was prototyped
  side-by-side on `feature/menu-creative-redesign` and intentionally not
  merged; the branch is kept for reference only.

### Stage 6 — Restaurant settings and QR code

Status: code complete.

- Added a protected singleton settings read and a responsive React Hook Form/
  Zod CMS form for bilingual names, currency, primary color, default language,
  and an optional logo.
- Settings mutations independently authorize and validate on the server, update
  only the existing singleton row, invalidate `public-menu`, and use the same
  cross-reference storage cleanup safety as menu item images.
- The permanent `/` entry now honors a valid locale cookie, then detected
  `Accept-Language`, then the settings default language. Proxy session refresh
  remains in place while the root Server Component performs the dynamic
  fallback.
- Added protected QR preview plus 2048px PNG and SVG downloads. QR payloads
  are always the site root; logo overlays use high error correction and fall
  back cleanly to logo-free output if the public logo cannot load.
- `SITE_URL` optionally fixes the print canonical origin; otherwise the QR
  screen uses the request origin.
- Verified with ESLint, `tsc --noEmit`, and a production build.

## Remaining stages

### Stage 7 — Final QA and deployment

- Complete mobile, tablet, desktop, English, Arabic, RTL, accessibility,
  performance, auth, and RLS checks.
- Test long/missing content, unavailable items, image failure, empty states,
  ordering, and all CMS mutations.
- Run ESLint, TypeScript, and a production build, then prepare deployment and
  environment configuration.
