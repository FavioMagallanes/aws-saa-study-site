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

# Terminal 1: API on :3001 (copy apps/api/.env.example to apps/api/.env first;
# an older .env needs the NEON_AUTH_JWKS_URL line from the example)
pnpm --filter @arquitecto/api db:migrate
pnpm --filter @arquitecto/api dev

# Terminal 2: web on :5173 (proxies /api to the API)
pnpm --filter @arquitecto/web dev
```

Open http://localhost:5173. Reading works without the API; saving progress needs it.

### Saving progress

Reading needs no account. Saving progress needs a sign-in with Google or GitHub through Neon Auth
(Managed Better Auth on the Neon project). Every progress request sends the session's
`access_token` as `Authorization: Bearer <JWT>`; the API checks it against the Neon Auth signing
keys (`NEON_AUTH_JWKS_URL`) and stores progress per user (the token's `sub`). Without a valid
token, `/api/progress` answers `401 {"error":"unauthorized"}`.

## Deploy (Vercel + Neon)

One Vercel project serves both apps from the same origin:

- The web app is built with `pnpm --filter @arquitecto/web build` and served from `apps/web/dist`.
- `api/index.ts` exports the Express app as a Vercel Function. `vercel.json` rewrites `/api/*` to
  that function; every other path falls back to `index.html`.
- `packages/contracts` is written in TypeScript, but the function runs plain JavaScript. Before
  packaging the function, Vercel runs the root `vercel-build` script, which compiles the contracts
  to `packages/contracts/dist` (`pnpm --filter @arquitecto/contracts build`; ignored by Git). Plain
  Node resolves the package to `dist` through the `node` export condition; Vite, Vitest and the API
  scripts (`tsx --conditions=development`) keep using the TypeScript source. To load
  `api/index.ts` with plain Node on your machine, run that build first.

The API reads its configuration only from environment variables:

| Variable             | Value                                                                   |
| -------------------- | ----------------------------------------------------------------------- |
| `DATABASE_URL`       | Neon **pooled** connection string (host ends in `-pooler`).             |
| `NEON_AUTH_JWKS_URL` | `<Neon Auth base URL>/.well-known/jwks.json` (public keys, not secret). |
| `DATABASE_POOL_MAX`  | Optional. Connections per function instance; the default there is `1`.  |

The API accepts only tokens signed with a key from that JWKS using `EdDSA` (the only algorithm
Neon Auth publishes), with a valid `exp` and a non-empty `sub`. Neon Auth documents neither an
issuer nor an audience for its tokens, so the API does not check `iss` or `aud`.

SSL follows the connection string: `sslmode=require` (what Neon gives you), `verify-ca` or
`verify-full` turn on verified TLS; no `sslmode`, as in the local Docker URL, means no TLS.

### First deploy

1. Create a Neon project at https://console.neon.tech. In **Connect**, copy two connection
   strings for the same database: the **pooled** one (connection pooling on, host ends in
   `-pooler`) for Vercel, and the **direct** one (connection pooling off) for migrations.
2. Apply the migrations to Neon from your machine (see below), using the direct string.
3. Import this repository at https://vercel.com/new. Keep the root directory as the repository
   root; `vercel.json` already sets the install command, build command and output directory.
4. Before deploying, add `DATABASE_URL` (pooled string), `NEON_AUTH_JWKS_URL` and the web build
   variable `VITE_NEON_AUTH_URL` (the Neon **Auth base URL**, without `/.well-known/...`) under
   **Settings > Environment Variables** for Production (and Preview if you use it). Vite inlines
   `VITE_NEON_AUTH_URL` at build time: without it the sign-in code is dropped from the build and
   nobody can sign in, so redeploy after adding it.
5. Deploy. If the variables were added after a deploy, redeploy so the function picks them up.
   The build log must show `Running "pnpm run vercel-build"` followed by
   `tsc -p tsconfig.build.json`; without it the function cannot load the contracts.
6. Check the API: open `https://<your-project>.vercel.app/api/progress`. It must answer
   `{"entries":[]}` on a fresh database. Also open a deep link such as
   `https://<your-project>.vercel.app/lectura/amazon-s3` and reload it: the site must load.
7. In the site, sign in and press "Marcar como leído" on any page. The page is marked as read for
   your account only.

### Neon Auth

Neon Auth is enabled on the Neon project (branch `production`); its users live in the
`neon_auth` schema of the same database. Copy the **Auth base URL** from **Neon Console > your
project > branch > Settings > Auth**; the API's `NEON_AUTH_JWKS_URL` is that URL followed by
`/.well-known/jwks.json`. Then, in the same screen:

1. **Trusted domains**: add every origin the site runs on (the Vercel production domain, and
   `http://localhost:5173` for local development). Sign-in redirects back only to these.
2. **OAuth providers**: GitHub needs your own OAuth app, and Google should use your own in
   production (Neon's shared Google credentials are for development only). Create the apps in
   Google Cloud Console and GitHub, register as their redirect/callback URL the one shown in Neon's
   **Add OAuth provider** dialog (`<Auth base URL>/callback/google` and `.../callback/github`), and
   paste each Client ID and Client Secret into Neon.
3. Remove the old `WRITE_KEY` variable from Vercel; the API no longer reads it.

Each Neon branch has its own Auth base URL, so a different branch needs its own JWKS URL, trusted
domains and OAuth credentials.

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

Migration `0001_per_user_progress` adds `read_pages.user_id` with the primary key
`(user_id, page_id)` and deletes the rows of the single-user era, which have no owner. Drizzle
applies a migration only when its `when` in `migrations/meta/_journal.json` is newer than the
latest `created_at` in `drizzle.__drizzle_migrations`, so a hand-inserted row for `0000` must
carry `0000`'s `when` (`1793296802636`) or an older value.

## Checks

```bash
pnpm lint && pnpm format:check && pnpm -r typecheck
pnpm --filter @arquitecto/web test
pnpm --filter @arquitecto/contracts test
pnpm --filter @arquitecto/api test # needs `docker compose up -d --wait`
```

See `AGENTS.md` for conventions and project rules.
