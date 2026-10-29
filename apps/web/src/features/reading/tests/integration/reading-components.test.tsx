import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DecisionBox } from '../../components/decision-box/decision-box';
import { ExamTasks } from '../../components/exam-tasks/exam-tasks';
import { OfficialSource } from '../../components/official-source/official-source';

describe('ExamTasks', () => {
  it('lists every task covered by the page under a labelled region', () => {
    render(
      <ExamTasks
        tasks={[
          { id: '2.1', title: 'Acoplamiento débil' },
          { id: '3.2', title: 'Almacenamiento de alto rendimiento' },
        ]}
      />,
    );
    const region = screen.getByRole('region', { name: 'En el examen' });
    const items = within(region).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual([
      'Tarea 2.1 · Acoplamiento débil',
      'Tarea 3.2 · Almacenamiento de alto rendimiento',
    ]);
  });
});

describe('DecisionBox', () => {
  it('renders its criteria as a list under the title', () => {
    render(
      <DecisionBox variant="use" title="Cuándo usarlo" items={['Desacoplar', 'Absorber picos']} />,
    );
    expect(screen.getByRole('heading', { name: 'Cuándo usarlo' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});

describe('OfficialSource', () => {
  it('opens the official docs in a new tab without leaking the opener', () => {
    render(
      <OfficialSource
        title="Guía para desarrolladores"
        url="https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html"
      />,
    );
    const link = screen.getByRole('link', { name: /Guía para desarrolladores/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('refuses a source outside docs.aws.amazon.com', () => {
    expect(() => render(<OfficialSource title="X" url="https://example.com/doc" />)).toThrow();
  });
});
