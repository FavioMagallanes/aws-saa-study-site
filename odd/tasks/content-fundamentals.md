# Content phase 1: the 7 Fundamentos pages

Writes the bodies of the 7 `fundamental` pages in apps/web/content/pages/fundamentals. Follows AGENTS.md. Direct pushes to main.

## Specs

- S1: "Content ONLY from the official exam guide (SAA-C03, Spanish) and docs.aws.amazon.com" — every claim comes from those sources.
- S2: "Explanatory own-words content (not a docs copy): what each service is, problem it solves, how services connect, when to use / better alternative" — written in my own words, never pasted.
- S3: "Spanish content (AWS service names in English)".
- S4: Each page ends with official sources (OfficialSource, docs.aws.amazon.com only) and covers the bullets declared in its `covers`.
- S5: "HARD REQUIREMENT: no exam topic may be left out" — body text must address every bullet the page covers.
- S6: Penpot article structure: lead paragraph, "Qué problema resuelve", "Conceptos clave" (h3 per concept), connections as cards, decision boxes, "Fuentes oficiales".

## Tasks

- [x] C0 (S6) CardGrid MDX component + mapping; content integrity test (written pages need sources)
- [x] C1 (S1-S5) F1 Infraestructura global de AWS
- [x] C2 (S1-S5) F2 Modelo de responsabilidad compartida
- [x] C3 (S1-S5) F3 Marco AWS Well-Architected
- [x] C4 (S1-S5) F4 Fundamentos de redes
- [x] C5 (S1-S5) F5 Tipos de almacenamiento
- [x] C6 (S1-S5) F6 Tipos de bases de datos
- [x] C7 (S1-S5) F7 Modelos de cómputo

## Log

- L1: "si continua" (after proposing to start the content with the 7 Fundamentos pages, verified against AWS docs)
- L2: All 7 pages written. Verified per page: claims re-read against the fetched docs (several statements softened or removed when they went beyond the sources), `node scripts/check-sources.mjs` (39 URLs answer), render test for every written page, and a browser pass over the 7 pages (sections, TOC, sources, zero console errors). Limits: definitions and explanations are my own wording, so they need the owner's review; the domain-to-pillar mapping in F3 is an observation, not a documented statement.
