import { X } from 'lucide-react';
import { useEffect, useRef, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
import { cx } from '../../lib/class-names';
import { IconButton } from '../icon-button/icon-button';
import styles from './bottom-sheet.module.css';

// From 768px a "sheet" becomes a floating card and a "modal" becomes the centered modal dialog.
export type BottomSheetVariant = 'sheet' | 'modal';

interface BottomSheetProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly label: string;
  readonly eyebrow?: string;
  readonly variant?: BottomSheetVariant;
  readonly initialFocusRef?: RefObject<HTMLElement | null>;
  readonly children: ReactNode;
}

export const BottomSheet = ({
  open,
  onClose,
  label,
  eyebrow,
  variant = 'sheet',
  initialFocusRef,
  children,
}: BottomSheetProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      initialFocusRef?.current?.focus();
      return;
    }
    if (!open) {
      if (dialog.open) dialog.close();
      const returnTarget = returnFocusRef.current;
      returnFocusRef.current = null;
      if (returnTarget?.isConnected) returnTarget.focus();
    }
  }, [open, initialFocusRef]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Escape') return;
    // Handled here so Escape behaves the same where the native dialog cancel is unavailable.
    event.preventDefault();
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className={cx(styles['bottom-sheet'], variant === 'modal' && styles['bottom-sheet--modal'])}
      aria-label={label}
      onKeyDown={handleKeyDown}
      onClose={() => {
        if (open) onClose();
      }}
    >
      <div className={styles['bottom-sheet__handle']} aria-hidden="true" />
      <div className={styles['bottom-sheet__header']}>
        <span className={styles['bottom-sheet__eyebrow']}>{eyebrow}</span>
        <IconButton
          label="Cerrar"
          icon={<X size={18} strokeWidth={1.75} />}
          onClick={() => dialogRef.current?.close()}
        />
      </div>
      {children}
    </dialog>
  );
};
