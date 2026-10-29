import { clampPercentage } from './clamp-percentage';
import styles from './progress-bar.module.css';

interface ProgressBarProps {
  readonly label: string;
  readonly percentage: number;
}

export const ProgressBar = ({ label, percentage }: ProgressBarProps) => {
  const value = Math.round(clampPercentage(percentage));
  return (
    <div
      className={styles['progress-bar']}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <div className={styles['progress-bar__fill']} style={{ width: `${String(value)}%` }} />
    </div>
  );
};
