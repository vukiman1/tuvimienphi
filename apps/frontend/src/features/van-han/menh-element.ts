export const MENH_ELEMENTS = ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'] as const;

export type MenhElement = (typeof MENH_ELEMENTS)[number];

const FALLBACK_ELEMENT: MenhElement = 'Thổ';
const WORD_SEPARATOR = ' ';

const OLD_STYLE_ALIASES: Readonly<Record<string, MenhElement>> = {
  Thuỷ: 'Thủy',
  Hoả: 'Hỏa',
};

function isMenhElement(value: string): value is MenhElement {
  return MENH_ELEMENTS.some((element) => element === value);
}

export function elementOfMenh(menh: string): MenhElement {
  const words = menh.split(WORD_SEPARATOR);
  const lastWord = words[words.length - 1];
  if (isMenhElement(lastWord)) return lastWord;
  return OLD_STYLE_ALIASES[lastWord] ?? FALLBACK_ELEMENT;
}
