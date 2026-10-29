# Phase 3: reading progress wired to the API

Follows AGENTS.md and odd/tasks/design-system.md. Direct pushes to main, no PRs.
Backend contract (already built): GET /api/progress, PUT/DELETE /api/progress/:pageId with header x-write-key.

## Specs

- S1: "no quiero login en la app" — no accounts; progress is one global record, writes need the write key (option C).
- S2: "tampoco quiero datos mockeados por todos lados" — screens read the real progress from the real API; no fake read state.
- S3: Server state with TanStack Query; Zustand only for UI/client state (the stored write key).
- S4: The site must stay readable when the API is down or the key is missing; show the failure, never a blank screen.
- S5: Marking read/unread is optimistic and rolls back on failure; no duplicate submissions while pending.
- S6: Penpot has the "Marcar como leído" button and the mobile bottom bar; there is no design for entering the write key, so it uses existing primitives (flagged as a design gap).
- S7: Accessibility per AGENTS.md (names, focus, live status).

## Tasks

- [x] P1 (S1,S3) API client with Zod validation + write key store, tests
- [x] P2 (S2,S3,S5) Query hooks: progress list, mark read, mark unread (optimistic)
- [x] P3 (S2,S4) Wire the read set into Inicio, Mapa del examen and Lectura (+ last read title)
- [x] P4 (S5,S6,S7) Mark-as-read button, mobile bottom bar, write key dialog
- [x] P5 (S4) Dev proxy for /api, README, end-to-end check in the browser against the real API

## Log

- L1: "3, y dime como levanto la app localmente" (phase 3, logic) — confirmed as phase 3 of logic, not deployment
- L2: Closed. Verified in a real browser against the real API: wrong key rejected and forgotten, correct key saves, state survives a reload, Inicio shows the count. Not seen in the browser (tests only): toggling back to unread and Mapa del examen with progress. Design gaps left: write key dialog (no Penpot design), Siguiente link in the mobile bar (kept as the pager at the end of the article).
