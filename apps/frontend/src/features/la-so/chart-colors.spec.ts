import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { compositeOver, contrastRatio } from '@/design-system/contrast';
import { CHART_RULE_CLASS, CUNG_STATE_CLASS, CUNG_SURFACE_CLASS } from './chart-colors';

const AA_NON_TEXT = 3;
const PERCENT = 100;
const COLOR_TOKEN = /--color-([\w-]+):\s*(#[0-9a-fA-F]{6})/g;
const GOLD_ALPHA = /gold\/(\d+)/;

function readColorTokens(): ReadonlyMap<string, string> {
  const css = readFileSync(join(__dirname, '..', '..', 'design-system', 'tokens.css'), 'utf8');
  return new Map([...css.matchAll(COLOR_TOKEN)].map(([, name, value]) => [name, value]));
}

const TOKENS = readColorTokens();

function token(name: string): string {
  const value = TOKENS.get(name);
  if (value === undefined) {
    throw new Error(`tokens.css does not define --color-${name}`);
  }
  return value;
}

function goldAlphaOf(classes: string): number {
  const match = GOLD_ALPHA.exec(classes);
  if (match === null) {
    throw new Error(`"${classes}" carries no gold/<alpha> class`);
  }
  return Number(match[1]) / PERCENT;
}

describe('night board contrast', () => {
  const night = token('night');
  const gold = token('gold');
  const spotlight = compositeOver(gold, goldAlphaOf(CUNG_SURFACE_CLASS.spotlight), night);
  const cellSurfaces = [night, spotlight];

  it('keeps the board rules visible against both cell surfaces', () => {
    const rule = compositeOver(gold, goldAlphaOf(CHART_RULE_CLASS.fill), night);

    for (const surface of cellSurfaces) {
      expect(contrastRatio(rule, surface)).toBeGreaterThanOrEqual(AA_NON_TEXT);
    }
  });

  it('keeps the related ring visible on both cell surfaces', () => {
    const ringAlpha = goldAlphaOf(CUNG_STATE_CLASS.related);

    for (const surface of cellSurfaces) {
      expect(
        contrastRatio(compositeOver(gold, ringAlpha, surface), surface),
      ).toBeGreaterThanOrEqual(AA_NON_TEXT);
    }
  });
});
