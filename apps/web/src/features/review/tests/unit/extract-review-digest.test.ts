import { describe, expect, it } from 'vitest';
import { extractReviewDigest } from '../../scripts/extract-review-digest';

const BULLET_PAGE = `export const meta = { id: 'x' };

Amazon Athena consulta **datos** en [Amazon S3](https://docs.aws.amazon.com/x) con SQL.

## Qué problema resuelve

Cargar los datos antes es lento. Athena los consulta donde están.

## Conceptos clave

- **Datos de cualquier estructura**: consulta CSV, JSON o Parquet. No hace falta cargarlos.
- **Resultados en S3** — Athena guarda cada resultado en una ubicación que tú indicas.

## Cómo elegir

<CardGrid>
  <DecisionBox
    variant="use"
    title="Úsalo cuando"
    items={[
      'Quieres consultas ad hoc sobre S3.',
      'No quieres administrar clústeres.',
    ]}
  />
  <DecisionBox variant="alternative" title="Alternativas" items={['Usa Redshift para análisis constantes.']} />
</CardGrid>
`;

const HEADING_PAGE = `Intro de la página.

## Conceptos clave

### AWS DataSync

DataSync mueve datos entre sistemas. Funciona con agentes.

### AWS Storage Gateway

Conecta entornos locales con la nube. Tiene varios tipos.
`;

describe('extractReviewDigest', () => {
  it('takes the intro, the problem, the bulleted concepts and the "use" items', () => {
    expect(extractReviewDigest(BULLET_PAGE)).toEqual({
      intro: 'Amazon Athena consulta datos en Amazon S3 con SQL.',
      problem: 'Cargar los datos antes es lento.',
      concepts: [
        {
          term: 'Datos de cualquier estructura',
          summary: 'consulta CSV, JSON o Parquet.',
        },
        {
          term: 'Resultados en S3',
          summary: 'Athena guarda cada resultado en una ubicación que tú indicas.',
        },
      ],
      whenToUse: ['Quieres consultas ad hoc sobre S3.', 'No quieres administrar clústeres.'],
    });
  });

  it('reads concepts written as sub-headings with the first sentence below them', () => {
    expect(extractReviewDigest(HEADING_PAGE)?.concepts).toEqual([
      { term: 'AWS DataSync', summary: 'DataSync mueve datos entre sistemas.' },
      { term: 'AWS Storage Gateway', summary: 'Conecta entornos locales con la nube.' },
    ]);
  });

  it('falls back to the first list item when a sub-heading has no paragraph', () => {
    const source =
      '## Conceptos clave\n\n### Casos de uso\n\n- Separar el trabajo pesado: se hace aparte.\n';
    expect(extractReviewDigest(source)?.concepts).toEqual([
      { term: 'Casos de uso', summary: 'Separar el trabajo pesado: se hace aparte.' },
    ]);
  });

  it('returns undefined for a page whose body is still pending', () => {
    expect(extractReviewDigest('Contenido pendiente.')).toBeUndefined();
  });
});
