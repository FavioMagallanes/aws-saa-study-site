# Phase 3d: design pass (search dialog per Penpot, then design gaps), deploy last

Follows odd/tasks/web-cleanup.md. Direct pushes to main, no PRs.

## Specs

- S1: "con el diseño, el deploy al final" — design work first, the Vercel API deployment is the last step of the project.
- S2: The search dialog follows the Penpot screens "Búsqueda — Escritorio" and "Búsqueda — Móvil" (page Escritorio and Móvil of the open Penpot file): results grouped under the labels "Siglas", "Páginas" and "En el texto" (11px/600, faint, left inset 12px); rows 64px high, radius 10, padding 10/12, gap 14; a 32x32 icon box (radius 8) at the left, title 15/600, a one-line secondary text 13/400 muted; the active row has accentSoft background, an icon box with surface background and an accent corner-down-left enter icon at the right; in the input row an "esc" key chip (radius 6, 1px border, 11/500 faint) on desktop and a "Cancelar" accent text button (14/500) on mobile; footer row with key chips "↑ ↓ navegar", "↵ abrir", "esc cerrar" and the text "Busca en servicios, siglas y texto" (12px faint) on desktop.
- S3: "Siglas" results come from apps/web/content/glossary.json (open /glosario#<id>); "Páginas" are the pages (as today); "En el texto" are h2/h3 headings of written pages, shown as "Page title › Heading", opening /lectura/<pageId>#<heading id> (ids as produced by reading/model/heading-id.ts).
- S4: Keystrokes typed right after the first Cmd+K must not be lost while the lazy dialog chunk loads (preload the chunk when the browser is idle after the app mounts, and keep working if it fails).
- S5: Accessibility as before (combobox/listbox, group labels with role group, live count, focus trap and return).

## Tasks

- [x] T1 (S2,S3,S5) grouped search results and Penpot row/footer/input styling
- [x] T2 (S4) preload the lazy search dialog and keep early keystrokes
- [ ] T3 Design gaps without a Penpot design (write key dialog, empty state, tablet, mobile menu): scope pending the owner's decision

## Log

- L1: "con el diseño, el deploy al final"
- L2: T1-T2 built by a worker, reviewed by the parent: 381 web tests, lint, format, tsc pass; checked in desktop Chrome on the dev server (groups Siglas/Páginas/En el texto for 'rpo', Enter on a heading result opens /lectura/recuperacion-ante-desastres#rto-y-rpo and the h3 is scrolled into view). Added h3 ids (SubsectionHeading) so heading results deep link; the worker found only h2 had ids. Not checked in a browser: mobile layout (Cancelar), dark theme, early typing on a slow load.
- L3: T3 (design gaps) — the owner chose 'Diseño en Penpot y luego código'. Eight boards drawn in the open Penpot file (page Móvil: Clave de escritura, Inicio vacío, Menú móvil, Inicio Tablet, Servicio Tablet; page Escritorio: Clave de escritura, Inicio vacío), built from shape operations only; no visual check (exports stale or timing out). Waiting for the owner's review before any code.
