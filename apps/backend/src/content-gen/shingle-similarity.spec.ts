import { shingleContainment, shingleSimilarity } from './shingle-similarity';

const PARAGRAPH = 'Năm nay công việc ổn định, tài chính cần thận trọng, sức khỏe nên giữ nhịp đều.';

describe('shingleSimilarity', () => {
  it('scores identical texts as 1', () => {
    expect(shingleSimilarity(PARAGRAPH, PARAGRAPH)).toBe(1);
  });

  it('scores texts with no shared words as 0', () => {
    expect(
      shingleSimilarity('một hai ba bốn năm sáu bảy', 'tám chín mười mười một mười hai mười ba'),
    ).toBe(0);
  });

  it('compares a text shorter than one shingle as a whole', () => {
    expect(shingleSimilarity('Xin chào', 'xin chào!')).toBe(1);
    expect(shingleSimilarity('Xin chào', 'Tạm biệt')).toBe(0);
  });

  it('treats composed and decomposed accents as the same text', () => {
    expect(shingleSimilarity('tuổi mùi', 'tuổi mùi'.normalize('NFD'))).toBe(1);
  });

  it('scores two empty texts as 0', () => {
    expect(shingleSimilarity('', '')).toBe(0);
  });

  it('ignores case and punctuation', () => {
    expect(shingleSimilarity(PARAGRAPH, PARAGRAPH.toUpperCase().replace(/,/g, ''))).toBe(1);
  });
});

describe('shingleContainment', () => {
  it('measures containment against the shorter text', () => {
    const shorter = Array.from({ length: 20 }, (_, i) => `w${i}`).join(' ');
    const longer = `${shorter} ${Array.from({ length: 20 }, (_, i) => `x${i}`).join(' ')}`;

    expect(shingleContainment(shorter, longer)).toBe(1);
    expect(shingleSimilarity(shorter, longer)).toBeGreaterThan(0.3);
    expect(shingleSimilarity(shorter, longer)).toBeLessThan(0.6);
  });
});
