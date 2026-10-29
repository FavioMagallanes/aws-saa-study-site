import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProgressBar } from '../progress-bar';

describe('ProgressBar', () => {
  it('exposes the rounded percentage to assistive technology', () => {
    render(<ProgressBar label="Progreso de lectura" percentage={42.4} />);
    const bar = screen.getByRole('progressbar', { name: 'Progreso de lectura' });
    expect(bar).toHaveAttribute('aria-valuenow', '42');
  });

  it.each([
    [-10, '0'],
    [250, '100'],
    [Number.NaN, '0'],
  ])('clamps %s to a valid value', (percentage, expected) => {
    render(<ProgressBar label="Progreso" percentage={percentage} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', expected);
  });
});
