import { cx } from '../../../../shared/lib/class-names';
import styles from './decision-box.module.css';

export type DecisionBoxVariant = 'use' | 'alternative';

interface DecisionBoxProps {
  readonly variant: DecisionBoxVariant;
  readonly title: string;
  readonly items: readonly string[];
}

export const DecisionBox = ({ variant, title, items }: DecisionBoxProps) => (
  <section className={cx(styles['decision-box'], styles[`decision-box--${variant}`])}>
    <h3 className={styles['decision-box__title']}>{title}</h3>
    <ul className={styles['decision-box__list']}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </section>
);
