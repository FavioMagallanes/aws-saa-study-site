import { renderAsync } from 'pele/lazy';
import { useEffect, useState } from 'react';
import { resolveArchitectureIcon } from './architecture-icons';
import styles from './architecture-diagram.module.css';

interface ArchitectureDiagramProps {
  readonly source: string;
  readonly label: string;
}

type DiagramState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly svg: string }
  | { readonly status: 'error' };

export const ArchitectureDiagram = ({ source, label }: ArchitectureDiagramProps) => {
  const [state, setState] = useState<DiagramState>({ status: 'loading' });

  useEffect(() => {
    let ignore = false;
    // pele/lazy fetches only the architecture renderer, so pages without diagrams never download it.
    renderAsync(source, { icons: resolveArchitectureIcon, links: false, images: false }).then(
      (result) => {
        if (!ignore) setState({ status: 'ready', svg: result.svg });
      },
      () => {
        if (!ignore) setState({ status: 'error' });
      },
    );
    return () => {
      ignore = true;
    };
  }, [source]);

  if (state.status === 'error') {
    return (
      <p className={styles['architecture-diagram__error']} role="alert">
        No se pudo dibujar el diagrama «{label}».
      </p>
    );
  }

  return (
    <figure className={styles['architecture-diagram']} aria-busy={state.status === 'loading'}>
      <div
        className={styles['architecture-diagram__canvas']}
        role="img"
        aria-label={label}
        dangerouslySetInnerHTML={{ __html: state.status === 'ready' ? state.svg : '' }}
      />
    </figure>
  );
};
