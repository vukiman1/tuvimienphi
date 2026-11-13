import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const SOURCE_ROOT = join(__dirname, '..');
const INTER_TIGHT_SET_BOLD =
  /font-display[^"'`\n]*\bfont-bold\b|\bfont-bold\b[^"'`\n]*font-display/;
const SEVEN_HUNDRED_IMPORT = /@fontsource\/(be-vietnam-pro|inter-tight)\/700\.css/;

function componentFiles(directory: string): readonly string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return componentFiles(path);
    return entry.name.endsWith('.tsx') && !entry.name.endsWith('.spec.tsx') ? [path] : [];
  });
}

describe('font weights', () => {
  it('renders bold text at 600, so no page fetches a 700 face', () => {
    const tokens = readFileSync(join(__dirname, 'tokens.css'), 'utf8');

    expect(tokens).toMatch(/--font-weight-bold:\s*600;/);
  });

  it('declares no 700 face of Be Vietnam Pro or Inter Tight', () => {
    const fonts = readFileSync(join(__dirname, 'fonts.css'), 'utf8');

    expect(fonts).not.toMatch(SEVEN_HUNDRED_IMPORT);
  });

  it('sets Inter Tight only at the preloaded 800 weight, never bold', () => {
    const offenders = componentFiles(SOURCE_ROOT)
      .filter((file) => INTER_TIGHT_SET_BOLD.test(readFileSync(file, 'utf8')))
      .map((file) => relative(SOURCE_ROOT, file));

    expect(offenders).toEqual([]);
  });
});
