# Content phase 6: service pages (118, orders 65-182)

Writes the 118 `service` pages in apps/web/content/pages/services. Each batch below is one background writer; the parent commits one page per commit.

## Specs

- S1: "Content ONLY from the official exam guide (SAA-C03, Spanish) and docs.aws.amazon.com", in my own words, Spanish, service names in English.
- S2: Each page addresses every bullet in its `covers`; ends with "## Fuentes oficiales"; claims re-read against the fetched sources before committing; no invented prices or numbers.
- S3: No Markdown tables in MDX pages; no links outside docs.aws.amazon.com.
- S4: Service page structure (shorter than topics, about 50-90 lines): one-paragraph intro saying what the service is; `## Qué problema resuelve`; `## Conceptos clave` (the few ideas the exam needs, with `###` subsections only if useful); `## Cómo se conecta con otros servicios` (CardGrid of ConnectionCard, 3-4, only services that have their own page or are in the guide); `## Cómo elegir` (CardGrid with DecisionBox variant="use" and variant="alternative", naming the better alternative); `## Fuentes oficiales` (2-4 OfficialSource). Same components as apps/web/content/pages/topics/secretos-y-credenciales-de-aplicaciones.mdx. When a topic page already explains the concept in depth, link the idea in one line and do not duplicate it.

## Tasks

- [x] T1 (10 pages): aws-artifact, aws-certificate-manager-acm, aws-cloudhsm, amazon-cognito, amazon-detective, aws-directory-service, aws-firewall-manager, amazon-guardduty, aws-iam-identity-center, amazon-inspector
- [x] T2 (13 pages): aws-kms, amazon-macie, aws-network-firewall, aws-resource-access-manager-aws-ram, aws-secrets-manager, aws-security-hub, aws-shield, aws-waf, iam, aws-budgets, informe-de-costo-y-uso-de-aws, explorador-de-costos-de-aws, savings-plans
- [x] T3 (9 pages): aws-auto-scaling, aws-cli, aws-cloudformation, aws-cloudtrail, amazon-cloudwatch, aws-compute-optimizer, aws-config, aws-control-tower, panel-de-aws-health
- [x] T4 (10 pages): aws-license-manager, amazon-managed-grafana, amazon-managed-service-para-prometheus, consola-de-administracion-de-aws, aws-organizations, aws-service-catalog, aws-systems-manager, aws-trusted-advisor, herramienta-de-aws-well-architected, aws-x-ray
- [x] T5 (11 pages): amazon-athena, aws-data-exchange, amazon-data-firehose, amazon-emr, aws-glue, amazon-kinesis, aws-lake-formation, amazon-managed-streaming-para-apache-kafka-amazon-msk, amazon-opensearch-service, amazon-quick, amazon-redshift
- [x] T6 (10 pages): aws-client-vpn, amazon-cloudfront, aws-direct-connect, elastic-load-balancing-elb, aws-global-accelerator, aws-privatelink, amazon-route-53, aws-site-to-site-vpn, aws-transit-gateway, amazon-vpc
- [x] T7 (10 pages): aws-batch, amazon-ec2, amazon-ec2-auto-scaling, aws-elastic-beanstalk, aws-outposts, repositorio-de-aplicaciones-sin-servidor-de-aws, vmware-cloud-en-aws, aws-wavelength, aws-fargate, aws-lambda
- [x] T8 (10 pages): amazon-aurora, amazon-aurora-sin-servidor, amazon-documentdb, amazon-dynamodb, amazon-elasticache, amazon-keyspaces, amazon-neptune, amazon-rds, amazon-elastic-transcoder, amazon-kinesis-video-streams
- [x] T9 (11 pages): amazon-comprehend, amazon-lex, amazon-polly, amazon-rekognition, amazon-sagemaker-ai, amazon-textract, amazon-transcribe, amazon-translate, aws-amplify, amazon-api-gateway, aws-device-farm
- [x] T10 (12 pages): amazon-appflow, amazon-eventbridge, amazon-mq, amazon-sns, amazon-sqs, aws-step-functions, amazon-ecr, amazon-ecs, amazon-ecs-anywhere, amazon-eks, amazon-eks-anywhere, amazon-eks-distro
- [x] T11 (12 pages): aws-backup, amazon-ebs, amazon-efs, amazon-fsx-para-todos-los-tipos, amazon-s3, amazon-s3-glacier, aws-storage-gateway, aws-application-migration-service, aws-datasync, aws-dms, aws-snow-family, aws-transfer-family

## Log

- L1: "lanza los escritores" (write the 118 service pages with background writers)
- L2: 117 of 118 service pages written by 11 parallel writers (T1-T11), reviewed by the parent. amazon-elastic-transcoder stays pending: its guide returns 404 and the only official page is the General Reference list of shut-down services (end of support 2025-11-13); owner decision needed. Checks: 298+ web tests, lint, prettier, tsc, check-sources (640 URLs), cross-contamination scan (title vs intro, duplicate intros): clean. A /tmp collision between writers briefly put DocumentDB text in aws-global-accelerator; restored and verified (meta unchanged). Limits: wording is mine and needs the owner's review; pages run 80-112 lines, above the 50-90 guide; EKS Distro/EKS Anywhere rely on one EKS page; VMware Cloud on AWS relies on the overview whitepaper; several 'Cómo elegir' alternatives are my reasoning.
