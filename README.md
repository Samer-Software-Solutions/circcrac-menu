# CricCrac Menu

A bilingual English/Arabic QR menu and admin CMS for one restaurant, built
with Next.js and Supabase.

## Local application

1. Copy `.env.example` to `.env` and add the project base URL and public anon
   key from Supabase API settings. Do not add a service-role key to the web app.
2. Install dependencies with `pnpm install`.
3. Start the app with `pnpm dev`.

`NEXT_PUBLIC_SUPABASE_URL` must be the project base URL, such as
`https://project-ref.supabase.co`, without `/rest/v1` or another path.

`SITE_URL` is optional. Set it to the canonical public origin (for example,
`https://menu.example.com`) before printing QR codes. The CMS otherwise uses
the origin of the current request; in either case QR codes always encode `/`.

## Database setup

The schema and storage policies are defined in `supabase/migrations/`, and the
replaceable proof-of-concept content is in `supabase/seed.sql`.

With the Supabase CLI linked to the intended project, apply committed
migrations:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

For a local Supabase stack, `supabase db reset` applies migrations and then the
seed. For a hosted project, run the seed deliberately after migrations using a
trusted SQL connection or the Supabase SQL editor. The seed is for POC content
and upserts deterministic rows when re-run.

Public signup should be disabled in Supabase Auth. Create administrator users
manually; every authenticated user is considered a restaurant administrator.

## Validation

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

See `docs/REQUIREMENTS.md`, `docs/DESIGN.md`, `docs/ARCHITECTURE.md`, and
`docs/DATABASE.md` for product and implementation constraints.
