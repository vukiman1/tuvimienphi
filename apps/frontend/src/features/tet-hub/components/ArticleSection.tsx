import type { ReactElement, ReactNode } from 'react';

interface ArticleSectionProps {
  readonly id: string;
  readonly title: string;
  readonly children: ReactNode;
}

export function ArticleSection({ id, title, children }: ArticleSectionProps): ReactElement {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6">
      <h2 id={`${id}-title`} className="text-[22px] leading-snug font-semibold text-[#2a1f0e]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
