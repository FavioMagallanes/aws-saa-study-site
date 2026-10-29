# Arquitecto

Personal reading-only study site for the AWS Certified Solutions Architect - Associate (SAA-C03) exam.

## Structure

| Path                 | Purpose                                                 |
| -------------------- | ------------------------------------------------------- |
| `apps/web`           | Vite + React site. Content lives in `apps/web/content`. |
| `apps/api`           | Express API that stores reading progress in Postgres.   |
| `packages/contracts` | Zod schemas shared by web and API.                      |
| `odd/tasks`          | Feature task documents.                                 |

## Getting started

```bash
pnpm install
pnpm --filter @arquitecto/web dev
```

The API needs Postgres. Start it with `docker compose up -d --wait`, then copy `apps/api/.env.example` to `apps/api/.env`, set `DATABASE_URL` and `WRITE_KEY`, then run `pnpm --filter @arquitecto/api db:migrate` and `pnpm --filter @arquitecto/api dev`.

## Checks

```bash
pnpm lint && pnpm format:check && pnpm -r typecheck
pnpm --filter @arquitecto/web test
pnpm --filter @arquitecto/contracts test
pnpm --filter @arquitecto/api test # needs `docker compose up -d --wait`
```

See `AGENTS.md` for conventions and project rules.
