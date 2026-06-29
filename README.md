# Sidekit

> A toolkit for running your side-businesses — order, inventory, cost, customer, and finance management for solo founders juggling multiple ventures.

[![CI](https://github.com/aneebbaig/sidekit/actions/workflows/ci.yml/badge.svg)](https://github.com/aneebbaig/sidekit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

Production-grade business management portal for solo founders managing multiple businesses ("hustles"). Each hustle gets its own complete management suite — research notes, cost sheet with live margin calculator, suppliers, inventory, orders, customers, financials, tasks. Plus a consolidated cross-hustle dashboard and a public order tracking page.

**Stack:** Next.js 16 (App Router, RSC, Server Actions) · TypeScript 6 strict · Prisma 7 + PostgreSQL · NextAuth v5 · shadcn-style UI on Tailwind v4 · Zustand · React Hook Form + Zod 4 · Recharts 3 · TanStack Table.

---

## Table of contents

- [Prerequisites](#prerequisites)
- [Local development setup](#local-development-setup)
- [Production deployment (Vercel + Neon)](#production-deployment-vercel--neon)
- [Schema changes — how to apply](#schema-changes--how-to-apply)
- [Project scripts](#project-scripts)
- [Architecture](#architecture)
- [Feature map](#feature-map)
- [Public API](#public-api)
- [Environment variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool        | Version | Notes                                                              |
| ----------- | ------- | ------------------------------------------------------------------ |
| **Node.js** | ≥ 20    | Tested on Node 22+.                                                |
| **pnpm**    | ≥ 9     | `npm i -g pnpm`                                                    |
| **Docker**  | latest  | Optional — used for the local Postgres container.                  |
| **Git**     | any     | —                                                                  |
| **OpenSSL** | any     | To generate `AUTH_SECRET`. Most systems have it.                   |

---

## Local development setup

### 1. Clone and install

```bash
git clone https://github.com/aneebbaig/sidekit.git
cd sidekit
pnpm install
```

`postinstall` runs `prisma generate` automatically.

### 2. Configure environment

```bash
cp .env.example .env
```

Generate an auth secret and paste it into `.env` as `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 3. Start a local Postgres database

```bash
docker compose up -d
```

Boots Postgres 16 on `localhost:5433` (non-standard port to avoid colliding with native installs).

- user: `sidekit`
- password: `sidekit`
- database: `sidekit`

The default `DATABASE_URL` in `.env.example` already matches this.

To stop:

```bash
docker compose down       # stop but keep data
docker compose down -v    # stop and delete all data
```

**No Docker?** Use any hosted Postgres (Neon, Supabase, etc.) and set `DATABASE_URL` to its connection string.

### 4. Apply the schema

```bash
pnpm db:push
```

### 5. Seed demo data (optional)

```bash
pnpm db:seed
```

Creates a demo hustle "Resin Hustle" with sample orders, customers, suppliers, inventory, etc., and the owner account:

```
email:    owner@example.com
password: sidekit123
```

### 6. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). If no account exists yet, you'll be redirected to `/setup`.

### 7. Optional: Prisma Studio

```bash
pnpm db:studio
```

Opens a DB browser UI at [http://localhost:5555](http://localhost:5555).

---

## Production deployment (Vercel + Neon)

### 1. Provision a Neon database

1. Go to [neon.tech](https://neon.tech) → create a project → create a database.
2. Copy the two connection strings:
   - **Pooled** → use as `DATABASE_URL`
   - **Direct (unpooled)** → use as `DATABASE_URL_UNPOOLED`

### 2. Import project in Vercel

1. Vercel Dashboard → **Add New… → Project** → import `aneebbaig/sidekit`.
2. Framework preset: **Next.js** (auto-detected).
3. Build command: leave default (`prisma generate && next build` runs via `package.json`).
4. Install command: `pnpm install` (auto-detected).

### 3. Set environment variables in Vercel

Project → **Settings → Environment Variables**, add:

| Variable                | Value                                  |
| ----------------------- | -------------------------------------- |
| `DATABASE_URL`          | Pooled Neon connection string          |
| `DATABASE_URL_UNPOOLED` | Direct Neon connection string          |
| `AUTH_SECRET`           | `openssl rand -base64 32` output       |
| `AUTH_TRUST_HOST`       | `true`                                 |
| `NEXTAUTH_URL`          | `https://your-deployment.vercel.app`   |

Set for **Production**, **Preview**, and **Development** scopes as needed.

### 4. Apply the schema to production

Run this once from your local machine after setting up `.env.production.local` with the Neon URLs:

```bash
DATABASE_URL_UNPOOLED="<direct neon url>" npx prisma db push
```

Or with the local production env file:

```bash
# .env.production.local already has the Neon URLs
DATABASE_URL_UNPOOLED=$(grep DATABASE_URL_UNPOOLED .env.production.local | cut -d= -f2-) npx prisma db push
```

### 5. Deploy

Push to `main` — Vercel auto-deploys. Visit the URL, go to `/setup` if no account yet.

---

## Schema changes — how to apply

Whenever you add or modify a field in `prisma/schema.prisma`:

### Local

```bash
pnpm db:push
npx prisma generate
```

### Production

```bash
DATABASE_URL_UNPOOLED="<direct neon url>" npx prisma db push
```

Or using the local production env file:

```bash
DATABASE_URL_UNPOOLED=$(grep DATABASE_URL_UNPOOLED .env.production.local | cut -d= -f2-) npx prisma db push
```

> **Important:** Vercel only runs `prisma generate` (no DB access needed) at build time. Applying schema changes to the production DB is always a manual step you run locally pointing at the Neon direct URL. If you forget this, the app crashes with `P2022 column does not exist`.

### Full workflow for a schema change

```bash
# 1. Edit prisma/schema.prisma
# 2. Push to local DB + regenerate client
pnpm db:push && npx prisma generate
# 3. Code + test locally
# 4. Push schema to production DB
DATABASE_URL_UNPOOLED="<direct neon url>" npx prisma db push
# 5. Commit and push code to main → Vercel deploys
git add -A && git commit -m "feat: ..." && git push origin main
```

---

## Git workflow

```bash
# All work happens on dev
git checkout dev

# When ready to ship
git push origin dev
git checkout main
git merge dev
git push origin main
git checkout dev
```

---

## Project scripts

```bash
pnpm dev          # next dev (starts on :3000)
pnpm build        # prisma generate + next build
pnpm start        # next start (after build)
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint src/
pnpm db:push      # push schema to local DB (no migration files)
pnpm db:migrate   # create + apply a named migration
pnpm db:seed      # run prisma/seed.ts
pnpm db:studio    # open Prisma Studio at :5555
```

> All `db:*` scripts use `dotenv-cli` to load `.env` automatically — Prisma 7 no longer reads `.env` for CLI commands.

---

## Architecture

Layered, strict separation of concerns. Data flows one direction only.

```
UI (Server / Client Components)
        ↓ call
Server Actions  src/actions/*
        ↓ call
Services        src/services/*
        ↓ call
Repositories    src/repositories/*
        ↓ call
Prisma          src/lib/prisma.ts
```

| Layer               | Responsibility                                                  |
| ------------------- | --------------------------------------------------------------- |
| `src/app/`          | Routes, layouts, RSC data fetching, UI                          |
| `src/components/`   | Reusable UI primitives (`ui/`), shared widgets, charts          |
| `src/actions/`      | `"use server"` entry points returning `ActionResult<T>`         |
| `src/services/`     | Business logic, validation, orchestration                       |
| `src/repositories/` | Prisma queries — **only place that touches the DB**             |
| `src/schemas/`      | Zod 4 schemas (single source of truth for shapes)               |
| `src/lib/`          | `prisma`, `result`, `errors`, `format`, `currency`, `constants` |
| `src/stores/`       | Zustand UI-only state (sidebar collapse, etc.)                  |
| `src/auth/`         | NextAuth v5 wiring                                              |
| `src/generated/`    | Prisma 7 generated client (gitignored — rebuilt on `pnpm build`)|
| `prisma.config.ts`  | Prisma 7 datasource config (DB URL for CLI tools)               |
| `src/proxy.ts`      | Next.js 16 middleware (auth guard, route protection)            |

### Hard rules

- Strict TypeScript. No `any`, no `as any`.
- Every server action returns `{ success: true; data: T } | { success: false; error: string }` — never throws to the client.
- Every form validates via Zod on both client (`zodResolver`) and server (inside the service).
- All monetary values stored as `Decimal`. Rendered through `<Currency />`.
- All dates rendered through `formatDate` / `formatDateTime` / `formatRelative`.
- Mutations call `revalidatePath` inside the action — no client-side cache layer.
- Constants live in `src/lib/constants.ts`. No magic strings.
- Repositories never imported outside services/RSC pages. Services never imported outside actions/RSC pages.

---

## Feature map

| Module                   | Route                                  |
| ------------------------ | -------------------------------------- |
| Global dashboard         | `/`                                    |
| Consolidated financials  | `/financials`                          |
| Hustles list             | `/hustles`                             |
| Hustle overview          | `/hustles/[id]`                        |
| Research notes           | `/hustles/[id]/research`               |
| Cost sheet + margin calc | `/hustles/[id]/cost-sheet`             |
| Suppliers                | `/hustles/[id]/suppliers`              |
| Inventory                | `/hustles/[id]/inventory`              |
| Orders                   | `/hustles/[id]/orders`                 |
| Order detail             | `/hustles/[id]/orders/[orderId]`       |
| Customers                | `/hustles/[id]/customers`              |
| Customer detail          | `/hustles/[id]/customers/[customerId]` |
| Per-hustle financials    | `/hustles/[id]/financials`             |
| Tasks (list + kanban)    | `/hustles/[id]/tasks`                  |
| Settings + danger zone   | `/hustles/[id]/settings`               |
| Order tracking (public)  | `/track/[orderId]`                     |
| Order lookup (public)    | `/track`                               |
| Setup (first boot only)  | `/setup`                               |
| Login                    | `/login`                               |

---

## Public API

All public endpoints live under `/api/public/`. No session required — authenticated via `x-api-key` header (except the lookup endpoint).

Get a hustle's API key from: **Settings → API Key → Generate**.

### POST `/api/public/orders`

Create an order from an external website.

**Header:** `x-api-key: hsk_...`

**Body:**

```json
{
  "customerName": "Aisha Khan",
  "items": [
    {
      "name": "Nikah Invitation Set",
      "quantity": 50,
      "unitPrice": 1200,
      "description": "Gold foil, A5"
    }
  ],
  "shippingCost": 200,
  "discount": 0,
  "amountPaid": 0,
  "paymentMethod": "BANK_TRANSFER",
  "notes": "Deliver by June 10",
  "dueDate": "2026-06-10",
  "customizations": {
    "Bride": "Aisha",
    "Groom": "Bilal",
    "Date": "15 June 2026"
  }
}
```

`paymentMethod` options: `CASH` · `BANK_TRANSFER` · `CARD` · `EASYPAISA` · `JAZZCASH` · `OTHER`

**Response `201`:**

```json
{
  "orderId": "clx...",
  "trackUrl": "https://your-domain.com/track/clx..."
}
```

Show `trackUrl` to the customer after checkout so they can track their order.

---

### GET `/api/public/orders/lookup`

Let a customer re-find their tracking link by order number + name. No API key needed — public.

**Query params:** `orderNumber=ORD-0001&customerName=Aisha`

**Response `200`:**

```json
{
  "orderId": "clx...",
  "trackUrl": "https://your-domain.com/track/clx..."
}
```

**Response `404`:** `{ "error": "Order not found." }`

---

### Order tracking page

`/track/[orderId]` — public, no auth. Shows live order status with the hustle's brand color and name applied. Includes a **Copy tracking link** button and a **Look up another order** link to `/track`.

**To theme the tracking page for your website:** go to Hustles → [your hustle] → Settings → General → set **Website URL**. The tracking page will then show your brand's color, name, and a back link to your site.

---

## Environment variables

| Variable                | Required | Description                                                          |
| ----------------------- | -------- | -------------------------------------------------------------------- |
| `DATABASE_URL`          | yes      | Pooled Postgres connection string (used by the app at runtime).      |
| `DATABASE_URL_UNPOOLED` | yes      | Direct Postgres connection string (used by Prisma CLI for migrations). |
| `AUTH_SECRET`           | yes      | `openssl rand -base64 32`. JWT signing key for NextAuth.             |
| `AUTH_TRUST_HOST`       | yes      | Set `true` on Vercel / behind a proxy.                               |
| `NEXTAUTH_URL`          | optional | Public URL. Helps in some preview environments.                      |

---

## Troubleshooting

### `P2022: column does not exist` on Vercel after a schema change

You changed `prisma/schema.prisma` and deployed, but forgot to run `db push` against the production DB. Fix:

```bash
DATABASE_URL_UNPOOLED="<direct neon url>" npx prisma db push
```

Then redeploy (or it'll auto-recover on the next request).

---

### `Error: Can't reach database server`

Postgres isn't running.

- Local: `docker compose up -d`
- Production: check the Neon dashboard — the DB may have gone cold. First request wakes it.

---

### `Authentication required` on `git push`

GitHub no longer accepts passwords. Use a [personal access token](https://github.com/settings/tokens) or run `gh auth login`.

---

### `Auth.js` JWT decryption errors after redeploy

Happens when `AUTH_SECRET` changes between deployments. Set it once in Vercel and never rotate without signing everyone out.

---

### `P1001: connection refused` during `db:push` locally

Docker isn't running or the container isn't up. Run `docker compose up -d` and try again.

---

### Prisma client out of sync after schema change

If TypeScript complains about a field that exists in the schema, the client is stale. Regenerate:

```bash
npx prisma generate
```

---

### Pooler connection exhausted on serverless

Use a pooled URL for `DATABASE_URL` (pgBouncer / Neon pooler). Use the direct URL only in `DATABASE_URL_UNPOOLED` for migrations. Never use the direct URL as `DATABASE_URL` in production.

---

### Dark theme charts unreadable

Recharts colors are in `src/components/charts/palette.ts`. Tweak there.

---

### `/account` redirects to homepage after DB reset

Your session cookie has a stale user ID. Clear `authjs.*` cookies in browser devtools and sign back in.

---

## License

MIT. Use, modify, and run as you please.
