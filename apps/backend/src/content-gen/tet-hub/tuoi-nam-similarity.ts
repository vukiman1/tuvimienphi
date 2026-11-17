import type { TuoiNamArticle } from '@org/shared-contracts';
import { tuoiNamBirthYears, tuoiNamSlug } from '@org/shared-tu-vi';
import { shingleSimilarity, type SimilarPair } from '../shingle-similarity';

export const TUOI_NAM_SIMILARITY_THRESHOLD = 0.35;

const YEARS_PER_CHI_CYCLE = 12;

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
