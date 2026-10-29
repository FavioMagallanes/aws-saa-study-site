import { Link } from '@tanstack/react-router';
import { Check } from 'lucide-react';
import { TextLink } from '../../../../shared/ui/text-link/text-link';
import { VisuallyHidden } from '../../../../shared/ui/visually-hidden/visually-hidden';
import type { ServiceCategoryOverview } from '../../model/home-overview';
import styles from './service-index.module.css';

interface ServiceIndexProps {
  readonly categories: readonly ServiceCategoryOverview[];
}

export const ServiceIndex = ({ categories }: ServiceIndexProps) => (
  <ul className={styles['service-index__categories']}>
    {categories.map((category) => (
      <li key={category.category} className={styles['service-index__category']}>
        <h3 className={styles['service-index__category-title']}>{category.category}</h3>
        <ul className={styles['service-index__services']}>
          {category.services.map((service) => (
            <li key={service.pageId} className={styles['service-index__service']}>
              <Link
                to="/lectura/$pageId"
                params={{ pageId: service.pageId }}
                className={styles['service-index__service-link']}
              >
                {service.name}
              </Link>
              {service.read ? (
                <span className={styles['service-index__read-icon']}>
                  <Check size={14} strokeWidth={1.75} aria-hidden="true" />
                  <VisuallyHidden>(leído)</VisuallyHidden>
                </span>
              ) : null}
            </li>
          ))}
        </ul>
        {category.hiddenCount > 0 ? (
          <TextLink to="/servicios" variant="more">
            +{category.hiddenCount} más
          </TextLink>
        ) : null}
      </li>
    ))}
  </ul>
);
