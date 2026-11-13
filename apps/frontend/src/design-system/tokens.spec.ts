import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { contrastRatio } from './contrast';

const AA_NORMAL_TEXT = 4.5;
const AA_NON_TEXT = 3;
const COLOR_TOKEN = /--color-([\w-]+):\s*(#[0-9a-fA-F]{6})/g;
const CHART_TOKEN_PREFIXES = ['hanh-', 'chart-block'] as const;
const DARK_TONES = ['night', 'deep', 'dusk'] as const;

const SPECIFIED_PALETTE = {
  night: '#0e1222',
  deep: '#1b2a4a',
  dusk: '#6b3a4d',
  ember: '#d9623b',
  dawn: '#f2c879',
  day: '#f7f2e7',
  ink: '#15131a',
  gold: '#f2b441',
  'ink-soft': '#5b5458',
  'day-soft': '#c9c2b4',
} as const;

function readColorTokens(): ReadonlyMap<string, string> {
  const css = readFileSync(join(__dirname, 'tokens.css'), 'utf8');
  return new Map([...css.matchAll(COLOR_TOKEN)].map(([, name, value]) => [name, value]));
}

const TOKENS = readColorTokens();
const SEMANTIC_TOKEN = /^\s*--([\w-]+):\s*var\(--color-([\w-]+)\);/gm;

function readSemanticTokens(): ReadonlyMap<string, string> {
  const css = readFileSync(join(__dirname, '..', 'styles.css'), 'utf8');
  const rootBlock = css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {')));
  return new Map([...rootBlock.matchAll(SEMANTIC_TOKEN)].map(([, name, colour]) => [name, colour]));
}

const SEMANTIC = readSemanticTokens();

function semantic(name: string): string {
  const colour = SEMANTIC.get(name);
  if (colour === undefined) {
    throw new Error(`styles.css :root does not map --${name} onto a palette token`);
  }
  return token(colour);
}

function token(name: string): string {
  const value = TOKENS.get(name);
  if (value === undefined) {
    throw new Error(`tokens.css does not define --color-${name}`);
  }
  return value;
}

describe('contrastRatio', () => {
  it('gives 21 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });

  it('gives about 4.48 for mid grey on white', () => {
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
  });

  it('does not depend on which colour is the foreground', () => {
    expect(contrastRatio('#d9623b', '#15131a')).toBe(contrastRatio('#15131a', '#d9623b'));
  });
});

describe('design tokens', () => {
  it('keeps the palette exactly as specified', () => {
    for (const [name, value] of Object.entries(SPECIFIED_PALETTE)) {
      expect(token(name).toLowerCase()).toBe(value);
    }
  });

  it('dark chapters take day text', () => {
    for (const tone of DARK_TONES) {
      expect(contrastRatio(token('day'), token(tone))).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    }
  });

  it('ember takes ink, never day', () => {
    expect(contrastRatio(token('ink'), token('ember'))).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(contrastRatio(token('day'), token('ember'))).toBeLessThan(AA_NORMAL_TEXT);
  });

  it('light chapters take ink', () => {
    expect(contrastRatio(token('ink'), token('dawn'))).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(contrastRatio(token('ink'), token('day'))).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it('gold is a fill on light surfaces, never text', () => {
    expect(contrastRatio(token('gold'), token('day'))).toBeLessThan(AA_NON_TEXT);
    expect(contrastRatio(token('ink'), token('gold'))).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it('gold text is readable on every dark chapter', () => {
    for (const tone of DARK_TONES) {
      expect(contrastRatio(token('gold'), token(tone))).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    }
  });

  it('muted text passes AA', () => {
    for (const surface of ['day', 'day-200', 'dawn']) {
      expect(contrastRatio(token('ink-soft'), token(surface))).toBeGreaterThanOrEqual(
        AA_NORMAL_TEXT,
      );
    }
    for (const tone of DARK_TONES) {
      expect(contrastRatio(token('day-soft'), token(tone))).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    }
  });

  it('dawn eyebrows and labels are readable on night', () => {
    expect(contrastRatio(token('dawn'), token('night'))).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it('dawn text is readable on deep', () => {
    expect(contrastRatio(token('dawn'), token('deep'))).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it('ink text is readable on the day-200 surface', () => {
    expect(contrastRatio(token('ink'), token('day-200'))).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it('the two-tone focus ring stays visible on every chapter tone', () => {
    for (const tone of ['ember', 'dawn', 'day']) {
      expect(contrastRatio(token('ink'), token(tone))).toBeGreaterThanOrEqual(AA_NON_TEXT);
    }
    for (const tone of DARK_TONES) {
      expect(contrastRatio(token('day'), token(tone))).toBeGreaterThanOrEqual(AA_NON_TEXT);
    }
  });

  it('every chart data colour passes AA on day', () => {
    const chartTokens = [...TOKENS].filter(([name]) =>
      CHART_TOKEN_PREFIXES.some((prefix) => name.startsWith(prefix)),
    );

    expect(chartTokens.length).toBe(6);
    for (const [, value] of chartTokens) {
      expect(contrastRatio(value, token('day'))).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    }
  });
});

describe('semantic tokens', () => {
  it('primary text is readable on the page', () => {
    expect(contrastRatio(semantic('primary'), semantic('background'))).toBeGreaterThanOrEqual(
      AA_NORMAL_TEXT,
    );
  });

  it('primary fills carry readable text', () => {
    expect(
      contrastRatio(semantic('primary-foreground'), semantic('primary')),
    ).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it('error text is readable on the page and on muted surfaces', () => {
    for (const surface of ['background', 'muted']) {
      expect(contrastRatio(semantic('destructive'), semantic(surface))).toBeGreaterThanOrEqual(
        AA_NORMAL_TEXT,
      );
    }
  });

  it('muted text is readable on the page and on muted surfaces', () => {
    for (const surface of ['background', 'muted']) {
      expect(contrastRatio(semantic('muted-foreground'), semantic(surface))).toBeGreaterThanOrEqual(
        AA_NORMAL_TEXT,
      );
    }
  });
});
