# Content phase 4: performance topics P1-P17 (orders 38-54)

Writes the 17 `topic` pages of the category Rendimiento (page orders 38 to 54). Same rules and process as odd/tasks/content-resilience.md.

## Specs

- S1: "Content ONLY from the official exam guide (SAA-C03, Spanish) and docs.aws.amazon.com", in my own words, Spanish, service names in English.
- S2: Each page addresses every bullet in its `covers`; ends with "## Fuentes oficiales"; claims re-read against the fetched sources before committing.
- S3: No Markdown tables in MDX pages; no links outside docs.aws.amazon.com.
- S4: Same structure as apps/web/content/pages/topics/secretos-y-credenciales-de-aplicaciones.mdx.

## Tasks

Writer 1 takes T1-T6, writer 2 T7-T12, writer 3 T13-T17; the parent commits one page per commit.

- [x] T1 elegir-almacenamiento-por-rendimiento-y-escala (2.1-s6, 2.2-k11, 3.1-k2, 3.1-s1, 3.1-s2, 4.1-s10, 4.1-k4, 4.1-s2, 4.1-s4,)
- [x] T2 almacenamiento-hibrido (3.1-k1, 4.1-k8)
- [x] T3 elegir-instancias-familias-tipos-y-tamanos (2.1-s6, 3.2-s3, 3.2-s4, 4.2-k7, 4.2-s5, 4.2-s6)
- [x] T4 escalado-automatico-metricas-y-politicas (2.1-s2, 3.2-k4, 3.2-s2, 4.2-k9)
- [x] T5 computo-distribuido-y-en-la-periferia (3.2-k2, 4.2-k5, 4.2-k6)
- [x] T6 elegir-base-de-datos-tipo-y-motor (2.1-s6, 3.3-k3, 3.3-k6, 3.3-k8, 3.3-s2, 3.3-s3, 3.3-s4, 4.3-k7, 4.3-s2,)
- [x] T7 replicas-de-lectura-proxies-y-conexiones (2.1-k15, 2.2-k9, 3.3-k5, 3.3-k7, 3.3-s1, 4.3-k6, 4.3-k8)
- [x] T8 capacidad-de-bases-de-datos (3.3-k4, 4.3-k5)
- [x] T9 diseno-de-red-subredes-enrutamiento-y-direccionamiento-ip (1.2-s2, 2.1-s6, 3.4-k2, 3.4-s2)
- [x] T10 topologias-de-red-global-hibrida-y-de-varios-niveles (3.4-s1, 3.4-s2, 3.4-s3)
- [x] T11 periferia-cloudfront-frente-a-global-accelerator (2.1-k7, 3.4-k1, 4.4-s4)
- [x] T12 conectividad-hibrida-vpn-direct-connect-y-privatelink (1.2-s4, 3.4-k4, 4.4-k5, 4.4-s2, 4.4-s7)
- [x] T13 lagos-de-datos (3.5-s1)
- [x] T14 ingesta-y-streaming-de-datos (3.5-k2, 3.5-k5, 3.5-k6, 3.5-k7, 3.5-s2, 3.5-s6)
- [x] T15 transformacion-y-formatos-de-datos (3.5-k4, 3.5-s5, 3.5-s7)
- [x] T16 analisis-y-visualizacion (3.5-k1, 3.5-s4)
- [x] T17 transferencia-y-migracion-de-datos (3.3-k6, 3.5-k3, 3.5-k6, 3.5-s3, 4.1-k8, 4.1-s3, 4.1-s7, 4.3-k7, 4.3-s5,)

## Log

- L1: "si, sigue usando sub agentes de ser necesari" (continue with performance topics P1-P17)
- L2: 17 pages written by 3 parallel writers (T1-T6, T7-T12, T13-T17), reviewed by the parent. Checks: 172 web tests, lint, prettier, check-sources (338 URLs). Limits: wording is mine and needs the owner's review; MySQL vs PostgreSQL has no direct AWS comparison (page says so); Snowball Edge noted as closed to new customers; VMware Cloud on AWS has no docs page.
