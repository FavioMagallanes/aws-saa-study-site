import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IconButton } from '../icon-button';

describe('IconButton', () => {
  it('is named by its label and fires onClick', () => {
    const onClick = vi.fn();
    render(<IconButton label="Cambiar tema" icon={<svg />} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar tema' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
