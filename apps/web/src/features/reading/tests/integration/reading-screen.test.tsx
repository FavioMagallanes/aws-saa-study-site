import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../../../../app/tests/render-app';

const renderAt = (path: string) => renderApp(path);

const openSection = async (): Promise<HTMLElement> => {
  const nav = await screen.findByRole('navigation', { name: 'Ruta de lectura' });
  const open = [...nav.querySelectorAll('details')].filter((details) => details.open);
  const [section] = open;
  if (!section || open.length !== 1) throw new Error('Expected exactly one open section');
  return section;
};

describe('reading page with the real content', () => {
  it('shows the page title, its exam tasks and its written body', async () => {
    await renderAt('/lectura/amazon-sqs');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Amazon SQS' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'En el examen' })).toBeInTheDocument();
    expect(screen.queryByText('Contenido pendiente.')).not.toBeInTheDocument();
  });

  it('gives subsection headings an id so search results can link to them', async () => {
    await renderAt('/lectura/aws-kms');
    const heading = await screen.findByRole('heading', {
      level: 3,
      name: 'Cifrado de sobre con claves de datos',
    });
    expect(heading).toHaveAttribute('id', 'cifrado-de-sobre-con-claves-de-datos');
  });

  it('marks the current page in the reading path', async () => {
    await renderAt('/lectura/amazon-sqs');
    const nav = await screen.findByRole('navigation', { name: 'Ruta de lectura' });
    const current = within(nav)
      .getAllByRole('link')
      .filter((l) => l.getAttribute('aria-current') === 'page');
    expect(current.map((link) => link.textContent)).toEqual(['Amazon SQS']);
  });

  it('links to the previous and next pages', async () => {
    await renderAt('/lectura/amazon-sqs');
    const pager = await screen.findByRole('navigation', { name: 'Página anterior y siguiente' });
    expect(within(pager).getAllByRole('link')).toHaveLength(2);
  });

  it('renders the heading and pager of the next page after following the pager', async () => {
    await renderAt('/lectura/politicas-basadas-en-recursos');
    const pager = await screen.findByRole('navigation', { name: 'Página anterior y siguiente' });
    fireEvent.click(within(pager).getByRole('link', { name: /^Siguiente:/ }));
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Seguridad de la VPC: grupos de seguridad, ACL de red y segmentación',
      }),
    ).toBeInTheDocument();
    const nextPager = screen.getByRole('navigation', { name: 'Página anterior y siguiente' });
    expect(within(nextPager).getByRole('link', { name: /^Anterior:/ })).toHaveAttribute(
      'href',
      '/lectura/politicas-basadas-en-recursos',
    );
  });

  it('shows the whole path with only the section of the current page open', async () => {
    await renderAt('/lectura/politicas-basadas-en-recursos');
    const nav = await screen.findByRole('navigation', { name: 'Ruta de lectura' });
    expect(within(nav).getByRole('heading', { name: 'Ruta de lectura' })).toBeInTheDocument();
    const summaries = within(nav)
      .getAllByText(/^(Fundamentos|Dominio \d · .+|Servicios)$/)
      .filter((element) => element.closest('summary'));
    expect(summaries.map((summary) => summary.textContent)).toEqual([
      'Fundamentos',
      'Dominio 1 · Seguras',
      'Dominio 2 · Resistentes',
      'Dominio 3 · Alto rendimiento',
      'Dominio 4 · Costos',
      'Servicios',
    ]);
    expect(summaries.map((summary) => summary.closest('details')?.hasAttribute('open'))).toEqual([
      false,
      true,
      false,
      false,
      false,
      false,
    ]);
    expect(summaries[1]?.closest('summary')).toHaveTextContent('0 de 16 leídas');
  });

  it('lists every task of the domain of the current page', async () => {
    await renderAt('/lectura/politicas-basadas-en-recursos');
    const domain = await openSection();
    for (const task of [
      'Tarea 1.1 · Diseñar un acceso seguro a los recursos de AWS',
      'Tarea 1.2 · Diseñar cargas de trabajo y aplicaciones seguras',
      'Tarea 1.3 · Determinar los controles de seguridad de datos adecuados',
    ]) {
      expect(within(domain).getByText(task)).toBeInTheDocument();
    }
  });

  it('moves to the neighbours of the current page in the sidebar and names the new task', async () => {
    await renderAt('/lectura/politicas-basadas-en-recursos');
    const links = within(await openSection()).getAllByRole('link');
    const index = links.findIndex((link) => link.getAttribute('aria-current') === 'page');
    const pager = screen.getByRole('navigation', { name: 'Página anterior y siguiente' });
    const [previous, next] = within(pager).getAllByRole('link');
    expect(previous).toHaveAttribute('href', links[index - 1]?.getAttribute('href'));
    expect(next).toHaveAttribute('href', links[index + 1]?.getAttribute('href'));
    expect(previous).toHaveTextContent(
      /^Anterior: Estrategia de varias cuentas: Organizations, SCP y Control Tower$/,
    );
    expect(next).toHaveTextContent(
      'Siguiente: Seguridad de la VPC: grupos de seguridad, ACL de red y segmentación',
    );
    expect(next).toHaveTextContent('Tarea 1.2 · Diseñar cargas de trabajo y aplicaciones seguras');
  });

  it('names the next domain when the next page starts it', async () => {
    await renderAt('/lectura/clases-de-almacenamiento-y-ciclo-de-vida-de-s3');
    const pager = await screen.findByRole('navigation', { name: 'Página anterior y siguiente' });
    const next = within(pager).getByRole('link', { name: /^Siguiente:/ });
    expect(next).toHaveAttribute('href', '/lectura/arquitecturas-de-varios-niveles');
    expect(next).toHaveTextContent('Dominio 2 · Resistentes');
  });

  it('places a service under Servicios and its category', async () => {
    await renderAt('/lectura/amazon-sqs');
    expect(await screen.findByText('Servicios › Integración de aplicaciones')).toBeInTheDocument();
    const section = await openSection();
    expect(within(section).getByText('Servicios', { selector: 'summary *' })).toBeInTheDocument();
  });

  it('shows the domain and task of a topic in the breadcrumb', async () => {
    await renderAt('/lectura/politicas-basadas-en-recursos');
    expect(await screen.findByText('Dominio 1 › Tarea 1.1')).toBeInTheDocument();
  });

  it('shows a not-found message for an unknown page', async () => {
    await renderAt('/lectura/no-existe');
    expect(
      await screen.findByRole('heading', { name: 'Página no encontrada' }),
    ).toBeInTheDocument();
  });
});
