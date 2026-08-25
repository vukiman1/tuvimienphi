import { Fragment } from 'react';

/**
 * Đánh dấu nhấn mạnh ngay trong chuỗi nội dung: `**đậm**` cho từ khoá và tên sao, `==tô nền==` cho
 * ý chính. Chuỗi được tách thành các phần tử React chứ không nhúng HTML — nội dung sau này do
 * backend trả về, nhúng HTML thô là mở đường cho XSS.
 */
const MARKER = /(\*\*[^*]+\*\*|==[^=]+==)/g;

const BOLD = '**';
const HIGHLIGHT = '==';

interface RichTextProps {
  readonly text: string;
}

export function RichText({ text }: RichTextProps) {
  return (
    <>
      {text
        .split(MARKER)
        .filter(Boolean)
        .map((chunk, index) => {
          const key = `${index}-${chunk}`;

          if (chunk.startsWith(BOLD) && chunk.endsWith(BOLD)) {
            return (
              <strong key={key} className="font-bold text-[#7a1f15]">
                {chunk.slice(BOLD.length, -BOLD.length)}
              </strong>
            );
          }

          if (chunk.startsWith(HIGHLIGHT) && chunk.endsWith(HIGHLIGHT)) {
            return (
              <mark
                key={key}
                className="bg-[#f2e2b8] px-[3px] font-semibold text-[#2b2114] decoration-clone"
              >
                {chunk.slice(HIGHLIGHT.length, -HIGHLIGHT.length)}
              </mark>
            );
          }

          return <Fragment key={key}>{chunk}</Fragment>;
        })}
    </>
  );
}
