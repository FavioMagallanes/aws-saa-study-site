import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../button';

describe('Button', () => {
  it('does not submit a surrounding form unless asked to', () => {
    const onSubmit = vi.fn((event: React.SyntheticEvent) => {
      event.preventDefault();
    });
    render(
      <form onSubmit={onSubmit}>
        <Button>Marcar como leído</Button>
      </form>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Marcar como leído' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('ignores clicks while disabled', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Siguiente
      </Button>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
