# Phase 3e: implement the approved design gaps

Follows odd/tasks/design-polish.md. Direct pushes to main, no PRs. The owner approved the seven Penpot boards ("estan aprobados"). Deploy of the API to Vercel is the last step.

## Specs

- S1: "Clave de escritura" — mobile: the existing bottom sheet holding: title (18/600), help text (14, muted) "Para guardar tu progreso necesitas la clave de escritura. Se guarda solo en este navegador.", label "Clave" (14/500), password input (44px high, radius 10, 1px border, page background, mono 14, padding 12/16), full-width pill button "Guardar y continuar" (41px high, dark fill, light text, 14/500), gap 14. Desktop (from 768px): a centered modal 440px wide, padding 24, radius 16, shadow 0 24px 64px rgb(27 24 20 / 0.18), scrim rgb(27 24 20 / 0.4), same content.
- S2: "Inicio vacío" — when the progress is ready and nothing is read: the continue card shows "Llevas 0 de 182 páginas" (real total), an empty progress bar, the hint "Empieza por Fundamentos; el resto de la ruta sigue el orden de la guía." in place of "Último tema" (12px, faint), and the button "Empezar a leer"; no read marks or filled bars anywhere; the Fundamentos chapter shows a neutral "0 de 7" chip (code background, muted text) instead of the green "Leído" chip (use the real page counts).
- S3: "Menú móvil" — opened from the top bar menu button (the icon becomes an X): a panel directly under the top bar, full width, page background, padding 8px 20px 16px, four 52px rows (Ruta, Servicios, Arquitecturas, Glosario) with 1px dividers between them, text 16/500, the current route 16/600 in the accent colour; a scrim rgb(27 24 20 / 0.35) covers the rest of the page below the bar; clicking the scrim, choosing a link or pressing Escape closes it and returns focus to the menu button.
- S4: "Tablet" (768 to 1099px) — the top bar keeps the mobile pattern (brand left; search, theme and menu icons right; 44px side padding) and the inline nav plus the search field appear only from 1100px; the home page and footer use 44px side padding between 768 and 1099px (200px from 1100px); the reading page keeps a single column of at most 680px centered with 44px side padding, with "En esta página" collapsible as on mobile, no sidebar or TOC until 1100px, and the bottom action bar uses 44px side padding; card grids and chapter rows follow the 680px column (right-hand stats stay at the right edge).
- S5: Accessibility per AGENTS.md (names, focus management, Escape, live regions); all colours and radii from tokens (a literal 16px is allowed for the modal radius, there is no token); dark theme must keep working.

## Tasks

- [x] T1 (S1) write key dialog
- [x] T2 (S2, S4 home/footer) empty state and home/footer tablet padding
- [x] T3 (S3, S4 top bar/reading) mobile menu and tablet top bar and reading layout

## Log

- L1: "estan aprobados" (the owner approved the seven Penpot boards: Clave de escritura móvil/escritorio, Inicio vacío móvil/escritorio, Menú móvil, Inicio Tablet, Servicio Tablet)
- L2: Built by three parallel workers (T1 dialog, T2 empty state + home/footer, T3 menu + top bar + reading); T2 was first rejected for overlapping T1 surfaces and relaunched with narrower ones. Parent verification: 403 web tests, lint, format, tsc, build; real Chrome against the dev server and the real API with no reads: breakpoints (home 44px at 768-1099, 200px from 1100; top bar burger below 1100), mobile menu (panel, rows, active colour, Escape and focus return, scrim, light and dark colours), reading column 680px and collapsible TOC, write key dialog (modal 440px at 768, sheet at 500, focus, Escape), empty state at 1280. Extra: exam-map and glossary had 200/280px padding from 768px; now 44px until 1100px. Differences from the Penpot designs: dialog button 43px high (41), phone sheet scrim stays rgba(0,0,0,.4) (design 27,24,20 at .35), top-bar icon swap confirmed by label only. Not checked: widths below 500, Safari, the empty state at 768 and 500, light theme of the '0 de 7' chip. The Penpot boards were approved in their drawn form; the worker built the Fundamentos chip because no chip existed.
