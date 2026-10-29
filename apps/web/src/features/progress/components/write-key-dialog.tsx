import { useId, useState, type SyntheticEvent } from 'react';
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
  const canSubmit = value.trim().length > 0;

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit(value.trim());
    setValue('');
  };

  return (
    <BottomSheet open={open} onClose={onClose} label="Clave de escritura">
      <form className={styles['write-key-dialog']} onSubmit={handleSubmit}>
        <h2 className={styles['write-key-dialog__title']}>Clave de escritura</h2>
        <p className={styles['write-key-dialog__help']}>
          Para guardar tu progreso necesitas la clave de escritura. Se guarda solo en este
          navegador.
        </p>
        <label className={styles['write-key-dialog__field']} htmlFor={inputId}>
          Clave
          <input
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
        <Button type="submit" disabled={!canSubmit}>
          Guardar y continuar
        </Button>
      </form>
    </BottomSheet>
  );
};
