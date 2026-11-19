import { ContentKind, EntryGroup } from '@org/shared-contracts';
import type { IndexTile } from './route-data/index-route';
import { glossaryLetter, letterAnchor, sortGlossary } from './glossary-order';

function tileTitled(title: string): IndexTile {
  return {
    entry: {
      kind: ContentKind.ThuatNgu,
      group: EntryGroup.ThuatNgu,
      slug: title,
      title,
      learnInLesson: 'tu-vi-la-gi',
      reviewedAt: '2026-01-01',
    },
    summary: '',
  };
}

describe('glossary order', () => {
  it('files a term under its first letter, keeping Đ apart from D', () => {
    expect(glossaryLetter('Địa chi')).toBe('Đ');
    expect(glossaryLetter('Cục')).toBe('C');
    expect(letterAnchor('Đ')).toBe('chu-dd');
    expect(letterAnchor('C')).toBe('chu-c');
  });

  it('sorts the glossary in Vietnamese order', () => {
    const sorted = sortGlossary(['Thiên can', 'Địa chi', 'Cục'].map(tileTitled));

    expect(sorted.map((tile) => tile.entry.title)).toEqual(['Cục', 'Địa chi', 'Thiên can']);
  });
});
