import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { ContentKind, parsePageRef } from '@org/shared-contracts';
import type { PageRef } from '@org/shared-contracts';
import { FOCUS_RING_CLASS } from '@/design-system';
import { cn } from '@/lib/utils';
import { refPath } from '../kien-thuc-paths';
import { publishedTitle } from '../published-pages';
import { PopoverAlign, TERM_PANEL_WIDTH_REM, popoverAlignment } from './popover-alignment';
import { useProse } from './prose-context';

const ESCAPE_KEY = 'Escape';
const DEFAULT_ROOT_FONT_SIZE_PX = 16;

const TERM_CLASS = cn(
  'underline decoration-gold decoration-dotted decoration-2 underline-offset-4 text-ink',
  FOCUS_RING_CLASS,
);

const PANEL_CLASS =
  'fixed inset-x-0 bottom-0 z-60 rounded-t-2xl bg-day pb-[env(safe-area-inset-bottom)] text-ink inset-ring-1 inset-ring-ink/15 md:absolute md:inset-x-auto md:bottom-auto md:top-full md:mt-2 md:w-80 md:rounded-2xl md:pb-0';

const PANEL_ALIGN_CLASS = {
  [PopoverAlign.Start]: 'md:left-0',
  [PopoverAlign.End]: 'md:right-0',
} as const satisfies Readonly<Record<PopoverAlign, string>>;

const PANEL_LINK_CLASS = cn(
  'inline-flex min-h-11 items-center border-b border-current text-sm font-bold no-underline',
  FOCUS_RING_CLASS,
);

const CLOSE_BUTTON_CLASS = cn(
  'inline-flex min-h-11 items-center rounded-full px-4 text-sm font-bold text-ink hover:bg-ink/5',
  FOCUS_RING_CLASS,
);

interface TermButtonProps {
  readonly pageRef: PageRef;
  readonly label: string;
}

function linkText(ref: PageRef, title: string): string {
  return parsePageRef(ref)?.kind === ContentKind.Bai ? `Đọc bài ${title} →` : `Xem mục ${title} →`;
}

function rootFontSizePx(): number {
  const fontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(fontSize) ? fontSize : DEFAULT_ROOT_FONT_SIZE_PX;
}

function alignmentOf(term: HTMLElement): PopoverAlign {
  return popoverAlignment(
    term.getBoundingClientRect().left,
    window.innerWidth,
    TERM_PANEL_WIDTH_REM * rootFontSizePx(),
  );
}

export function TermButton({ pageRef, label }: TermButtonProps): ReactElement {
  const { manifest, openTermId, summaries, openTerm, closeTerm } = useProse();
  const panelId = useId();
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [align, setAlign] = useState<PopoverAlign>(PopoverAlign.Start);
  const isOpen = openTermId === panelId;
  const title = publishedTitle(manifest, pageRef) ?? label;
  const summary = summaries.get(pageRef);

  const close = useCallback(
    (focusOptions?: FocusOptions): void => {
      closeTerm();
      buttonRef.current?.focus(focusOptions);
    },
    [closeTerm],
  );

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === ESCAPE_KEY) {
        close();
      }
    };
    const handlePointerDown = (event: PointerEvent): void => {
      if (event.target instanceof Node && wrapperRef.current?.contains(event.target)) {
        return;
      }
      close({ preventScroll: true });
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen, close]);

  const toggle = (): void => {
    if (isOpen) {
      closeTerm();
      return;
    }
    if (buttonRef.current) {
      setAlign(alignmentOf(buttonRef.current));
    }
    openTerm(panelId);
  };

  return (
    <span className="relative" ref={wrapperRef}>
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className={TERM_CLASS}
        onClick={toggle}
        ref={buttonRef}
        type="button"
      >
        {label}
      </button>
      <span className={cn(PANEL_CLASS, PANEL_ALIGN_CLASS[align])} hidden={!isOpen} id={panelId}>
        <span className="block p-6">
          <span className="block font-bold">{title}</span>
          {summary && <span className="mt-2 block text-sm text-ink-soft">{summary}</span>}
          <span className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <Link className={PANEL_LINK_CLASS} to={refPath(pageRef)}>
              {linkText(pageRef, title)}
            </Link>
            <button className={CLOSE_BUTTON_CLASS} onClick={() => close()} type="button">
              Đóng
            </button>
          </span>
        </span>
      </span>
    </span>
  );
}
