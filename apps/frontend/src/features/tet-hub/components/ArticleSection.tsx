import type { ReactElement, ReactNode } from 'react';
import { DisplaySize, DisplayTitle, TitleFace } from '@/design-system';

interface ArticleSectionProps {
  readonly id: string;
  readonly title: string;
  readonly children: ReactNode;
}

export function ArticleSection({ id, title, children }: ArticleSectionProps): ReactElement {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6">
      <DisplayTitle id={`${id}-title`} size={DisplaySize.Card} face={TitleFace.Serif}>
        {title}
      </DisplayTitle>
      <div className="mt-4">{children}</div>
    </section>
  );
}
