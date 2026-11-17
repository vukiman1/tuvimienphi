import { EntryGroup, type PageRef } from '@org/shared-contracts';
import {
  checkSimilarity,
  findTooSimilarPages,
  similarityWarnings,
  type CorpusPage,
} from './check-similarity';

function words(prefix: string, count: number): string {
  return Array.from({ length: count }, (_, i) => `${prefix}${i}`).join(' ');
}

function entry(ref: PageRef, plainText: string): CorpusPage {
  return { ref, group: EntryGroup.ChinhTinh, plainText };
}

function lesson(ref: PageRef, plainText: string): CorpusPage {
  return { ref, group: null, plainText };
}

const LESSON_TEXT = words('w', 1000);
const HALF_COPY = `${words('w', 150)} ${words('e', 150)}`;

describe('checkSimilarity', () => {
  it('rejects a draft that repeats another page', () => {
    const text = words('w', 100);
    const violations = checkSimilarity(entry('sao/thien-co', text), [
      entry('sao/thai-duong', text),
    ]);
    expect(violations.some((m) => m.includes('sao/thai-duong') && m.includes('1.00'))).toBe(true);
  });

  it('catches an entry that copies half a lesson by containment', () => {
    const violations = checkSimilarity(entry('sao/thien-co', HALF_COPY), [
      lesson('bai/y-nghia-chinh-tinh', LESSON_TEXT),
    ]);
    expect(violations.some((m) => m.includes('bai/y-nghia-chinh-tinh') && m.includes('chứa'))).toBe(
      true,
    );
    expect(violations.some((m) => m.includes('Jaccard'))).toBe(false);
  });

  it('does not apply containment between two entries', () => {
    expect(
      checkSimilarity(entry('sao/thien-co', HALF_COPY), [entry('sao/thai-duong', LESSON_TEXT)]),
    ).toEqual([]);
  });

  it('ignores the page own earlier version', () => {
    const text = words('w', 100);
    expect(checkSimilarity(entry('sao/thien-co', text), [entry('sao/thien-co', text)])).toEqual([]);
  });
});

describe('similarityWarnings', () => {
  it('warns, without rejecting, on a same-group pair at 0.10', () => {
    const page = entry('sao/thien-co', words('w', 200));
    const other = entry('sao/thai-duong', `${words('w', 50)} ${words('y', 150)}`);
    expect(similarityWarnings(page, [other]).length).toBeGreaterThan(0);
    expect(checkSimilarity(page, [other])).toEqual([]);
  });
});

describe('findTooSimilarPages', () => {
  it('reports each too-similar pair once, highest first', () => {
    const textP = words('p', 100);
    const textQ = words('q', 100);
    const pairs = findTooSimilarPages([
      entry('sao/a', textP),
      entry('sao/b', textP),
      entry('sao/c', textQ),
      entry('sao/d', textQ),
    ]);
    expect(pairs).toHaveLength(2);
    expect(pairs.map((pair) => pair.score)).toEqual(
      [...pairs.map((pair) => pair.score)].sort((x, y) => y - x),
    );
  });

  it('never pairs a page with itself', () => {
    const text = words('p', 100);
    expect(findTooSimilarPages([entry('sao/a', text), entry('sao/a', text)])).toEqual([]);
  });
});
