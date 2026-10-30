# Phase 5: the Servicios and Arquitecturas index pages

Follows odd/tasks/design-gaps.md. Direct pushes to main, no PRs. The owner approved the two Penpot boards ("diseño aprobado"): 'Servicios — Escritorio' and 'Arquitecturas — Escritorio' (page Escritorio).

## Specs

- S1: "Las pestañas Servicios y Arquitecturas están vacías" — the routes /servicios and /arquitecturas (today a bare h1 in apps/web/src/routes) show real content built from the real page metadata (no hard-coded lists).
- S2: Servicios: eyebrow "SERVICIOS" (12/600 accent), title "Los servicios que cubre la guía" (Literata 44/600), intro "Los 118 servicios que la guía declara dentro del alcance, agrupados en sus 16 categorías, como en la guía oficial. Cada nombre abre su página; las que ya leíste llevan una marca." (the 118 and 16 come from the data, not literals); a grid of the 16 guide categories (3 columns from 1100px, 2 columns from 768px, 1 column below); each category block: its name in uppercase (12/600 muted), "N de M leídas" (12 faint; singular "leída" when M is 1), a 1px divider and the services as links to /lectura/<id>, in the order of the 'Servicios' list of the design (alphabetical by title); read services show the same read mark the home service index uses.
- S3: Arquitecturas: eyebrow "ARQUITECTURAS", title "Los temas que conectan los servicios", intro "Los 57 temas transversales, ordenados por los cuatro dominios del examen. Cada uno explica qué problema resuelve y cuándo elegir una opción u otra." (57 from the data); four sections for the exam domains with the weights and titles already in the exam guide data (Dominio 1 Diseño de arquitecturas seguras 30 %, Dominio 2 Diseño de arquitecturas resistentes 26 %, Dominio 3 Diseño de arquitecturas de alto rendimiento 24 %, Dominio 4 Diseño de arquitecturas con optimización de costos 20 %): eyebrow "DOMINIO N" (12/600 accent), title (Literata 28/600), "Peso N %" at the right (14/500 muted), a progress bar (the shared ProgressBar) with "N de M leídos", a divider and the topic pages of that domain (page kind 'topic', category Seguridad, Resiliencia, Rendimiento, Costos) as links to /lectura/<id> in guide order (page `order`), in two columns from 768px and one below; read topics show the read mark. The seven Fundamentos pages are not listed here.
- S4: Progress comes from the existing progress hooks; while it loads or fails the pages show every item unmarked and the existing progress notice, never a blank screen (same behavior as the home page).
- S5: The top bar already links both tabs; the active tab must be marked (aria-current) as for the other tabs. Home links ('Ver las N categorías', '+N más') keep pointing to /servicios and keep working; the home text 'Ver las 13 categorías' must show the real number of categories (16) if it is hard-coded.
- S6: Accessibility per AGENTS.md (headings hierarchy, lists as lists, link names, read mark announced), tokens only, dark theme works.

## Tasks

- [ ] T1 (S1-S6) Servicios page
- [ ] T2 (S1, S3-S6) Arquitecturas page

## Log

- L1: "diseño aprobado" (both desktop boards approved; mobile = one column, tablet = two columns for Servicios and Arquitecturas lists as written in S2 and S3)
