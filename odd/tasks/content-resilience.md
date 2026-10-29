# Content phase 3: resilience topics R1-R19 (orders 20-37)

Writes the 18 `topic` pages of the category Resiliencia (page orders 20 to 37; there is no R6). Same rules and process as odd/tasks/content-security.md.

## Specs

- S1: "Content ONLY from the official exam guide (SAA-C03, Spanish) and docs.aws.amazon.com", in my own words, Spanish, service names in English.
- S2: Each page addresses every bullet in its `covers`; ends with "## Fuentes oficiales"; claims re-read against the fetched sources before committing.
- S3: No Markdown tables in MDX pages; no links outside docs.aws.amazon.com.
- S4: Same structure as apps/web/content/pages/topics/secretos-y-credenciales-de-aplicaciones.mdx (meta block unchanged, intro, Qué problema resuelve, Conceptos clave, Cómo se conecta, Cómo elegir, Fuentes oficiales).

## Tasks

Writer 1 takes T1-T6, writer 2 T7-T12, writer 3 T13-T18; the parent commits one page per commit.

- [ ] T1 arquitecturas-de-varios-niveles (2.1-k10, 2.1-s1)
- [ ] T2 microservicios-y-cargas-sin-estado (2.1-k4, 2.1-s1)
- [ ] T3 arquitecturas-basadas-en-eventos (2.1-k5, s1, s3, 3.2-s1)
- [ ] T4 colas-mensajeria-y-publicacion-suscripcion (2.1-k11, s3, 3.2-k3, s1)
- [ ] T5 orquestacion-de-flujos-de-trabajo (2.1-k16)
- [ ] T6 estrategias-de-cache (2.1-k3, 3.3-k2, s5, 4.3-k3)
- [ ] T7 escalado-horizontal-y-vertical (2.1-k6, s2, 4.2-s2)
- [ ] T8 contenedores-cuando-usarlos-y-como-migrar (2.1-k14, k8, s4, 3.2-k6)
- [ ] T9 patrones-sin-servidor (2.1-k12, s5, 3.2-k5)
- [ ] T10 balanceo-de-carga-alb-nlb-y-gwlb (2.1-k9, 2.2-k8, 3.4-k3, s4, 4.2-s1, 4.4-k3)
- [ ] T11 alta-disponibilidad-multi-az-y-multirregion (2.2-k1, s2, s4)
- [ ] T12 recuperacion-ante-desastres (1.3-k2, 2.2-k4, s6)
- [ ] T13 conmutacion-por-error-y-patrones-distribuidos (2.2-k5, k6, s4)
- [ ] T14 infraestructura-inmutable-y-automatizacion (2.2-k7, s1)
- [ ] T15 service-quotas-y-limitacion (2.2-k10, 4.4-s6)
- [ ] T16 observabilidad-y-metricas-de-disponibilidad (2.2-k12, s3)
- [ ] T17 fiabilidad-para-aplicaciones-heredadas (2.2-s7)
- [ ] T18 servicios-administrados-para-cada-carga-de-trabajo (2.1-k2, s7, 2.2-k2, s8)

## Log

- L1: "punto 2, pero utiliza sub agentes si te es de ayuda" (continue with domain 2 resilience topics R1-R19)
