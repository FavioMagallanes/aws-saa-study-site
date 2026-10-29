import { fireEvent, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '../../../../app/tests/render-app';
import { glossary } from '../../../glossary/data/load-glossary';

const sqs = glossary.find((entry) => entry.id === 'sqs');
if (!sqs) throw new Error('The real glossary must define SQS');

const stubViewport = (desktop: boolean) => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: desktop && query === '(min-width: 768px)',
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
};

const renderPage = async (pageId: string) => {
  await renderApp(`/lectura/${pageId}`);
  return screen.findByRole('main');
};

// Top-level body elements from the given h2 up to the next one.
const sectionElements = (main: HTMLElement, heading: string): Element[] => {
  const start = within(main).getByRole('heading', { level: 2, name: heading });
  const elements: Element[] = [];
  for (let next = start.nextElementSibling; next && next.tagName !== 'H2';) {
    elements.push(next);
    next = next.nextElementSibling;
  }
  return elements;
};

const triggersIn = (elements: readonly Element[], name: string) =>
  elements.flatMap((element) => within(element as HTMLElement).queryAllByRole('button', { name }));

const firstSqsTrigger = async () => {
  const main = await renderPage('amazon-sqs');
  const intro = within(main).getByText(/es un servicio administrado de colas de mensajes/);
  const trigger = within(intro).getByRole('button', { name: 'SQS' });
  return { main, trigger };
};

describe('abbreviation help in the reading body', () => {
  afterEach(() => {
    stubViewport(false);
  });

  it('turns the first abbreviation of the introduction into a closed popup trigger', async () => {
    const { trigger } = await firstSqsTrigger();
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    const intro = trigger.closest('p');
    expect(intro?.textContent.match(/\bSQS\b/g)).toHaveLength(2);
    expect(within(intro as HTMLElement).getAllByRole('button', { name: 'SQS' })).toHaveLength(1);
  });

  it('marks each abbreviation once per section of the real page', async () => {
    const main = await renderPage('amazon-sqs');
    const section = sectionElements(main, 'Qué problema resuelve');
    expect(
      section
        .map((element) => element.textContent)
        .join(' ')
        .match(/\bSQS\b/g),
    ).toHaveLength(2);
    expect(triggersIn(section, 'SQS')).toHaveLength(1);
    expect(triggersIn(sectionElements(main, 'Conceptos clave'), 'KMS')).toHaveLength(1);
  });

  it('never marks headings or the official sources', async () => {
    const main = await renderPage('amazon-inspector');
    for (const heading of within(main).getAllByRole('heading')) {
      expect(within(heading).queryAllByRole('button')).toEqual([]);
    }
    expect(within(main).getByRole('heading', { level: 3, name: 'Análisis de EC2' })).toBeVisible();
    expect(triggersIn(sectionElements(main, 'Fuentes oficiales'), 'EC2')).toEqual([]);
    expect(triggersIn(sectionElements(main, 'Conceptos clave'), 'EBS')).toHaveLength(1);
  });

  it('opens the glossary entry in a bottom sheet on small screens and closes it with Escape', async () => {
    const { main, trigger } = await firstSqsTrigger();
    fireEvent.click(trigger);

    const sheet = screen.getByRole('dialog', { name: 'Definición de SQS' });
    expect(main).not.toContainElement(sheet);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(within(sheet).getByText(sqs.fullName)).toBeInTheDocument();
    expect(within(sheet).getByText(sqs.definition)).toBeInTheDocument();
    expect(within(sheet).getByRole('link', { name: 'Ver en el glosario' })).toHaveAttribute(
      'href',
      '/glosario#sqs',
    );

    fireEvent.keyDown(sheet, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('closes the bottom sheet from its close button and returns focus', async () => {
    const { trigger } = await firstSqsTrigger();
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('opens a card next to the abbreviation on wide screens and closes it with Escape', async () => {
    stubViewport(true);
    const { main, trigger } = await firstSqsTrigger();
    fireEvent.click(trigger);

    const card = screen.getByRole('dialog', { name: 'Definición de SQS' });
    expect(main).toContainElement(card);
    expect(card).toHaveFocus();
    expect(within(card).getByText(sqs.fullName)).toBeInTheDocument();
    expect(within(card).getByText(sqs.definition)).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: 'Ver en el glosario' })).toHaveAttribute(
      'href',
      '/glosario#sqs',
    );

    fireEvent.keyDown(card, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes the wide-screen card when the reader clicks elsewhere', async () => {
    stubViewport(true);
    const { main, trigger } = await firstSqsTrigger();
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Definición de SQS' })).toBeInTheDocument();

    fireEvent.pointerDown(within(main).getByRole('heading', { level: 1 }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles the wide-screen card from the trigger', async () => {
    stubViewport(true);
    const { trigger } = await firstSqsTrigger();
    fireEvent.click(trigger);
    fireEvent.click(trigger);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
