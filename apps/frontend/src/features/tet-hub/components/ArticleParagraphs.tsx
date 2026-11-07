import type { ReactElement } from 'react';

interface ArticleParagraphsProps {
  readonly paragraphs: readonly string[];
}

export function ArticleParagraphs({ paragraphs }: ArticleParagraphsProps): ReactElement {
  return (
    <div className="flex flex-col gap-4">
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}
