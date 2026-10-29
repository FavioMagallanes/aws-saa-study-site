# Phase 3b: reading polish (TOC active state, abbreviation help, Cmd+K search)

Follows AGENTS.md, odd/tasks/design-system.md and odd/tasks/progress-logic.md. Direct pushes to main, no PRs. Progress wiring is already done (progress-logic.md); the content is written (181 of 182 pages).

## Specs

- S1: "search (⌘K)" — a search panel opened with Cmd+K / Ctrl+K and from the top bar; results come from the real written pages (title, headings, first paragraph, category), never mocked.
- S2: "abbreviation help (dotted underline → tooltip on desktop, bottom sheet on mobile) + glossary page" — abbreviations in the reading body get the dotted underline and open the existing AbbrCard / BottomSheet components; the 49 entries of apps/web/content/glossary.json are the only source.
- S3: The table of contents highlights the heading currently being read (active state), without layout shift.
- S4: Accessibility per AGENTS.md (names, focus trap and return in the dialog, keyboard navigation of results, live result count, reduced motion).
- S5: MiniSearch is the only dependency allowed (approved in the stack decision); verify the installed version against the registry. No other new dependency.
- S6: Penpot has Búsqueda screens (desktop and mobile) and the abbreviation tooltip and sheet; use them if the Penpot MCP is reachable, otherwise build with existing primitives and flag a design gap.

## Tasks

- [x] T1 (S3,S4) TOC active state (features/reading)
- [x] T2 (S2,S4) Abbreviation help inside the MDX body (features/reading, features/glossary)
- [x] T3 (S1,S4,S5,S6) Cmd+K search: build-time index of written pages, MiniSearch, dialog, top bar trigger (features/search, top bar)

## Log

- L1: "empieza" (start the remaining phase 3 logic after the content is written)
- L2: Built by two parallel workers (T1-T2 reading+glossary, T3 search+top bar), reviewed by the parent. 351 web tests, lint, prettier, tsc pass. Checked in desktop Chrome against the dev server: Cmd+K dialog, results, Enter navigation, KMS abbreviation card with glossary link, TOC active state on scroll. Not checked: mobile bottom sheet and full-screen search, dark theme, focus return, Safari. Design gaps: Penpot not consulted (workers had no MCP access); active-TOC and search dialog styling are mine. Open: the search index JSON must be regenerated with 'pnpm --filter @arquitecto/web search:index' after content edits (a test fails if stale); main bundle is 1.9 MB (471 KB gzip) because load-pages.ts imports whole MDX modules; /buscar route and IconLink are now unused.
