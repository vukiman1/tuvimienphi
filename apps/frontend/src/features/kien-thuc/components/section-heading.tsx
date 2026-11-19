import type { ReactElement } from 'react';
import { Sparkle } from 'lucide-react';
import { DisplaySize, DisplayTitle, TitleFace } from '@/design-system';

interface SectionHeadingProps {
  readonly id?: string;
  readonly children: string;
}

export function SectionHeading({ id, children }: SectionHeadingProps): ReactElement {
  return (
    <div className="flex items-center gap-3">
      <Sparkle aria-hidden="true" className="size-7 shrink-0 fill-gold stroke-0" />
      <DisplayTitle id={id} size={DisplaySize.Panel} face={TitleFace.Serif}>
        {children}
      </DisplayTitle>
    </div>
  );
}
