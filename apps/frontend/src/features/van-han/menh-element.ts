export const MENH_ELEMENTS = ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'] as const;

export type MenhElement = (typeof MENH_ELEMENTS)[number];

const FALLBACK_ELEMENT: MenhElement = 'Thổ';
const WORD_SEPARATOR = ' ';

function isMenhElement(value: string): value is MenhElement {
  return MENH_ELEMENTS.some((element) => element === value);
}

export function elementOfMenh(menh: string): MenhElement {
  const words = menh.split(WORD_SEPARATOR);
  const lastWord = words[words.length - 1];
  return isMenhElement(lastWord) ? lastWord : FALLBACK_ELEMENT;
}
