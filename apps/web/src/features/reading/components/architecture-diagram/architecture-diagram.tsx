import { render } from 'pele';
import { resolveArchitectureIcon } from './architecture-icons';
import styles from './architecture-diagram.module.css';

interface ArchitectureDiagramProps {
  readonly source: string;
  readonly label: string;
}

const renderDiagram = (source: string): string | null => {
  try {
    return render(source, { icons: resolveArchitectureIcon, links: false, images: false }).svg;
  } catch {
    return null;
  }
};

export const ArchitectureDiagram = ({ source, label }: ArchitectureDiagramProps) => {
  const svg = renderDiagram(source);

  if (svg === null) {
    return (
      <p className={styles['architecture-diagram__error']} role="alert">
        No se pudo dibujar el diagrama «{label}».
      </p>
    );
  }

  return (
    <figure className={styles['architecture-diagram']}>
      <div
        className={styles['architecture-diagram__canvas']}
        role="img"
        aria-label={label}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </figure>
  );
};
