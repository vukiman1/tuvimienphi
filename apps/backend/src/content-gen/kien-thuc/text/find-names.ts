import { escapeRegExp } from '../../check-text';

export interface NameHit<N extends string> {
  readonly name: N;
  readonly index: number;
}

function wholeWordPattern(name: string): RegExp {
  return new RegExp(`(?<!\\p{L})${escapeRegExp(name)}(?!\\p{L})`, 'gu');
}

export function findNames<N extends string>(
  clause: string,
  names: readonly N[],
): readonly NameHit<N>[] {
  const text = clause.normalize('NFC');
  const taken = new Array<boolean>(text.length).fill(false);
  const byLongestFirst = [...names].sort((a, b) => b.length - a.length);
  const hits: NameHit<N>[] = [];
  for (const name of byLongestFirst) {
    const normalized = name.normalize('NFC');
    for (const match of text.matchAll(wholeWordPattern(normalized))) {
      if (match.index === undefined) continue;
      const start = match.index;
      const end = start + normalized.length;
      let overlaps = false;
      for (let i = start; i < end; i += 1) {
        if (taken[i]) {
          overlaps = true;
          break;
        }
      }
      if (overlaps) continue;
      for (let i = start; i < end; i += 1) taken[i] = true;
      hits.push({ name, index: start });
    }
  }
  return hits.sort((a, b) => a.index - b.index);
}
