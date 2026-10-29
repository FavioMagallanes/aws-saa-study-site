import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chip } from '../chip';

describe('Chip', () => {
  it('announces the read state, not only the color', () => {
    render(<Chip read>Amazon VPC</Chip>);
    expect(screen.getByText('(leído)')).toBeInTheDocument();
  });

  it('adds nothing for an unread chip', () => {
    render(<Chip>Amazon VPC</Chip>);
    expect(screen.queryByText('(leído)')).not.toBeInTheDocument();
  });
});
