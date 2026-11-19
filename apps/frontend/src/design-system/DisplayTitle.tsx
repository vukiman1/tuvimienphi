import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export enum TitleFace {
  Sans = 'sans',
  Serif = 'serif',
}

const TITLE_FACE_CLASS: Readonly<Record<TitleFace, string>> = {
  [TitleFace.Sans]: 'font-display font-extrabold tracking-display [word-spacing:0.12em]',
  [TitleFace.Serif]: 'font-emphasis font-bold tracking-normal',
};

export enum DisplaySize {
  Hero = 'hero',
  Chapter = 'chapter',
  Card = 'card',
  Panel = 'panel',
}

const DISPLAY_SIZE_CLASS: Readonly<Record<DisplaySize, string>> = {
  [DisplaySize.Hero]: 'text-[clamp(3.6rem,10.2vw,10.6rem)]',
  [DisplaySize.Chapter]: 'text-[clamp(2.6rem,5vw,5.1rem)]',
  [DisplaySize.Card]: 'text-[clamp(1.9rem,3.4vw,3rem)]',
  [DisplaySize.Panel]: 'text-3xl',
};

interface DisplayTitleProps {
  readonly as?: 'h1' | 'h2' | 'h3';
  readonly id?: string;
  readonly tabIndex?: number;
  readonly size: DisplaySize;
  readonly face?: TitleFace;
  readonly children: ReactNode;
}

export function DisplayTitle({
  as: Heading = 'h2',
  id,
  tabIndex,
  size,
  face = TitleFace.Sans,
  children,
}: DisplayTitleProps): ReactElement {
  return (
    <Heading
      id={id}
      tabIndex={tabIndex}
      className={cn(
        'leading-[1.17] text-balance',
        TITLE_FACE_CLASS[face],
        DISPLAY_SIZE_CLASS[size],
      )}
    >
      {children}
    </Heading>
  );
}

interface EmphasisProps {
  readonly isAccent?: boolean;
  readonly children: ReactNode;
}

export function Emphasis({ isAccent = false, children }: EmphasisProps): ReactElement {
  return (
    <span
      className={cn('font-emphasis font-semibold tracking-normal italic', isAccent && 'text-dawn')}
    >
      {children}
    </span>
  );
}
