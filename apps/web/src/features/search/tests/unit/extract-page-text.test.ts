/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { extractPageText } from '../../model/extract-page-text';

// The MDX plugin also compiles `?raw` imports, so the sources are read from disk instead.
const PAGES_DIR = join(import.meta.dirname, '../../../../../content/pages');
const readPage = (path: string) => readFileSync(join(PAGES_DIR, path), 'utf8');

describe('extractPageText', () => {
  it('collects the h2 and h3 headings of a written page, without "Fuentes oficiales"', () => {
    const text = extractPageText(readPage('services/amazon-s3.mdx'));
    expect(text?.headings).toEqual([
      'Qué problema resuelve',
      'Conceptos clave',
      'Buckets, objetos y consistencia',
      'Clases de almacenamiento y ciclo de vida',
      'Protección de los datos',
      'Opciones de acceso',
      'Buckets con pago a cargo del solicitante (Requester Pays)',
      'Cómo se conecta con otros servicios',
      'Cómo elegir',
    ]);
  });

  it('uses the first body paragraph as the summary', () => {
    const text = extractPageText(readPage('services/amazon-s3.mdx'));
    expect(text?.summary).toBe(
      'Amazon S3 (Simple Storage Service) es un servicio de almacenamiento de objetos con gran escalabilidad, disponibilidad, seguridad y rendimiento. Guarda cualquier cantidad de datos como objetos dentro de buckets, y se usa para lagos de datos, sitios web, aplicaciones móviles, copias de seguridad, archivado y análisis de big data.',
    );
  });

  it('removes inline Markdown marks from the summary', () => {
    const text = extractPageText(readPage('services/amazon-sns.mdx'));
    expect(text?.summary).toContain('de forma asíncrona a un tema, y SNS los entrega');
    expect(text?.summary).not.toMatch(/[*`]/);
  });

  it('returns nothing for a page that still says "Contenido pendiente."', () => {
    expect(extractPageText(readPage('services/amazon-elastic-transcoder.mdx'))).toBeUndefined();
  });
});
