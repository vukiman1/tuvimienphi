import type { ContentSection } from '@org/shared-contracts';
import { keepFirstLinkPerTarget, scanLinks, toPlainText } from './link-markup';

describe('scanLinks', () => {
  it('reads kind, slug and label from a link', () => {
    const scan = scanLinks('Có [[thuat-ngu/can|can]] và [[bai/tuan-va-triet|Tuần, Triệt]].');

    expect(scan.malformed).toEqual([]);
    expect(scan.links).toEqual([
      { ref: 'thuat-ngu/can', label: 'can' },
      { ref: 'bai/tuan-va-triet', label: 'Tuần, Triệt' },
    ]);
  });

  it('reports markup that is not a whole link', () => {
    expect(scanLinks('[[sao/thien co|x]]').malformed).toContain('[[sao/thien co|x]]');
    expect(scanLinks('[[sao/thien-co]]').malformed).toContain('[[sao/thien-co]]');
    expect(scanLinks('[[ghi-chu/x|y]]').malformed).toContain('[[ghi-chu/x|y]]');
    expect(scanLinks('[[sao/thien-co|]]').malformed).toContain('[[sao/thien-co|]]');
    expect(scanLinks('mở đầu [[ rồi thôi').malformed).toContain('[[');
  });
});

describe('toPlainText', () => {
  it('reduces links to their labels', () => {
    expect(toPlainText('Có [[thuat-ngu/can|can]] và [[bai/tuan-va-triet|Tuần, Triệt]].')).toBe(
      'Có can và Tuần, Triệt.',
    );
  });
});

describe('keepFirstLinkPerTarget', () => {
  it('keeps only the first link to each target', () => {
    const sections: readonly ContentSection[] = [
      { heading: 'Một', paragraphs: ['Xem [[sao/thien-co|Thiên Cơ]] và [[bai/tu-vi-la-gi|bài]].'] },
      { heading: 'Hai', paragraphs: ['Lại [[sao/thien-co|Thiên Cơ]] lần nữa.'] },
    ];

    const reduced = keepFirstLinkPerTarget(sections);

    expect(reduced[0].paragraphs[0]).toBe(
      'Xem [[sao/thien-co|Thiên Cơ]] và [[bai/tu-vi-la-gi|bài]].',
    );
    expect(reduced[1].paragraphs[0]).toBe('Lại Thiên Cơ lần nữa.');
  });
});
