import { useId, useRef, useState, type SyntheticEvent } from 'react';
import { BottomSheet } from '../../../shared/ui/bottom-sheet/bottom-sheet';
import { Button } from '../../../shared/ui/button/button';
import styles from './write-key-dialog.module.css';

interface WriteKeyDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (writeKey: string) => void;
}

export const WriteKeyDialog = ({ open, onClose, onSubmit }: WriteKeyDialogProps) => {
  const [value, setValue] = useState('');
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const canSubmit = value.trim().length > 0;

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit(value.trim());
    setValue('');
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      label="Clave de escritura"
      variant="modal"
      initialFocusRef={inputRef}
    >
      <form className={styles['write-key-dialog']} onSubmit={handleSubmit}>
        <h2 className={styles['write-key-dialog__title']}>Clave de escritura</h2>
        <p className={styles['write-key-dialog__help']}>
          Para guardar tu progreso necesitas la clave de escritura. Se guarda solo en este
          navegador.
        </p>
        <label className={styles['write-key-dialog__field']} htmlFor={inputId}>
          Clave
          <input
            ref={inputRef}
            id={inputId}
            className={styles['write-key-dialog__input']}
            type="password"
            autoComplete="off"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
            }}
          />
        </label>
        <div className={styles['write-key-dialog__submit']}>
          <Button type="submit" disabled={!canSubmit}>
            Guardar y continuar
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};
