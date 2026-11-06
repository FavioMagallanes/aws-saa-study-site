import styles from './checkbox-toggle.module.css';

interface CheckboxToggleProps {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
}

export const CheckboxToggle = ({ label, checked, onChange }: CheckboxToggleProps) => (
  <label className={styles['checkbox-toggle']}>
    <input
      type="checkbox"
      className={styles['checkbox-toggle__input']}
      checked={checked}
      onChange={(event) => {
        onChange(event.target.checked);
      }}
    />
    {label}
  </label>
);
