import { fireEvent, render, screen } from '@testing-library/react';
import { useRef, useState } from 'react';
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

  it('calls onClose when Escape is pressed inside the sheet', () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open onClose={onClose} label="Definición de DLQ">
        Cola aparte
      </BottomSheet>,
    );
    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Definición de DLQ' }), {
      key: 'Escape',
    });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('focuses the requested element on open and returns focus to the opener on close', () => {
    const Harness = () => {
      const [open, setOpen] = useState(false);
      const inputRef = useRef<HTMLInputElement>(null);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setOpen(true);
            }}
          >
            Abrir
          </button>
          <BottomSheet
            open={open}
            onClose={() => {
              setOpen(false);
            }}
            label="Clave"
            variant="modal"
            initialFocusRef={inputRef}
          >
            <input ref={inputRef} aria-label="Campo" />
          </BottomSheet>
        </>
      );
    };
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'Abrir' });
    opener.focus();
    fireEvent.click(opener);
    expect(screen.getByRole('textbox', { name: 'Campo' })).toHaveFocus();

    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Campo' }), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
});
