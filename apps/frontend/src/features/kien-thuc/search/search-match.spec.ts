import { ContentKind } from '@org/shared-contracts';
import type { KienThucSearchItem } from '@org/shared-contracts';
import { FIXTURE_SOURCE } from '../__fixtures__/fixture-source';
import { MAX_SEARCH_RESULTS, normalizeForSearch, searchKienThuc } from './search-match';

function item(title: string, aliases: readonly string[] = []): KienThucSearchItem {
  return { kind: ContentKind.Cung, slug: title, title, aliases, summary: '' };
}

function titles(items: readonly KienThucSearchItem[]): readonly string[] {
  return items.map((found) => found.title);
}

describe('normalizeForSearch', () => {
  it('collapses whitespace and maps Đ to d', () => {
    expect(normalizeForSearch('  ĐỊA   Kiếp ')).toBe('dia kiep');
  });
});

describe('searchKienThuc', () => {
  let index: readonly KienThucSearchItem[] = [];

  beforeAll(async () => {
    index = await FIXTURE_SOURCE.loadSearchIndex();
  });

  it('ignores diacritics and case', () => {
    expect(titles(searchKienThuc(index, 'thien co'))).toEqual(['Sao Thiên Cơ']);
    expect(titles(searchKienThuc(index, 'THIÊN CƠ'))).toEqual(['Sao Thiên Cơ']);
  });

  it('matches đ with d', () => {
    expect(titles(searchKienThuc(index, 'dia'))).toContain('Sao Địa Kiếp');
  });

  it('finds an entry by its alias', () => {
    const aliased = [item('Cung Phu Thê', ['cung vợ chồng'])];

    expect(titles(searchKienThuc(aliased, 'vo chong'))).toEqual(['Cung Phu Thê']);
  });

  it('ranks title prefixes, then title matches, then aliases', () => {
    const items = [
      item('Cung Phụ', ['mệnh cung']),
      item('Cung Tài Bạch'),
      item('Sao Mệnh Chủ'),
      item('Mệnh Cung'),
    ];

    expect(titles(searchKienThuc(items, 'menh'))).toEqual([
      'Mệnh Cung',
      'Sao Mệnh Chủ',
      'Cung Phụ',
    ]);
  });

  it('keeps index order between equally ranked hits', () => {
    const items = [item('Sao B'), item('Sao A')];

    expect(titles(searchKienThuc(items, 'sao'))).toEqual(['Sao B', 'Sao A']);
  });

  it('returns nothing for a blank query', () => {
    expect(searchKienThuc(index, '   ')).toEqual([]);
  });

  it('returns at most eight hits', () => {
    const many = Array.from({ length: MAX_SEARCH_RESULTS + 3 }, (_, number) =>
      item(`Sao ${String(number)}`),
    );

    expect(searchKienThuc(many, 'sao')).toHaveLength(MAX_SEARCH_RESULTS);
  });
});
