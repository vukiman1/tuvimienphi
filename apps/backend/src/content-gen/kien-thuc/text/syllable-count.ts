import { toPlainText } from './link-markup';

export const SYLLABLES_PER_MINUTE = 180;

const WHITESPACE = /\s+/u;
const WORD_CHARACTER = /[\p{L}\p{N}]/u;

export function countSyllables(text: string): number {
  return toPlainText(text)
    .split(WHITESPACE)
    .filter((token) => WORD_CHARACTER.test(token)).length;
}

export function readingMinutes(syllables: number): number {
  return Math.ceil(syllables / SYLLABLES_PER_MINUTE);
}
