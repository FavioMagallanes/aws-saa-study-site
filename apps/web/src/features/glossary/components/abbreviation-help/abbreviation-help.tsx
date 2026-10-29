import { createPortal } from 'react-dom';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import type { GlossaryEntry } from '@arquitecto/contracts/glossary';
import { cx } from '../../../../shared/lib/class-names';
import { BottomSheet } from '../../../../shared/ui/bottom-sheet/bottom-sheet';
import { TextLink } from '../../../../shared/ui/text-link/text-link';
import { useMediaQuery } from '../../hooks/use-media-query';
import { AbbrCard, AbbrDetails } from '../abbr-card/abbr-card';
import styles from './abbreviation-help.module.css';

// Matches the BottomSheet breakpoint: below it the definition opens as a bottom sheet.
const WIDE_SCREEN_QUERY = '(min-width: 768px)';
const CARD_WIDTH = 320;

interface AbbreviationHelpProps {
  readonly entry: GlossaryEntry;
  readonly children: ReactNode;
}

export const AbbreviationHelp = ({ entry, children }: AbbreviationHelpProps) => {
  const [open, setOpen] = useState(false);
  const [alignEnd, setAlignEnd] = useState(false);
  const wide = useMediaQuery(WIDE_SCREEN_QUERY);
  const popupId = useId();
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLSpanElement>(null);
  const restoreFocusRef = useRef(false);
  const label = `Definición de ${entry.abbreviation}`;

  const close = (restoreFocus: boolean) => {
    restoreFocusRef.current = restoreFocus;
    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      if (wide) cardRef.current?.focus();
      return;
    }
    if (restoreFocusRef.current) {
      restoreFocusRef.current = false;
      triggerRef.current?.focus();
    }
  }, [open, wide]);

  useEffect(() => {
    if (!open || !wide) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && wrapperRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
    };
  }, [open, wide]);

  const toggle = () => {
    if (open) {
      close(true);
      return;
    }
    const viewportWidth = document.documentElement.clientWidth;
    const left = triggerRef.current?.getBoundingClientRect().left ?? 0;
    setAlignEnd(viewportWidth > 0 && left + CARD_WIDTH > viewportWidth);
    setOpen(true);
  };

  // React bubbles events from the portaled bottom sheet through this wrapper too.
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !open) return;
    event.preventDefault();
    close(true);
  };

  const handleBlur = (event: FocusEvent) => {
    if (!open || !wide) return;
    if (event.relatedTarget instanceof Node && wrapperRef.current?.contains(event.relatedTarget)) {
      return;
    }
    close(false);
  };

  const glossaryLink = (
    <TextLink to="/glosario" hash={entry.id} variant="more">
      Ver en el glosario
    </TextLink>
  );

  return (
    <span
      ref={wrapperRef}
      className={styles['abbreviation-help']}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles['abbreviation-help__trigger']}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open && wide ? popupId : undefined}
        onClick={toggle}
      >
        {children}
      </button>
      {open && wide ? (
        <span
          ref={cardRef}
          id={popupId}
          role="dialog"
          aria-label={label}
          tabIndex={-1}
          className={cx(
            styles['abbreviation-help__card'],
            alignEnd && styles['abbreviation-help__card--end'],
          )}
        >
          <AbbrCard
            abbreviation={entry.abbreviation}
            fullName={entry.fullName}
            definition={entry.definition}
            footer={glossaryLink}
          />
        </span>
      ) : null}
      {open && !wide
        ? createPortal(
            <BottomSheet
              open
              onClose={() => {
                close(true);
              }}
              label={label}
              eyebrow={entry.abbreviation}
            >
              <AbbrDetails
                fullName={entry.fullName}
                definition={entry.definition}
                footer={glossaryLink}
                size="sheet"
              />
            </BottomSheet>,
            document.body,
          )
        : null}
    </span>
  );
};
