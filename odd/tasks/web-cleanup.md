# Phase 3c: bundle size, generated indexes, cleanup, last page, Penpot alignment

Follows odd/tasks/reading-polish.md. Direct pushes to main, no PRs.

## Specs

- S1: "1. ok hazlo, lazy loading no ayuda?" — the main bundle (1.9 MB, 471 KB gzip) must stop containing every page body; page bodies load lazily on demand. Cause: apps/web/src/features/content/data/load-pages.ts imports the whole MDX modules only to read `meta`, which defeats the lazy import in reading/model/page-content.ts.
- S2: "2. hazlo" — the generated files (search index and the new page-meta index) must regenerate automatically (dev, build and test entry points), and a test must still fail if a committed file is stale.
- S3: "3. ya tengo penpont abierto" — the search dialog and the TOC active state are aligned with the Penpot design.
- S4: "4. borralo" — delete the unused /buscar route and the unused IconLink component (and anything only they used).
- S5: "5. escribe" — write the amazon-elastic-transcoder page (Contenido pendiente. today) from the only official source, the General Reference shut-down services page https://docs.aws.amazon.com/general/latest/gr/elastictranscoder.html (end of support 2025-11-13): say what the service was, that it is closed, and what AWS suggests instead if the docs say so.

## Tasks

- [ ] T1 (S1,S2) page-meta index + lazy page bodies + automatic regeneration of generated indexes
- [ ] T2 (S4) delete the /buscar route and IconLink
- [ ] T3 (S5) amazon-elastic-transcoder page + fix the reading-screen test that used it as the pending fixture
- [ ] T4 (S3) align search dialog and TOC active state with Penpot

## Log

- L1: "1. ok hazlo, lazy loading no ayuda? 2. hazlo 3. ya tengo penpont abierto 4. borralo 5. escribe"
