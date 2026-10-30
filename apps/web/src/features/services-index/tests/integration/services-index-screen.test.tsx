import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../../../../app/tests/render-app';
import { examGuide } from '../../../content/data/load-exam-guide';
import { loadPages } from '../../../content/data/load-pages';

const renderServices = (progress?: Parameters<typeof renderApp>[1]) =>
  renderApp('/servicios', progress);

const readAt = '2026-10-29T10:00:00.000Z';
const INTRO =
  'Los 118 servicios que la guía declara dentro del alcance, agrupados en sus 16 categorías, como en la guía oficial. Cada nombre abre su página; las que ya leíste llevan una marca.';

const guideCategories = [...new Set(examGuide.services.map((service) => service.category))];
const servicePageIds = new Map(
  loadPages()
    .filter((page) => page.kind === 'service')
    .map((page) => [page.title, page.id]),
);

const categoryBlock = (name: string) => {
  const block = screen.getByRole('heading', { level: 2, name }).closest('li');
  if (!block) throw new Error(`Category ${name} not found`);
  return block;
};

const serviceItem = (category: string, service: string) => {
  const item = within(categoryBlock(category)).getByRole('link', { name: service }).closest('li');
  if (!item) throw new Error(`Service ${service} not found`);
  return item;
};

describe('Servicios page with the real content', () => {
  it('shows the eyebrow, the title and the intro with the real counts', async () => {
    await renderServices();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Los servicios que cubre la guía' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Servicios', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText(INTRO)).toBeInTheDocument();
    expect(servicePageIds.size).toBe(118);
    expect(guideCategories).toHaveLength(16);
  });

  it('lists the 16 guide categories in guide order with every service of each', async () => {
    await renderServices();
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings.map((heading) => heading.textContent)).toEqual(guideCategories);
    for (const category of guideCategories) {
      const expected = examGuide.services.filter((service) => service.category === category);
      const links = within(categoryBlock(category)).getAllByRole('link');
      expect(links).toHaveLength(expected.length);
      expect(new Set(links.map((link) => link.textContent))).toEqual(
        new Set(expected.map((service) => service.name)),
      );
    }
  });

  it('links all 118 services to their reading pages', async () => {
    await renderServices();
    const main = screen.getByRole('main');
    const hrefs = within(main)
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));
    expect(new Set(hrefs)).toEqual(
      new Set([...servicePageIds.values()].map((pageId) => `/lectura/${pageId}`)),
    );
    expect(
      within(categoryBlock('Integración de aplicaciones')).getByRole('link', {
        name: 'Amazon SQS',
      }),
    ).toHaveAttribute('href', '/lectura/amazon-sqs');
  });

  it('orders the services of a category alphabetically by title', async () => {
    await renderServices();
    const names = within(categoryBlock('Computación'))
      .getAllByRole('link')
      .map((link) => link.textContent);
    expect(names).toEqual([
      'Amazon EC2',
      'Amazon EC2 Auto Scaling',
      'AWS Batch',
      'AWS Elastic Beanstalk',
      'AWS Outposts',
      'AWS Wavelength',
      'Repositorio de aplicaciones sin servidor de AWS',
      'VMware Cloud en AWS',
    ]);
  });

  it('counts and marks the services read in the progress API', async () => {
    await renderServices([
      { pageId: 'amazon-ec2', readAt },
      { pageId: 'aws-batch', readAt },
    ]);
    const computing = categoryBlock('Computación');
    expect(await within(computing).findByText('2 de 8 leídas')).toBeInTheDocument();
    expect(within(categoryBlock('Almacenamiento')).getByText('0 de 7 leídas')).toBeInTheDocument();
    expect(serviceItem('Computación', 'Amazon EC2')).toHaveTextContent(/^Amazon EC2\s*\(leído\)$/);
    expect(serviceItem('Computación', 'AWS Batch')).toHaveTextContent('(leído)');
    expect(serviceItem('Computación', 'AWS Outposts')).not.toHaveTextContent('(leído)');
    expect(screen.getAllByText('(leído)')).toHaveLength(2);
  });

  it('uses the singular when a category has a single service', async () => {
    await renderServices([{ pageId: 'aws-x-ray', readAt }]);
    expect(
      await within(categoryBlock('Herramientas para desarrolladores')).findByText('1 de 1 leída'),
    ).toBeInTheDocument();
  });

  it('shows every service unmarked and makes no count claim while the progress loads', async () => {
    await renderApp('/servicios', [], () => new Promise<Response>(() => undefined));
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(16);
    expect(screen.queryByText('(leído)')).not.toBeInTheDocument();
    expect(screen.queryByText(/ de \d+ leídas?$/)).not.toBeInTheDocument();
  });

  it('keeps the services and shows the progress notice when the API is unreachable', async () => {
    await renderServices('unavailable');
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar tu progreso');
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(16);
    expect(screen.queryByText('(leído)')).not.toBeInTheDocument();
    expect(screen.queryByText(/ de \d+ leídas?$/)).not.toBeInTheDocument();
  });
});
