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

You need Node 22+, pnpm and Docker.

```bash
docker compose up -d --wait   # Postgres on localhost:5432
pnpm install

# Terminal 1: API on :3001 (copy apps/api/.env.example to apps/api/.env first)
pnpm --filter @arquitecto/api db:migrate
pnpm --filter @arquitecto/api dev

# Terminal 2: web on :5173 (proxies /api to the API)
pnpm --filter @arquitecto/web dev
```

Open http://localhost:5173. Reading works without the API; saving progress needs it.

### Saving progress

There is no login. The first time you press "Marcar como leído" in a browser, the site asks for the
write key (`WRITE_KEY` in `apps/api/.env`). It is stored only in that browser and sent in the
`x-write-key` header. A wrong key is rejected and forgotten, and you are asked again.

## Checks

```bash
pnpm lint && pnpm format:check && pnpm -r typecheck
pnpm --filter @arquitecto/web test
pnpm --filter @arquitecto/contracts test
pnpm --filter @arquitecto/api test # needs `docker compose up -d --wait`
```

See `AGENTS.md` for conventions and project rules.
