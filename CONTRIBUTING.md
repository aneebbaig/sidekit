# Contributing

## Setup

1. Fork and clone the repo.
2. Run `pnpm install`.
3. Copy `.env.example` to `.env` and fill it in (the README explains each value).
4. Start Postgres with `docker compose up -d`.
5. Run `pnpm db:push` and `pnpm db:seed` to create the schema and some demo data.
6. Run `pnpm dev`.

## How the code is laid out

Requests flow through four layers: server actions call services, services call repositories, repositories talk to Prisma. Validation lives in Zod schemas under `src/schemas`. Keep business logic in services and database queries in repositories so the layers stay separate.

## Before opening a pull request

Run these and make sure they pass. CI runs the same three:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

If you change the shape of any data, update the matching Zod schema.

Keep a pull request to one change. Smaller is easier to review.

## Commits

Use Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`). Keep the first line short.

## Issues

Use the issue templates for bugs and feature ideas. For anything security-related, read [SECURITY.md](./SECURITY.md) first and do not open a public issue.
