const DEFAULT_SHINGLE_SIZE = 5;
const NON_WORD_CHARACTERS = /[^\p{L}\p{N}]+/gu;

export interface SimilarPair {
  readonly a: string;
  readonly b: string;
  readonly score: number;
}

function toWords(text: string): readonly string[] {
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(NON_WORD_CHARACTERS, ' ')
    .split(' ')
    .filter(Boolean);
}

function toShingles(text: string, size: number): ReadonlySet<string> {
  const words = toWords(text);
  if (words.length <= size) return new Set(words.length === 0 ? [] : [words.join(' ')]);
  return new Set(
    Array.from({ length: words.length - size + 1 }, (_, start) =>
      words.slice(start, start + size).join(' '),
    ),
  );
}

export function shingleSimilarity(
  a: string,
  b: string,
  size: number = DEFAULT_SHINGLE_SIZE,
): number {
  const shinglesA = toShingles(a, size);
  const shinglesB = toShingles(b, size);
  const shared = [...shinglesA].filter((shingle) => shinglesB.has(shingle)).length;
  const union = shinglesA.size + shinglesB.size - shared;
  return union === 0 ? 0 : shared / union;
}

export function shingleContainment(
  a: string,
  b: string,
  size: number = DEFAULT_SHINGLE_SIZE,
): number {
  const shinglesA = toShingles(a, size);
  const shinglesB = toShingles(b, size);
  const shared = [...shinglesA].filter((shingle) => shinglesB.has(shingle)).length;
  const shorter = Math.min(shinglesA.size, shinglesB.size);
  return shorter === 0 ? 0 : shared / shorter;
}
