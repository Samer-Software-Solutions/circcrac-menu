# CricCrac Menu — Architecture

## Architecture Overview

The application intentionally uses a simple architecture.

Customer/Admin Browser
        |
        v
      Next.js
        |
        v
     Supabase
     /   |   \
Postgres Auth Storage

## Application

Next.js handles:

- public menu rendering
- admin CMS
- routing
- internationalization
- server-side application logic
- communication with Supabase

The application uses the App Router.

Prefer Server Components by default.

Use Client Components only where browser-side interactivity is required.

## Backend

There is no separate backend application.

Supabase provides:

### PostgreSQL

Stores:

- categories
- menu items
- restaurant settings

### Supabase Auth

Provides administrator authentication.

Customers do not authenticate.

### Supabase Storage

Stores:

- menu item images
- restaurant logo

## Server-Side Operations

Sensitive mutations should run through appropriate server-side mechanisms such as:

- Server Actions
- Route Handlers
- server-side Supabase clients

Never expose privileged Supabase credentials to browser code.

## Hosting

Recommended deployment:

Next.js:
Vercel

Database/Auth/Storage:
Supabase

## Public Menu

The root public application is the restaurant menu.

Primary route:

`/`

The menu should favor server-rendered output and minimal client-side JavaScript.

Interactive functionality may use Client Components where necessary.

## CMS

Admin functionality exists under:

`/admin`

Potential routes include:

- `/admin`
- `/admin/menu`
- `/admin/categories`
- `/admin/settings`
- `/admin/qr`

Admin routes require authentication.

## Internationalization

Use `next-intl`.

Supported locales:

- `en`
- `ar`

Arabic uses RTL.

Do not duplicate entire applications for English and Arabic.

## Data Access

Database access logic should be centralized where practical.

Suggested structure:

lib/
  supabase/
  data/
  validations/

Avoid database calls scattered throughout unrelated UI components.

## Database Changes

Database schema changes must use Supabase migrations.

Example:

supabase/
  migrations/
    001_initial_schema.sql
    002_storage.sql

Migration filenames may use timestamp-based Supabase naming instead.

## Image Storage

Supabase Storage should contain dedicated application buckets.

Example:

menu-images

Images should be referenced in the database using stable paths or URLs.

## Security

Security requirements:

- admin routes protected
- database policies configured appropriately
- service-role credentials server-only
- CMS input validated
- public menu read access allowed only to data intended for public display

## Architecture Constraints

Do not introduce:

- Express
- NestJS
- Fastify
- another API server
- Redis
- queues
- microservices
- Kubernetes
- Docker infrastructure solely for production architecture
- GraphQL
- multiple databases

These technologies may only be introduced when a concrete requirement justifies them.

## Guiding Principle

Build for the requirements that currently exist.

Do not architect for hypothetical future products.