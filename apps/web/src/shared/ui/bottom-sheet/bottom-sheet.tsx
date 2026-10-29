import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { IconButton } from '../icon-button/icon-button';
import styles from './bottom-sheet.module.css';

interface BottomSheetProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly label: string;
  readonly eyebrow?: string;
  readonly children: ReactNode;
}

export const BottomSheet = ({ open, onClose, label, eyebrow, children }: BottomSheetProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={styles['bottom-sheet']}
      aria-label={label}
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
