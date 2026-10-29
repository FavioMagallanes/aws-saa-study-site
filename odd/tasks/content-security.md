# Content phase 2: security topics S1-S12

Writes the 12 `topic` pages of the category Seguridad (page orders 8 to 19). Same rules and process as odd/tasks/content-fundamentals.md.

## Specs

- S1: "Content ONLY from the official exam guide (SAA-C03, Spanish) and docs.aws.amazon.com", in my own words, Spanish, service names in English.
- S2: Each page addresses every bullet in its `covers`; ends with "## Fuentes oficiales"; claims re-read against the fetched sources before committing.
- S3: "lo veo bien, continua" — the owner approved the tone of the 7 Fundamentos pages; keep the same structure.

## Tasks

- [x] S1 IAM: usuarios, grupos, roles, políticas y MFA (1.1-k2, k4, s1, s2)
- [x] S2 Roles, AWS STS y acceso entre cuentas (1.1-k1, s3)
- [x] S3 Federación de identidades y servicios de directorio (1.1-k2, s6)
- [x] S4 Estrategia de varias cuentas: Organizations, SCP y Control Tower (1.1-k1, s4)
- [x] S5 Políticas basadas en recursos (1.1-s5)
- [x] S6 Seguridad de la VPC (1.2-k3, s1, s2)
- [x] S7 Puntos de enlace de VPC y PrivateLink (1.2-k2, 3.5-k5)
- [x] S8 Amenazas externas: DDoS e inyección de código (1.2-k4, k6, s3)
- [x] S9 Secretos y credenciales de aplicaciones (1.2-k1)
- [x] S10 Cifrado en reposo y en tránsito, claves y certificados (1.3-k4, s2, s3, s4, s7)
- [x] S11 Gobernanza, clasificación, retención y cumplimiento de datos (1.3-k1, k3, s1, s6, 4.3-k4)
- [x] S12 Copias de seguridad y replicación de datos (1.3-k2, s5, 2.2-k11, s5, 4.3-s1)

## Log

- L1: "lo veo bien, continua"
- L2: All 12 pages written. Per page: fetched docs, own-words Spanish, claims re-read against the sources (several statements softened or removed), `node scripts/check-sources.mjs` (92 URLs answer), render test for every written page. One process slip: on S9 I marked a fix as done when its script had failed; found it on the next step, fixed it, and added a test that forbids Markdown tables. Limits: wording is mine and needs the owner's review.
