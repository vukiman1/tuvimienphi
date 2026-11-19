import type { KienThucSearchItem } from '@org/shared-contracts';

export const MAX_SEARCH_RESULTS = 8;

const COMBINING_MARKS = /\p{M}/gu;
const WHITESPACE_RUN = /\s+/g;
const D_STROKE = /[đĐ]/g;

enum MatchRank {
  TitlePrefix = 0,
  TitleSubstring = 1,
  Alias = 2,
}

interface RankedItem {
  readonly item: KienThucSearchItem;
  readonly rank: MatchRank;
}

export function normalizeForSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(D_STROKE, 'd')
    .toLowerCase()
    .replace(WHITESPACE_RUN, ' ')
    .trim();
}

function rankOf(item: KienThucSearchItem, query: string): MatchRank | undefined {
  const title = normalizeForSearch(item.title);
  if (title.startsWith(query)) {
    return MatchRank.TitlePrefix;
  }
  if (title.includes(query)) {
    return MatchRank.TitleSubstring;
  }
  if (item.aliases.some((alias) => normalizeForSearch(alias).includes(query))) {
    return MatchRank.Alias;
  }
  return undefined;
}

function rankedItem(item: KienThucSearchItem, query: string): readonly RankedItem[] {
  const rank = rankOf(item, query);
  return rank === undefined ? [] : [{ item, rank }];
}

export function searchKienThuc(
  index: readonly KienThucSearchItem[],
  query: string,
): readonly KienThucSearchItem[] {
  const normalizedQuery = normalizeForSearch(query);
  if (normalizedQuery === '') {
    return [];
  }
  return index
    .flatMap((item) => rankedItem(item, normalizedQuery))
    .sort((left, right) => left.rank - right.rank)
    .slice(0, MAX_SEARCH_RESULTS)
    .map(({ item }) => item);
}
