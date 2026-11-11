import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export enum DisplaySize {
  Hero = 'hero',
  Chapter = 'chapter',
  Card = 'card',
}

const DISPLAY_SIZE_CLASS: Readonly<Record<DisplaySize, string>> = {
  [DisplaySize.Hero]: 'text-[clamp(3.6rem,10.2vw,10.6rem)]',
  [DisplaySize.Chapter]: 'text-[clamp(2.6rem,5vw,5.1rem)]',
  [DisplaySize.Card]: 'text-[clamp(1.9rem,3.4vw,3.6rem)]',
};

interface DisplayTitleProps {
  readonly as?: 'h1' | 'h2' | 'h3';
  readonly size: DisplaySize;
  readonly children: ReactNode;
}

export function DisplayTitle({
  as: Heading = 'h2',
  size,
  children,
}: DisplayTitleProps): ReactElement {
  return (
    <Heading
      className={cn(
        'font-display leading-[1.17] font-extrabold tracking-display [word-spacing:0.12em]',
        DISPLAY_SIZE_CLASS[size],
      )}
    >
      {children}
    </Heading>
  );
}

export function Emphasis({ children }: { readonly children: ReactNode }): ReactElement {
  return <span className="font-emphasis font-semibold tracking-normal italic">{children}</span>;
}
