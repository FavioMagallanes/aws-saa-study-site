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

## Deploy (Vercel + Neon)

One Vercel project serves both apps from the same origin:

- The web app is built with `pnpm --filter @arquitecto/web build` and served from `apps/web/dist`.
- `api/index.ts` exports the Express app as a Vercel Function. `vercel.json` rewrites `/api/*` to
  that function; every other path falls back to `index.html`.

The API reads its configuration only from environment variables:

| Variable            | Value                                                                  |
| ------------------- | ---------------------------------------------------------------------- |
| `DATABASE_URL`      | Neon **pooled** connection string (host ends in `-pooler`).            |
| `WRITE_KEY`         | A long random string (at least 16 characters). It is never committed.  |
| `DATABASE_POOL_MAX` | Optional. Connections per function instance; the default there is `1`. |

SSL follows the connection string: `sslmode=require` (what Neon gives you), `verify-ca` or
`verify-full` turn on verified TLS; no `sslmode`, as in the local Docker URL, means no TLS.

### First deploy

1. Create a Neon project at https://console.neon.tech. In **Connect**, copy two connection
   strings for the same database: the **pooled** one (connection pooling on, host ends in
   `-pooler`) for Vercel, and the **direct** one (connection pooling off) for migrations.
2. Apply the migrations to Neon from your machine (see below), using the direct string.
3. Import this repository at https://vercel.com/new. Keep the root directory as the repository
   root; `vercel.json` already sets the install command, build command and output directory.
4. Before deploying, add `DATABASE_URL` (pooled string) and `WRITE_KEY` under
   **Settings > Environment Variables** for Production (and Preview if you use it).
5. Deploy. If the variables were added after a deploy, redeploy so the function picks them up.
6. Check the API: open `https://<your-project>.vercel.app/api/progress`. It must answer
   `{"entries":[]}` on a fresh database. Also open a deep link such as
   `https://<your-project>.vercel.app/lectura/amazon-s3` and reload it: the site must load.
7. In the site, press "Marcar como leído" on any page and enter the same `WRITE_KEY`. The page
   is marked as read, and `/api/progress` now lists it.

### Migrations against Neon

`db:migrate` reads `DATABASE_URL` from the environment, and a variable already set in the
environment wins over `apps/api/.env`. Paste the **direct** Neon string at a hidden prompt so it
is not written to a file or to your shell history:

```bash
read -rs DATABASE_URL && export DATABASE_URL   # paste the direct string, then Enter
pnpm --filter @arquitecto/api db:migrate
unset DATABASE_URL
```

Run it again after every new migration in `apps/api/migrations`, before deploying the code that
needs it.

## Checks

```bash
pnpm lint && pnpm format:check && pnpm -r typecheck
pnpm --filter @arquitecto/web test
pnpm --filter @arquitecto/contracts test
pnpm --filter @arquitecto/api test # needs `docker compose up -d --wait`
```

See `AGENTS.md` for conventions and project rules.
