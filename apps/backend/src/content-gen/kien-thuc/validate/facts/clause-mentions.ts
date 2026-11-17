import { ContentKind } from '@org/shared-contracts';
import { CHI, CHINH_TINH_NAMES, CUNG_NAMES, PHU_TINH_NAMES, type SaoName } from '@org/shared-tu-vi';
import { KIEN_THUC_ENTRIES } from '@org/shared-kien-thuc';
import { escapeRegExp } from '../../../check-text';
import { findNames, type NameHit } from '../../text/find-names';

const ALL_STAR_NAMES: readonly SaoName[] = [...CHINH_TINH_NAMES, ...PHU_TINH_NAMES];
const CUNG_NAME_SET: ReadonlySet<string> = new Set(CUNG_NAMES);
const CHOM_OR_CUNG_BEFORE = /(?<!\p{L})(?:chòm|cung) $/iu;
const CUNG_BEFORE = /(?<!\p{L})cung $/iu;
const THAN = 'Thân';
const THAN_CU_AFTER = /^ cư(?!\p{L})/u;

interface PairAlias {
  readonly alias: string;
  readonly stars: readonly [SaoName, SaoName];
}

const PAIR_ALIASES: readonly PairAlias[] = buildPairAliases();

function buildPairAliases(): readonly PairAlias[] {
  const byAlias = new Map<string, SaoName[]>();
  for (const entry of KIEN_THUC_ENTRIES) {
    if (entry.kind !== ContentKind.Sao) continue;
    for (const alias of entry.aliases) {
      const stars = byAlias.get(alias) ?? [];
      stars.push(entry.star);
      byAlias.set(alias, stars);
    }
  }
  const pairs: PairAlias[] = [];
  for (const [alias, stars] of byAlias) {
    if (stars.length === 2) pairs.push({ alias, stars: [stars[0], stars[1]] });
  }
  return pairs;
}

function wholeWordPattern(name: string): RegExp {
  return new RegExp(`(?<!\\p{L})${escapeRegExp(name)}(?!\\p{L})`, 'gu');
}

export function starsIn(clause: string): readonly NameHit<SaoName>[] {
  const text = clause.normalize('NFC');
  const direct = findNames(text, ALL_STAR_NAMES).filter((hit) => {
    if (CHOM_OR_CUNG_BEFORE.test(text.slice(0, hit.index))) return false;
    if (CUNG_NAME_SET.has(hit.name)) return false;
    return true;
  });
  const aliasHits: NameHit<SaoName>[] = [];
  for (const { alias, stars } of PAIR_ALIASES) {
    for (const match of text.matchAll(wholeWordPattern(alias))) {
      if (match.index === undefined) continue;
      aliasHits.push({ name: stars[0], index: match.index });
      aliasHits.push({ name: stars[1], index: match.index });
    }
  }
  return [...direct, ...aliasHits].sort((a, b) => a.index - b.index);
}

export function chisIn(clause: string): readonly NameHit<string>[] {
  const text = clause.normalize('NFC');
  return findNames(text, CHI).filter((hit) => {
    if (CUNG_BEFORE.test(text.slice(0, hit.index))) return false;
    if (hit.name === THAN && THAN_CU_AFTER.test(text.slice(hit.index + hit.name.length))) {
      return false;
    }
    return true;
  });
}
