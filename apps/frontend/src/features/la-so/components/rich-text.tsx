import { Fragment, type ReactElement } from 'react';

const MARKER = /(\*\*[^*]+\*\*|==[^=]+==)/g;

const BOLD = '**';
const HIGHLIGHT = '==';

interface RichTextProps {
  readonly text: string;
}

export function RichText({ text }: RichTextProps): ReactElement {
  return (
    <>
      {text
        .split(MARKER)
        .filter(Boolean)
        .map((chunk, index) => {
          const key = `${index}-${chunk}`;

          if (chunk.startsWith(BOLD) && chunk.endsWith(BOLD)) {
            return (
              <strong key={key} className="font-bold text-ink">
                {chunk.slice(BOLD.length, -BOLD.length)}
              </strong>
            );
          }

          if (chunk.startsWith(HIGHLIGHT) && chunk.endsWith(HIGHLIGHT)) {
            return (
              <mark key={key} className="bg-dawn/60 px-1 font-semibold text-ink decoration-clone">
                {chunk.slice(HIGHLIGHT.length, -HIGHLIGHT.length)}
              </mark>
            );
          }

          return <Fragment key={key}>{chunk}</Fragment>;
        })}
    </>
  );
}
