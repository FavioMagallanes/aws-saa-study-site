import { cx } from '../../../../shared/lib/class-names';
import styles from './diagram-node.module.css';

interface DiagramNodeProps {
  readonly name: string;
  readonly role: string;
  readonly highlighted?: boolean;
}

export const DiagramNode = ({ name, role, highlighted = false }: DiagramNodeProps) => (
  <span className={cx(styles['diagram-node'], highlighted && styles['diagram-node--highlighted'])}>
    <span className={styles['diagram-node__name']}>{name}</span>
    <span className={styles['diagram-node__role']}>{role}</span>
  </span>
);
