# Phase 4: make the repository ready to deploy the API on Vercel

Follows odd/tasks/design-gaps.md. Direct pushes to main, no PRs. The owner's order was "con el diseño, el deploy al final". The stack decision (Engram `aws-saa-study-site/stack`) already approved Vercel hosting for the web and a Neon Postgres for the API. The actual provisioning (Vercel project, Neon project, secrets) needs the owner's accounts and is NOT part of this task.

## Specs

- S1: One Vercel project serves the Vite web app and the Express API on the same origin: requests to /api/* reach the Express app as a Vercel Function and every other path falls back to index.html (the existing rewrite must keep working).
- S2: Configuration only through environment variables: DATABASE_URL (Neon pooled connection string) and WRITE_KEY; no secret in the repository; the local development setup (docker compose Postgres, `pnpm dev`) keeps working unchanged.
- S3: The database connection must be safe for serverless (no unbounded connections per invocation: a small pool and reuse across invocations; SSL as Neon requires, configurable so local Postgres without SSL still works).
- S4: A documented, repeatable way to apply the Drizzle migrations to the Neon database (`db:migrate` with the Neon DATABASE_URL) and the exact steps for the owner to deploy (create Neon project, set the two variables in Vercel, import the repository, first deploy, check GET /api/progress, enter the write key in the app) in README.md.
- S5: Tests cover the exported handler through the public interface (GET /api/progress and a rejected write without the key leaving the data unchanged) against the existing test Postgres; nothing is mocked.

## Tasks

- [x] T1 (S1-S5) serverless entry for the Express app, vercel.json, SSL/pool handling, migration instructions, README deploy section, tests
- [x] T2 (S1) first deploy crashed at load (ERR_MODULE_NOT_FOUND for `@arquitecto/contracts/src/progress/progress.ts`): the function now loads compiled contracts JavaScript

## Log

- L1: "con el diseño, el deploy al final" (design is done; now prepare the deploy). Provisioning stays with the owner.
- L2: Repository prepared by a worker, reviewed by the parent (lint, format, typecheck, 28 API tests, 403 web tests, web build pass; plain Node loaded api/index.ts and answered GET 200 and PUT without key 401). NOT deployed: still unverified until a real deploy are how Vercel compiles the TypeScript files and the contracts package (likely fixes: a pre-built JS entry, or contracts publishing JS), whether the Express app sees the original /api path after the rewrite, whether api/tsconfig.json is used, and TLS to Neon with channel_binding=require. sslmode prefer/allow/no-verify are now rejected. Provisioning (Neon, Vercel, secrets) belongs to the owner; steps are in README.md.
- L3: First deploy (commit 706c099, runtime nodejs26.x): every /api/\* request failed with ERR_MODULE_NOT_FOUND for `apps/api/node_modules/@arquitecto/contracts/src/progress/progress.ts`. Cause (confirmed by running @vercel/node 29.0.0's own `build` on a clean copy): the builder traces the contracts `.ts` source, compiles it and renames it to `.js`, while the package `exports` still name the `.ts` file. Fix: the root `vercel-build` script (run by @vercel/node before tracing, per Vercel's "Custom build step for Node.js" docs) compiles the contracts with `tsc` to `packages/contracts/dist`, and the `exports` add a `node` condition pointing there, after a `development` condition that keeps Vite, Vitest and `tsx --conditions=development` on the TypeScript source. Emulated packaging served GET /api/progress 200 and PUT without key 401 on Node 26 and 24. Still unverified until the redeploy: Vercel's real packaging and the /api rewrite path.
