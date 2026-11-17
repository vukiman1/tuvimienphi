import {
  ContentKind,
  EntryGroup,
  ENTRY_GROUPS_BY_KIND,
  contentFilePath,
  isContentSlug,
  isReservedLessonSlug,
  pageRef,
  parsePageRef,
} from './kien-thuc.js';

describe('kien-thuc contracts', () => {
  it('files a lesson under bai and an entry under its kind', () => {
    expect(contentFilePath(ContentKind.Bai, 'tu-vi-la-gi')).toBe('bai/tu-vi-la-gi.json');
    expect(contentFilePath(ContentKind.ThuatNgu, 'can')).toBe('thuat-ngu/can.json');
  });

  it('reserves the index segments and every Tết hub year', () => {
    expect(isReservedLessonSlug('sao')).toBe(true);
    expect(isReservedLessonSlug('cung')).toBe(true);
    expect(isReservedLessonSlug('thuat-ngu')).toBe(true);
    expect(isReservedLessonSlug('tu-vi-2027')).toBe(true);
    expect(isReservedLessonSlug('tu-vi-2031')).toBe(true);
    expect(isReservedLessonSlug('tu-vi-la-gi')).toBe(false);
    expect(isReservedLessonSlug('12-cung-tu-vi')).toBe(false);
  });

  it('accepts kebab-case slugs up to 80 characters', () => {
    expect(isContentSlug('tam-hop-xung-chieu')).toBe(true);
    expect(isContentSlug('12-cung-tu-vi')).toBe(true);
    expect(isContentSlug('Tam-hop')).toBe(false);
    expect(isContentSlug('tam_hop')).toBe(false);
    expect(isContentSlug('-tam')).toBe(false);
    expect(isContentSlug('tam--hop')).toBe(false);
    expect(isContentSlug('thiên-cơ')).toBe(false);
    expect(isContentSlug('a'.repeat(81))).toBe(false);
    expect(isContentSlug('a'.repeat(80))).toBe(true);
  });

  it('lists the groups each entry kind sorts by', () => {
    expect(ENTRY_GROUPS_BY_KIND[ContentKind.Sao]).toEqual([
      EntryGroup.ChinhTinh,
      EntryGroup.TuHoa,
      EntryGroup.PhuTinh,
    ]);
    expect(ENTRY_GROUPS_BY_KIND[ContentKind.Cung]).toEqual([EntryGroup.Cung]);
    expect(ENTRY_GROUPS_BY_KIND[ContentKind.ThuatNgu]).toEqual([
      EntryGroup.NguHanh,
      EntryGroup.ThuatNgu,
    ]);
  });

  it('joins a kind and a slug into a page ref and reads it back', () => {
    expect(pageRef(ContentKind.Sao, 'thien-co')).toBe('sao/thien-co');
    expect(parsePageRef('sao/thien-co')).toEqual({ kind: ContentKind.Sao, slug: 'thien-co' });
    expect(parsePageRef('ghi-chu/x')).toBeNull();
    expect(parsePageRef('sao/Thien')).toBeNull();
    expect(parsePageRef('sao')).toBeNull();
  });
});
