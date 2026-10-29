import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BottomSheet } from '../bottom-sheet';

describe('BottomSheet', () => {
  it('opens as a modal dialog named by its label', () => {
    render(
      <BottomSheet open onClose={vi.fn()} label="Definición de DLQ" eyebrow="DLQ">
        Cola aparte
      </BottomSheet>,
    );
    expect(screen.getByRole('dialog', { name: 'Definición de DLQ' })).toBeInTheDocument();
  });

  it('stays hidden while closed', () => {
    render(
      <BottomSheet open={false} onClose={vi.fn()} label="Definición de DLQ">
        Cola aparte
      </BottomSheet>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose from the close button', () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open onClose={onClose} label="Definición de DLQ">
        Cola aparte
      </BottomSheet>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
