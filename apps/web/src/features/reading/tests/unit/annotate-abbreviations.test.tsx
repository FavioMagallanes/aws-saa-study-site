import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { glossary } from '../../../glossary/data/load-glossary';
import { annotateAbbreviations } from '../../model/annotate-abbreviations';

const renderAnnotated = (node: ReactNode) =>
  render(
    <div>
      {annotateAbbreviations(node, glossary, (match) => (
        <mark data-entry={match.entry.id}>{match.text}</mark>
      ))}
    </div>,
  );

const marked = () =>
  [...document.querySelectorAll<HTMLElement>('mark')].map((mark) =>
    mark.getAttribute('data-entry'),
  );

describe('annotateAbbreviations with the real glossary', () => {
  it('annotates only the first occurrence of each abbreviation in a section', () => {
    renderAnnotated(
      <>
        <p>Una cola de SQS cifrada con KMS. Otra cola de SQS.</p>
        <ul>
          <li>
            <strong>SQS</strong> y KMS otra vez, pero SNS por primera vez.
          </li>
        </ul>
      </>,
    );
    expect(marked()).toEqual(['sqs', 'kms', 'sns']);
  });

  it('keeps the text around each annotation unchanged', () => {
    const { container } = renderAnnotated(<p>Amazon SQS (Simple Queue Service) y SQS.</p>);
    expect(container.textContent).toBe('Amazon SQS (Simple Queue Service) y SQS.');
    expect(container.querySelector('mark')).toHaveTextContent('SQS');
  });

  it('starts counting again after each section heading', () => {
    renderAnnotated(
      <>
        <p>SQS</p>
        <h2>Conceptos clave</h2>
        <p>SQS y SQS</p>
      </>,
    );
    expect(marked()).toEqual(['sqs', 'sqs']);
  });

  it('never annotates headings, code, links or existing abbreviations', () => {
    renderAnnotated(
      <>
        <h3>Análisis de EC2</h3>
        <p>
          <code>VPC</code> <a href="#iam">IAM</a> <abbr>KMS</abbr>
        </p>
        <pre>
          <code>S3</code>
        </pre>
        <p>Y luego EC2, VPC, IAM, KMS y S3 en el texto.</p>
      </>,
    );
    expect(marked()).toEqual(['ec2', 'vpc', 'iam', 'kms', 's3']);
    expect(screen.getByRole('heading', { name: 'Análisis de EC2' }).children).toHaveLength(0);
    expect(screen.getByRole('link', { name: 'IAM' }).children).toHaveLength(0);
  });

  it('returns text without abbreviations untouched', () => {
    const { container } = renderAnnotated(<p>Contenido pendiente.</p>);
    expect(container.innerHTML).toBe('<div><p>Contenido pendiente.</p></div>');
  });
});
