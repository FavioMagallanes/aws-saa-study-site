import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ArchitectureDiagram } from '../../components/architecture-diagram/architecture-diagram';
import { resolveArchitectureIcon } from '../../components/architecture-diagram/architecture-icons';

const source = `architecture-beta
  service alb(aws:elastic-load-balancing)[Balanceador]
  service app(aws:amazon-ec2)[Amazon EC2]
  alb:R --> L:app`;

describe('ArchitectureDiagram', () => {
  it('draws the labelled services with their official icons', async () => {
    render(<ArchitectureDiagram source={source} label="Balanceador hacia EC2" />);
    const diagram = screen.getByRole('img', { name: 'Balanceador hacia EC2' });
    await waitFor(() => expect(diagram).toHaveTextContent('Balanceador'));
    expect(diagram).toHaveTextContent('Amazon EC2');
    expect(diagram.querySelectorAll('svg svg').length).toBeGreaterThanOrEqual(2);
    expect(diagram).not.toHaveTextContent('Arch_');
  });

  it('shows an alert instead of throwing when the diagram source is invalid', async () => {
    render(<ArchitectureDiagram source="not a diagram" label="Diagrama roto" />);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo dibujar el diagrama «Diagrama roto».',
    );
  });
});

describe('resolveArchitectureIcon', () => {
  it('returns bundled icons by exact name and null for anything else', () => {
    expect(resolveArchitectureIcon('aws:amazon-ec2')).toContain('<svg');
    expect(resolveArchitectureIcon('aws:unknown')).toBeNull();
    expect(resolveArchitectureIcon('../secrets')).toBeNull();
  });
});
