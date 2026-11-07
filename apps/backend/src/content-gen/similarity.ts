import type { TuoiNamArticle } from '@org/shared-contracts';
import { tuoiNamBirthYears, tuoiNamSlug } from '@org/shared-tu-vi';

export const TUOI_NAM_SIMILARITY_THRESHOLD = 0.35;

const DEFAULT_SHINGLE_SIZE = 5;
const YEARS_PER_CHI_CYCLE = 12;
const NON_WORD_CHARACTERS = /[^\p{L}\p{N}]+/gu;

export interface SimilarPair {
  readonly a: string;
  readonly b: string;
  readonly score: number;
}

function toWords(text: string): readonly string[] {
  return text.toLowerCase().replace(NON_WORD_CHARACTERS, ' ').split(' ').filter(Boolean);
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

export function tuoiNamNeighbours(birthYear: number): readonly number[] {
  return tuoiNamBirthYears().filter((year) => {
    const distance = Math.abs(year - birthYear);
    return distance === 1 || (distance > 0 && distance % YEARS_PER_CHI_CYCLE === 0);
  });
}

function articleText(article: TuoiNamArticle): string {
  return [
    ...article.tongQuan,
    ...article.saoHanNam,
    ...article.saoHanNu,
    ...article.menh,
    ...article.cuoiNha,
    ...article.loiKhuyen,
    ...article.faq.map((entry) => entry.answer),
  ].join(' ');
}

export function findTooSimilar(
  articles: readonly TuoiNamArticle[],
  threshold: number,
): readonly SimilarPair[] {
  const byBirthYear = new Map(articles.map((article) => [article.birthYear, article]));
  const pairs: SimilarPair[] = [];
  for (const article of articles) {
    for (const neighbourYear of tuoiNamNeighbours(article.birthYear)) {
      const neighbour = byBirthYear.get(neighbourYear);
      if (neighbour === undefined || neighbourYear < article.birthYear) continue;
      const score = shingleSimilarity(articleText(article), articleText(neighbour));
      if (score < threshold) continue;
      pairs.push({ a: tuoiNamSlug(article.birthYear), b: tuoiNamSlug(neighbourYear), score });
    }
  }
  return pairs.sort((left, right) => right.score - left.score);
}
