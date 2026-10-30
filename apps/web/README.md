# @arquitecto/web

Vite + React site. Reading is open to everyone; signing in (GitHub, through Neon Auth)
only adds saving the reading progress per user.

## Configuration

Copy `.env.example` to `.env` in this folder and set:

| Variable             | Value                                                                |
| -------------------- | -------------------------------------------------------------------- |
| `VITE_NEON_AUTH_URL` | Neon Auth base URL from Neon Console > Auth > Configuration. Public. |

Vite inlines `VITE_*` variables at build time: on Vercel, add `VITE_NEON_AUTH_URL` under
**Settings > Environment Variables** (Production and Preview) and redeploy after changing it.
Without it the site still works for reading; "Continuar con GitHub" shows an error.

## Sign-in

- `/acceso` offers only "Continuar con GitHub" (GitHub is the only provider). The SDK
  (`@neondatabase/auth`, vanilla client) is loaded on demand, outside the main bundle.
- `?returnTo=<path>` brings the visitor back after signing in. Only same-origin paths are
  accepted; absolute URLs, `//host` paths and `/acceso` itself fall back to `/`. The callback sent
  to Neon Auth is `<current origin><returnTo>`.
- The progress API receives `Authorization: Bearer <JWT>` (the Neon Auth session token). A `401`
  shows the signed-out state once; it is not retried.

## Neon Auth setup (owner, once per Neon branch)

1. Neon Console > Auth > OAuth providers: enable GitHub (the site offers no other provider, so
   Google can stay disabled). GitHub always needs your own OAuth app.
2. In the GitHub OAuth app, set the callback URL to `<VITE_NEON_AUTH_URL>/callback/github` (no
   trailing slash before `/callback`).
3. Add every origin the site runs on to the Neon Auth trusted domains
   (https://neon.com/docs/auth/guides/configure-domains), because the `callbackURL` must use a
   trusted domain: the production origin (for example `https://<project>.vercel.app`),
   `http://localhost:5173` for local development and, if used, a wildcard for previews such as
   `https://*-<team>.vercel.app`.

## Checks

```bash
pnpm --filter @arquitecto/web test
pnpm --filter @arquitecto/web build
```

Tests replace only the network boundary of the auth SDK (`src/features/auth/data/auth-client.ts`,
see `src/app/tests/fake-auth-client.ts`); every screen, hook and the progress client run for real.
