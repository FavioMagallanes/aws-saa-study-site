# Foundation: monorepo, tooling, content skeleton

Phase 1 of aws-saa-study-site ("Arquitecto"). Stack in Engram topic aws-saa-study-site/stack.
Follow AGENTS.md. No commits unless the user asks.

## Specs

- S1: Monorepo with pnpm workspaces: apps/web (Vite + React + TS), apps/api (Express), packages/contracts (Zod).
- S2: TS strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes; eslint, prettier, vitest.
- S3: "quiero una app organizada" — feature-based src/features, kebab-case files, named exports.
- S4: "tampoco quiero datos mockeados por todos lados" — real content skeletons (182 MDX from plan.json), real API + local Postgres.
- S5: Backend only for reading progress. "no quiero login en la app" — option C: single global progress, writes need a secret write key from env.
- S6: Styles: CSS Modules + BEM, Penpot tokens as CSS variables (data-theme light/dark).
- S7: Routing: TanStack Router. Hosting: Vercel (SPA rewrite).
- S8: Build-time coverage check: every one of the 189 guide bullets maps to >=1 page.

## Tasks

- [x] T1 (S1,S2,S3) Scaffold workspace, configs, shared tsconfig, lint/format/test scripts — route: inline
- [x] T2 (S1,S7) apps/web Vite+React+TanStack Router+Query+Zustand running — inline
- [x] T3 (S1,S5) apps/api Express+Drizzle, progress table (10 integration tests against real Postgres pass) — inline
- [x] T4 (S1,S5) packages/contracts Zod schemas shared — inline
- [x] T5 (S4,S8) Move plan.json into repo, generate 182 MDX skeletons + coverage validator — inline
- [x] T6 (S6) tokens.css from Penpot + theme switch base — inline
- [x] T7 (S7) vercel.json, README, AGENTS.md project section — inline

## Log

- L1: "retoma el proyecto aws-saa-study-site desde Engram y definamos el stack"
- L2: "no quiero login en la app, tampoco quiero datos mockeados por todos lados, quiero una app organizada"
- L3: "c" (write-key option) ; approved: Postgres on Neon + Drizzle, dependency list with Zustand.
