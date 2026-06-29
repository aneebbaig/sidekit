# Contributing to Sidekit

Thanks for your interest in improving Sidekit. This guide covers the workflow and the quality bar for changes.

## Getting started

1. Fork and clone the repository.
2. Install dependencies: `pnpm install`.
3. Copy `.env.example` to `.env` and fill in the values (see the README for details).
4. Start Postgres: `docker compose up -d`.
5. Apply the schema and seed demo data: `pnpm db:push && pnpm db:seed`.
6. Run the app: `pnpm dev`.

## Development workflow

- Branch from `main` using a descriptive name, e.g. `feat/order-export` or `fix/payment-rounding`.
- Keep changes focused. One logical change per pull request.
- Follow the existing architecture: **server actions → services → repositories → Prisma**. Keep business logic in services, data access in repositories, and validation in Zod schemas.

## Before you open a pull request

Run the full local gate — CI runs the same checks:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

All three must pass. Add or update Zod schemas when you change data shapes.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, etc. Keep the subject under 72 characters.

## Reporting bugs and requesting features

Open an issue using the provided templates. For security issues, follow [SECURITY.md](./SECURITY.md) instead of opening a public issue.
