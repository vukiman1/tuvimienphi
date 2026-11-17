import { ContentKind, type EntryGroup, type PageRef } from '@org/shared-contracts';
import type { PlannedPage } from '@org/shared-kien-thuc';
import { shingleContainment, shingleSimilarity, type SimilarPair } from '../../shingle-similarity';

export const KIEN_THUC_SIMILARITY_THRESHOLD = 0.2;
export const ENTRY_LESSON_CONTAINMENT_THRESHOLD = 0.3;
export const SAME_GROUP_WARNING_THRESHOLD = 0.1;

const SCORE_DIGITS = 2;

export interface CorpusPage {
  readonly ref: PageRef;
  readonly group: EntryGroup | null;
  readonly plainText: string;
}

export interface Neighbour {
  readonly ref: PageRef;
  readonly score: number;
}

export function formatScore(score: number): string {
  return score.toFixed(SCORE_DIGITS);
}

export function groupOf(page: PlannedPage): EntryGroup | null {
  return page.kind === ContentKind.Bai ? null : page.group;
}

function isEntryLessonPair(a: CorpusPage, b: CorpusPage): boolean {
  return (a.group === null) !== (b.group === null);
}

export function closestNeighbour(
  ref: PageRef,
  plainText: string,
  corpus: readonly CorpusPage[],
): Neighbour | null {
  let best: Neighbour | null = null;
  for (const other of corpus) {
    if (other.ref === ref) continue;
    const score = shingleSimilarity(plainText, other.plainText);
    if (best === null || score > best.score) best = { ref: other.ref, score };
  }
  return best;
}

export function checkSimilarity(
  page: CorpusPage,
  corpus: readonly CorpusPage[],
): readonly string[] {
  const violations: string[] = [];
  for (const other of corpus) {
    if (other.ref === page.ref) continue;
    const jaccard = shingleSimilarity(page.plainText, other.plainText);
    if (jaccard >= KIEN_THUC_SIMILARITY_THRESHOLD) {
      violations.push(`trùng lặp với "${other.ref}" (Jaccard ${formatScore(jaccard)})`);
    }
    if (isEntryLessonPair(page, other)) {
      const containment = shingleContainment(page.plainText, other.plainText);
      if (containment >= ENTRY_LESSON_CONTAINMENT_THRESHOLD) {
        violations.push(`lặp phần lớn "${other.ref}" (chứa ${formatScore(containment)})`);
      }
    }
  }
  return violations;
}

export function similarityWarnings(
  page: CorpusPage,
  corpus: readonly CorpusPage[],
): readonly string[] {
  if (page.group === null) return [];
  const warnings: string[] = [];
  for (const other of corpus) {
    if (other.ref === page.ref || other.group !== page.group) continue;
    const jaccard = shingleSimilarity(page.plainText, other.plainText);
    if (jaccard >= SAME_GROUP_WARNING_THRESHOLD) {
      warnings.push(`gần "${other.ref}" cùng nhóm (Jaccard ${formatScore(jaccard)})`);
    }
  }
  return warnings;
}

export function findTooSimilarPages(corpus: readonly CorpusPage[]): readonly SimilarPair[] {
  const pairs: SimilarPair[] = [];
  for (let i = 0; i < corpus.length; i += 1) {
    for (let j = i + 1; j < corpus.length; j += 1) {
      const a = corpus[i];
      const b = corpus[j];
      if (a.ref === b.ref) continue;
      const jaccard = shingleSimilarity(a.plainText, b.plainText);
      if (jaccard >= KIEN_THUC_SIMILARITY_THRESHOLD) {
        pairs.push({ a: a.ref, b: b.ref, score: jaccard });
        continue;
      }
      if (isEntryLessonPair(a, b)) {
        const containment = shingleContainment(a.plainText, b.plainText);
        if (containment >= ENTRY_LESSON_CONTAINMENT_THRESHOLD) {
          pairs.push({ a: a.ref, b: b.ref, score: containment });
        }
      }
    }
  }
  return pairs.sort((left, right) => right.score - left.score);
}
