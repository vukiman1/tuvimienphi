import type { IndexTile } from './route-data/index-route';

const GLOSSARY_LOCALE = 'vi';
const LETTER_ANCHOR_PREFIX = 'chu-';
const LETTER_ANCHOR_OVERRIDES: Readonly<Record<string, string>> = { đ: 'dd' };

export interface LetterGroup {
  readonly letter: string;
  readonly tiles: readonly IndexTile[];
}

export function glossaryLetter(title: string): string {
  return title.charAt(0).toLocaleUpperCase(GLOSSARY_LOCALE);
}

export function letterAnchor(letter: string): string {
  const lowerCase = letter.toLocaleLowerCase(GLOSSARY_LOCALE);
  return `${LETTER_ANCHOR_PREFIX}${LETTER_ANCHOR_OVERRIDES[lowerCase] ?? lowerCase}`;
}

export function sortGlossary(tiles: readonly IndexTile[]): readonly IndexTile[] {
  return [...tiles].sort((first, second) =>
    first.entry.title.localeCompare(second.entry.title, GLOSSARY_LOCALE),
  );
}

export function groupByLetter(sortedTiles: readonly IndexTile[]): readonly LetterGroup[] {
  return sortedTiles.reduce<readonly LetterGroup[]>((groups, tile) => {
    const letter = glossaryLetter(tile.entry.title);
    const last = groups[groups.length - 1];
    if (last?.letter === letter) {
      return [...groups.slice(0, -1), { letter, tiles: [...last.tiles, tile] }];
    }
    return [...groups, { letter, tiles: [tile] }];
  }, []);
}
