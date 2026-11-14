import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { compositeOver, contrastRatio } from './contrast';

const AA_NORMAL_TEXT = 4.5;
const AA_NON_TEXT = 3;
const COLOR_TOKEN = /--color-([\w-]+):\s*(#[0-9a-fA-F]{6})/g;
const CHART_TOKEN_PREFIXES = ['hanh-', 'chart-block'] as const;
const DARK_TONES = ['night', 'deep', 'dusk'] as const;
const SPOTLIGHT_TINT_ALPHA = 0.1;
const NIGHT_SPOTLIGHT_ALPHA = 0.12;
const BOARD_RULE_ALPHA = 0.55;
const RELATED_RING_ALPHA = 0.6;
const NIGHT_STAR_TOKENS = ['kim', 'moc', 'thuy', 'hoa', 'tho'].map((hanh) => `hanh-${hanh}-night`);
const TAB_TRACK_ALPHA = 0.4;
const UNAVAILABLE_TAB_ALPHA = 0.55;
const KEY_PHRASE_WASH_ALPHA = 0.6;
const BOARD_GRAPHIC_TOKENS = ['deep', 'ember', 'ink'] as const;
const TOAST_ICON_TINTS = [
  { icon: 'hanh-tho', tint: 'gold', alpha: 0.2 },
  { icon: 'danger', tint: 'ember', alpha: 0.15 },
  { icon: 'deep', tint: 'deep', alpha: 0.1 },
] as const;

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

describe('compositeOver', () => {
  it('blends a translucent colour over an opaque one', () => {
    expect(compositeOver('#ffffff', 0.5, '#000000')).toBe('#808080');
  });

  it('keeps the background when the colour is fully transparent', () => {
    expect(compositeOver('#d9623b', 0, '#f7f2e7')).toBe('#f7f2e7');
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

  it('toast icons stand out from their tint on day', () => {
    for (const { icon, tint, alpha } of TOAST_ICON_TINTS) {
      const tintOnDay = compositeOver(token(tint), alpha, token('day'));
      expect(contrastRatio(token(icon), tintOnDay)).toBeGreaterThanOrEqual(AA_NON_TEXT);
    }
  });

  it('every chart data colour passes AA on the spotlight tint', () => {
    const tint = compositeOver(token('gold'), SPOTLIGHT_TINT_ALPHA, token('day'));
    const hanhTokens = [...TOKENS].filter(
      ([name]) => name.startsWith('hanh-') && !name.endsWith('-night'),
    );

    expect(hanhTokens.length).toBe(5);
    for (const [, value] of hanhTokens) {
      expect(contrastRatio(value, tint)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    }
  });

  it('board labels stay readable on the spotlight tint', () => {
    const tint = compositeOver(token('gold'), SPOTLIGHT_TINT_ALPHA, token('day'));

    for (const label of ['ink', 'ink-soft', 'dusk']) {
      expect(contrastRatio(token(label), tint)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    }
  });

  it('Tuần, Triệt and Tiểu hạn labels read day on the chart block', () => {
    expect(contrastRatio(token('day'), token('chart-block'))).toBeGreaterThanOrEqual(
      AA_NORMAL_TEXT,
    );
  });

  it('board lines and the picked ring stay visible on every cung surface', () => {
    const tint = compositeOver(token('gold'), SPOTLIGHT_TINT_ALPHA, token('day'));

    for (const graphic of BOARD_GRAPHIC_TOKENS) {
      for (const surface of [token('day'), tint]) {
        expect(contrastRatio(token(graphic), surface)).toBeGreaterThanOrEqual(AA_NON_TEXT);
      }
    }
  });

  it('chapter tabs read on their track, even when the chapter is not written yet', () => {
    const track = compositeOver(token('night'), TAB_TRACK_ALPHA, token('deep'));
    const fadedDay = compositeOver(token('day'), UNAVAILABLE_TAB_ALPHA, track);

    expect(contrastRatio(token('day'), track)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(contrastRatio(fadedDay, track)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it('key phrases stay readable on the dawn wash', () => {
    const wash = compositeOver(token('dawn'), KEY_PHRASE_WASH_ALPHA, token('day'));

    expect(contrastRatio(token('ink'), wash)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it('mùng 1 and rằm labels read dusk on the day tile', () => {
    expect(contrastRatio(token('dusk'), token('day-200'))).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it('progress fill is visible on the skeleton track', () => {
    expect(contrastRatio(token('dusk'), token('day-200'))).toBeGreaterThanOrEqual(AA_NON_TEXT);
  });

  it('every chart data colour passes AA on day', () => {
    const chartTokens = [...TOKENS].filter(
      ([name]) =>
        CHART_TOKEN_PREFIXES.some((prefix) => name.startsWith(prefix)) && !name.endsWith('-night'),
    );

    expect(chartTokens.length).toBe(6);
    for (const [, value] of chartTokens) {
      expect(contrastRatio(value, token('day'))).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    }
  });
});

describe('night board tokens', () => {
  const nightSurfaces = (): readonly string[] => [
    token('night'),
    compositeOver(token('gold'), NIGHT_SPOTLIGHT_ALPHA, token('night')),
  ];

  it('every night star colour passes AA on night and on its spotlight', () => {
    for (const name of NIGHT_STAR_TOKENS) {
      for (const surface of nightSurfaces()) {
        expect(contrastRatio(token(name), surface)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
      }
    }
  });

  it('night board graphics stay visible', () => {
    for (const graphic of ['gold', 'ember', 'dawn']) {
      for (const surface of nightSurfaces()) {
        expect(contrastRatio(token(graphic), surface)).toBeGreaterThanOrEqual(AA_NON_TEXT);
      }
    }
  });

  it('night board rules and the related ring stay visible', () => {
    for (const alpha of [BOARD_RULE_ALPHA, RELATED_RING_ALPHA]) {
      const line = compositeOver(token('gold'), alpha, token('night'));
      for (const surface of nightSurfaces()) {
        expect(contrastRatio(line, surface)).toBeGreaterThanOrEqual(AA_NON_TEXT);
      }
    }
  });

  it('board text reads on the night cells', () => {
    for (const label of ['dawn', 'day-soft']) {
      for (const surface of nightSurfaces()) {
        expect(contrastRatio(token(label), surface)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
      }
    }
    expect(contrastRatio(token('night'), token('day'))).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
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
