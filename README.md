# NangNyamai

AI-powered smart digital restaurant menu and ordering system for **Budaya
Restaurant, Sarawak Cultural Village**.

Dine-in customers scan a table QR code, browse the menu, add items to a
cart, submit an order, and track its status in real time. Staff receive,
verify, and update incoming orders. Admins manage menu data and view basic
analytics. The system runs alongside the restaurant's existing AutoCount
POS workflow (no direct AutoCount API integration unless explicitly
requested later).

## Status

**Sprint 0 — environment & architecture.** No application screens beyond
placeholders yet. See [Sprint Plan](#sprint-plan) below.

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth — Guest + Google OAuth (customer), email/password (staff/admin) |
| Realtime | Supabase Realtime |
| Storage | Supabase Storage (menu images) |
| Deployment | Vercel |

## Project Architecture

```
src/
  app/
    (customer)/order/   # table QR landing → menu → cart → order (Sprint 1)
    staff/               # staff order queue & dashboard (Sprint 2)
    admin/               # admin menu & analytics (Sprint 5)
    auth/callback/        # Supabase OAuth callback route
    api/                  # route handlers, as needed
  components/
    customer/ staff/ admin/ shared/ ui/
  lib/
    supabase/    # browser + server + middleware Supabase clients
    auth/        # server-side role lookup / authorization helpers
    database/    # data-access helpers (added as features are built)
    validation/  # zod schemas for server-side input validation
    utils/
  hooks/
  types/         # hand-written DB types (Sprint 0) → generated later
  services/      # reusable business-logic services
  constants/     # centralized status & role constants
```

Server Components are used by default; Client Components only where
interactivity is required.

## Local Development

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase project values
npm run dev
```

App runs at `http://localhost:3000`.

Other scripts:

```bash
npm run lint     # ESLint
npm run build    # production build (also type-checks)
```

## Environment Variables

Defined in `.env.example` — copy to `.env.local` and fill in real values
from your own Supabase project. Never commit `.env.local`.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Only the public anon key is used client-side. If a `service_role` key is
ever needed for a server-only admin task, store it as
`SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix) and read it only in
server-side code — never in a Client Component.

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the Project URL and anon public key into `.env.local`.
3. Review and run `supabase/sql/001_schema.sql` in the SQL editor (proposed
   schema — read it first, it is not applied automatically by this repo).
4. Review and run `supabase/sql/002_rls_policies.sql` (proposed RLS
   policies — also for review before running).
5. Generate typed database types once the schema is live (optional, replaces
   the hand-written `src/types/database.ts`):

   ```bash
   npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
   ```

## Google OAuth Setup

Customer sign-in uses **Supabase Auth with the Google provider** (staff/admin
use email/password, not Google).

1. In [Google Cloud Console](https://console.cloud.google.com/), create an
   OAuth 2.0 Client ID (Web application).
2. Add authorized redirect URI:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. In Supabase Dashboard → Authentication → Providers → Google: paste the
   Client ID and Client Secret, enable the provider.
4. In Supabase Dashboard → Authentication → URL Configuration, add your app's
   callback URL, e.g. `http://localhost:3000/auth/callback` (dev) and the
   production equivalent.

**Flow:** customer at Table T12 → taps "Continue with Google" → Google
login → redirected to `/auth/callback` (`src/app/auth/callback/route.ts`)
→ session established, profile synced with `role: customer` → redirected
back to the table's ordering session via the `next` query param, so table
context is never lost.

## Security

- Row Level Security is enabled on every table; policies are proposed in
  `supabase/sql/002_rls_policies.sql` and must be reviewed before applying.
- Route-level protection: `middleware.ts` redirects unauthenticated users
  away from `/staff/*` and `/admin/*`. This is a UX convenience only —
  `src/lib/auth/roles.ts` provides the server-side role check that actually
  guards sensitive reads/writes, backed by RLS.
- Customers can create their own orders but cannot update order status or
  payment status directly (no customer UPDATE policy exists for those
  fields) — only staff/admin can transition order status.
- No Supabase service-role key is ever used in client-side code.

## Sprint Plan

| Sprint | Scope |
|---|---|
| 0 | Environment and architecture *(current)* |
| 1 | Customer Menu + Cart + Submit Order |
| 2 | Staff Order Queue + Order Details |
| 3 | Realtime Order Tracking |
| 4 | Payment workflow |
| 5 | Admin Menu Management |
| 6 | Authentication improvements and role security |
| 7 | AI Menu Assistant |
| 8 | Feedback and analytics |
| 9 | PWA polishing and final testing |

The **golden path** every sprint must protect: guest customer at Table T12
browses the menu → orders Sarawak Laksa → staff verifies → preparing →
ready → customer sees each update in real time → staff confirms payment
and completes the order.

Each sprint stops for review/approval before the next one starts.
