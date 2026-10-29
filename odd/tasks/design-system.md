# Design system and layout (phase 2)

Implements the approved Penpot design (file "Nuevo Archivo 9") in apps/web. Follows AGENTS.md and odd/tasks/foundation.md.
Direct pushes to main, no PRs (Engram: aws-saa-study-site/git-workflow).

## Specs

- S1: "respetar el diseño de penpot tener un disign systeme o theme" — components match the 15 Penpot components, light and dark.
- S2: "css modules con BEM" — one `*.module.css` per component, BEM classes (block, block__element, block--modifier).
- S3: "tampoco quiero datos mockeados por todos lados" — screens render the real 182 MDX pages and the real exam guide; no fake data.
- S4: "quiero una app organizada" — feature-based: generic primitives in `src/shared/ui`, reading components in `src/features/reading`, glossary in `src/features/glossary`, layout in `src/app/layout`.
- S5: Accessibility per AGENTS.md: semantic HTML, keyboard, visible focus, accessible names, reduced motion.
- S6: Penpot fonts: Literata (headings and body), "Inter Tight" (UI), IBM Plex Mono. Penpot uses Inter Tight, not Inter (the brief said Inter); installing it needs user approval.
- S7: Logic (progress, search, abbreviations behavior) comes in phase 3; phase 2 is static layout over real content.

## Component specs read from Penpot (light values; dark swap tokens)

Button: pill r=99, pad 10/16, gap 8, Inter Tight 14/500. Variants: primary (bg text, fg bg, arrow-right), secondary (1px border), read (ok-soft bg, ok fg, check).
IconButton: 36x36, r=10, 1px border, icon 18 muted. Icons: search, moon/sun, menu, x.
Link: Inter Tight 14/500, gap 6, icon 15. Variants: next (accent, arrow-right), previous (muted, arrow-left), more (accent, chevron-right).
Chip: pill, pad 7/12, Inter Tight 13/500; default surface+border; read ok-soft with check 14.
ProgressBar: 220x6 pill, track border color, fill ok.
ExamTasks ("En el examen"): 1px border r=10 pad 14/18 gap 12; label 11/600 ls .8 uppercase muted; task pills code bg pad 4/10, 13/500.
ConnectionCard: surface, border, r=12, pad 18, gap 6; relation 11/600 ls .8 accent; service Literata 18/600; description Literata 15/1.55 muted.
DecisionBox: r=12 pad 20 gap 10; use=ok-soft/ok, alternative=accent-soft/accent; title 12/600 ls .8; list Literata 16/1.7.
DiagramNode: r=10 pad 12/8 column center; default bg+border / highlighted accent-soft + accent border; name 13/600, role 11/400 muted.
OfficialSource: column pad 12/0; title Inter Tight 15/500 + arrow-up-right 15; url IBM Plex Mono 12 faint.
Abbr (Sigla card): surface border r=12 pad 16 gap 6; code Plex Mono 13/500 accent; name Inter Tight 15/600; definition 13/1.5 muted; link "Ver en el glosario".
BottomSheet: r=20 top, pad 12/24/36, handle 40x4, header code + close IconButton, name 18/600, definition 15/1.55.
TopBar mobile 390 (pad 14/20, brand Literata 18/600 + SAA-C03 tag Plex Mono 11 r=6, actions search/theme/menu), BottomBar mobile (pad 12/20, Button secondary "Marcar como leído" + Link next).
TopBar desktop 1440 (pad 20/80, brand Literata 20/600 + SAA-C03 tag, nav Ruta/Servicios/Arquitecturas/Glosario gap 32 active=text color, search field 300 with ⌘K hint, theme IconButton), 1px divider.

## Tasks

- [x] T1 (S1,S2,S5) Primitives in shared/ui: Button, IconButton, Link, Chip, ProgressBar + cx helper
- [x] T2 (S1,S4) Reading components: ExamTasks, ConnectionCard, DecisionBox, DiagramNode, OfficialSource
- [ ] T3 (S1,S5) Glossary: Abbr card + BottomSheet (static)
- [ ] T4 (S1,S4) Navigation: TopBar desktop/mobile, BottomBar mobile
- [ ] T5 (S3,S4) App shell and routes: sidebar 240 / column 680 / TOC 220, route for each real page
- [ ] T6 (S3) Screens: Inicio, Mapa del examen, Página de lectura, Glosario, Búsqueda (layout only)

## Log

- L1: "ya abrí docker desktop..." / "ok continua, este es el repo ... todo a main siempre, no armes prs"
- L2: "si" (start phase 2: design system and layout)
