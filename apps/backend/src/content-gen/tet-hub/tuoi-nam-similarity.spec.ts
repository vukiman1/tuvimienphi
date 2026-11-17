import type { TuoiNamArticle } from '@org/shared-contracts';
import { tuoiNamSlug } from '@org/shared-tu-vi';
import {
  findTooSimilar,
  TUOI_NAM_SIMILARITY_THRESHOLD as THRESHOLD,
  tuoiNamNeighbours,
} from './tuoi-nam-similarity';

const PARAGRAPH = 'Năm nay công việc ổn định, tài chính cần thận trọng, sức khỏe nên giữ nhịp đều.';

function articleOf(birthYear: number, paragraphs: readonly string[]): TuoiNamArticle {
  return {
    slug: tuoiNamSlug(birthYear),
    birthYear,
    viewYear: 2027,
    tongQuan: paragraphs,
    saoHanNam: [],
    saoHanNu: [],
    menh: [],
    cuoiNha: [],
    loiKhuyen: [],
    faq: [],
    model: 'test-model',
    generatedAt: '2026-11-07T00:00:00.000Z',
  };
}

describe('tuoiNamNeighbours', () => {
  it('returns the same con giáp and the adjacent years in range', () => {
    expect(tuoiNamNeighbours(1986)).toEqual([1950, 1962, 1974, 1985, 1987, 1998, 2010]);
  });

  it('stays inside the supported range at the first year', () => {
    const neighbours = tuoiNamNeighbours(1950);
    expect(neighbours).toContain(2010);
    expect(neighbours).toContain(1951);
    expect(neighbours).not.toContain(1949);
  });
});

describe('findTooSimilar', () => {
  it('reports neighbours that repeat the same paragraph, once per pair', () => {
    const pairs = findTooSimilar(
      [articleOf(1986, [PARAGRAPH]), articleOf(1987, [PARAGRAPH])],
      THRESHOLD,
    );

    expect(pairs).toEqual([{ a: tuoiNamSlug(1986), b: tuoiNamSlug(1987), score: 1 }]);
  });

  it('ignores neighbours with different texts', () => {
    const pairs = findTooSimilar(
      [
        articleOf(1986, [PARAGRAPH]),
        articleOf(1987, ['Một câu hoàn toàn khác về mệnh và cung vị của người sinh năm này.']),
      ],
      THRESHOLD,
    );

    expect(pairs).toEqual([]);
  });

  it('ignores identical texts that are not neighbours', () => {
    const pairs = findTooSimilar(
      [articleOf(1986, [PARAGRAPH]), articleOf(1990, [PARAGRAPH])],
      THRESHOLD,
    );

    expect(pairs).toEqual([]);
  });

  it('sorts pairs by score, highest first', () => {
    const half = `${PARAGRAPH} Phần này chỉ riêng một bài viết có mà bài kia không hề nhắc tới.`;
    const pairs = findTooSimilar(
      [articleOf(1986, [PARAGRAPH]), articleOf(1987, [half]), articleOf(1998, [PARAGRAPH])],
      0.1,
    );

    expect(pairs.map((pair) => pair.score)).toEqual(
      [...pairs.map((pair) => pair.score)].sort((x, y) => y - x),
    );
    expect(pairs[0].score).toBe(1);
  });
});
