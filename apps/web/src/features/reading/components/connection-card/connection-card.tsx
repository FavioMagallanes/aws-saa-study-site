import styles from './connection-card.module.css';

interface ConnectionCardProps {
  readonly relation: string;
  readonly service: string;
  readonly description: string;
}

export const ConnectionCard = ({ relation, service, description }: ConnectionCardProps) => (
  <article className={styles['connection-card']}>
    <p className={styles['connection-card__relation']}>{relation}</p>
    <h3 className={styles['connection-card__service']}>{service}</h3>
    <p className={styles['connection-card__description']}>{description}</p>
  </article>
);
