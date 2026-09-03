<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
# CricCrac Menu — Project Instructions

## Project Scope

This application is a digital QR menu for **ONE restaurant only**.

The system must remain intentionally simple.

Do NOT implement:

* multi-tenancy
* multiple restaurants
* restaurant switching
* organizations
* tenants
* `restaurant_id` foreign keys
* subscription systems
* SaaS billing
* restaurant membership systems
* unnecessary infrastructure abstractions

There is exactly one restaurant configuration in this application.

---

## Core Stack

Use the existing project stack:

* Next.js
* React
* TypeScript
* App Router
* React Compiler
* Tailwind CSS
* shadcn/ui with Base UI
* Lucide icons
* Supabase PostgreSQL
* Supabase Auth
* Supabase Storage
* next-intl
* React Hook Form
* Zod
* dnd-kit where drag-and-drop ordering is required

Do not introduce another framework, database, backend server, UI library, state management library, or infrastructure component unless there is a clear requirement.

---

## Application Areas

The application consists of two main areas.

### Public Menu

Route:

`/`

The public menu is the customer-facing product.

Requirements:

* mobile-first design
* responsive on tablets and desktop
* English
* Arabic
* proper RTL support
* fast initial loading
* optimized images
* menu categories
* menu items
* item names
* item descriptions
* item prices
* item availability
* restaurant branding
* language switching
* no customer authentication

The public menu should feel like a polished restaurant product.

Do NOT make the public menu look like a generic SaaS dashboard.

Do not use shadcn components blindly for the public menu. Custom components are preferred where they improve the visual design.

### Admin CMS

Routes:

`/admin/*`

The admin CMS is used by restaurant management.

The CMS must support:

* administrator login
* category management
* menu item management
* image upload
* price editing
* English content
* Arabic content
* availability toggles
* category ordering
* menu item ordering
* restaurant branding/settings
* QR code generation

shadcn/ui should be preferred for admin interfaces.

---

## Backend

Supabase is the backend.

Use Supabase for:

* PostgreSQL
* authentication
* image/file storage

Do NOT create:

* Express
* NestJS
* Fastify
* separate Node.js API
* Django
* Laravel
* microservices
* Redis
* message queues

Use Next.js Server Components, Server Actions, Route Handlers, and Supabase where appropriate.

---

## Authentication

Only administrators require authentication.

Customers viewing the menu do not authenticate.

Admin routes must be protected.

Never expose Supabase service-role credentials to client-side code.

---

## Database Changes

Read:

`docs/DATABASE.md`

before modifying the database.

All database schema changes should be represented through Supabase migrations.

Do not manually introduce undocumented tables or columns.

When the schema changes, update `docs/DATABASE.md`.

---

## Product Requirements

Read:

`docs/REQUIREMENTS.md`

before implementing application features.

Do not invent major product requirements without being explicitly asked.

---

## UI and Design

Read:

`docs/DESIGN.md`

before implementing customer-facing UI.

Important principles:

* mobile-first
* food imagery should be visually important
* interface should feel premium and clean
* avoid unnecessary borders and cards
* avoid generic AI-generated dashboard aesthetics
* Arabic must use true RTL layout
* English and Arabic designs should feel equally intentional

---

## TypeScript

Use strict TypeScript.

Avoid `any`.

Prefer explicit types for:

* database data
* form values
* component props
* API responses
* server actions

---

## React

Prefer Server Components by default.

Use Client Components only when browser-side interaction is required.

Examples requiring Client Components include:

* interactive forms
* language selectors where necessary
* drag and drop
* dialogs
* interactive menu navigation

React Compiler is enabled.

Do not add `useMemo`, `useCallback`, or `React.memo` automatically for perceived performance improvements.

Use manual memoization only when there is a demonstrated reason.

---

## Components

Keep components focused.

Prefer reusable components when genuine reuse exists.

Do not create abstractions simply because they might theoretically be useful later.

Avoid premature abstraction.

---

## Forms

Use:

* React Hook Form
* Zod

Validate user-controlled data.

Server-side validation must still exist for important CMS mutations.

---

## Images

Menu images should:

* use consistent aspect ratios
* use `object-fit: cover` where appropriate
* be optimized for web delivery
* avoid unnecessarily large files
* use Next.js image optimization where appropriate

Images are stored in Supabase Storage.

---

## Internationalization

The application supports exactly:

* English
* Arabic

Use `next-intl`.

Arabic layouts must use proper RTL behavior.

Do not simply right-align Arabic text.

When Arabic is active:

* document direction should become RTL
* layout order should mirror where appropriate
* directional icons should mirror where appropriate
* text alignment should follow RTL conventions

---

## Code Quality

Before considering an implementation task complete:

1. Run ESLint.
2. Run TypeScript checks.
3. Run the production build.
4. Fix errors introduced by the task.

Do not leave known errors behind.

---

## General Engineering Principle

Prefer the simplest implementation that cleanly satisfies the current requirements.

Do not engineer for hypothetical future requirements.
