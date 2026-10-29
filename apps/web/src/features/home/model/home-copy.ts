export const FUNDAMENTALS_SUMMARY =
  'Infraestructura global, responsabilidad compartida, Well-Architected';

export const DOMAIN_HIGHLIGHTS: Readonly<Record<number, string>> = {
  1: 'IAM, VPC, cifrado, protección de datos',
  2: 'desacoplamiento, alta disponibilidad, DR',
  3: 'almacenamiento, cómputo, bases de datos, red, datos',
  4: 'niveles de almacenamiento, opciones de compra, red',
};

export const FEATURED_SERVICE_CATEGORIES = [
  'Computación',
  'Almacenamiento',
  'Redes y entrega de contenido',
  'Integración de aplicaciones',
  'Base de datos',
  'Seguridad, identidad y cumplimiento',
] as const;

export const VISIBLE_SERVICES_PER_CATEGORY = 5;
