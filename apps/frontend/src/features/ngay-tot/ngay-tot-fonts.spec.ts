import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const FEATURE_ROOT = __dirname;
const SOURCE_FILE = /\.tsx?$/;
const SPEC_FILE = /\.spec\.tsx?$/;
const STRING_LITERAL = /'[^'\n]*'|"[^"\n]*"|`[^`]*`/g;
const UNLOADED_WEIGHT = /\bfont-(medium|light|black)\b/;
const EXTRABOLD = /\bfont-extrabold\b/;
const DISPLAY_FACE = /\bfont-display\b/;
const ITALIC = /\bitalic\b/;
const EMPHASIS_FACE = /\bfont-emphasis\b/;
const RASTER_MEDIA_IMPORT = /from '@\/(config\/media|lib\/zodiac-icons)'/;

interface SourceFile {
  readonly path: string;
  readonly text: string;
}

function sourceFiles(directory: string): readonly SourceFile[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    if (!SOURCE_FILE.test(entry.name) || SPEC_FILE.test(entry.name)) return [];
    return [{ path: relative(FEATURE_ROOT, path), text: readFileSync(path, 'utf8') }];
  });
}

function offendingStrings(isOffending: (value: string) => boolean): readonly string[] {
  return sourceFiles(FEATURE_ROOT).flatMap(({ path, text }) =>
    [...text.matchAll(STRING_LITERAL)]
      .map(([value]) => value)
      .filter(isOffending)
      .map((value) => `${path}: ${value}`),
  );
}

describe('ngay-tot fonts and media', () => {
  it('uses only the weights the home page loads', () => {
    const offenders = offendingStrings(
      (value) =>
        UNLOADED_WEIGHT.test(value) || (EXTRABOLD.test(value) && !DISPLAY_FACE.test(value)),
    );

    expect(offenders).toEqual([]);
  });

  it('sets italics only in the preloaded Playfair', () => {
    const offenders = offendingStrings((value) => ITALIC.test(value) && !EMPHASIS_FACE.test(value));

    expect(offenders).toEqual([]);
  });

  it('references no raster media', () => {
    const offenders = sourceFiles(FEATURE_ROOT)
      .filter(({ text }) => RASTER_MEDIA_IMPORT.test(text))
      .map(({ path }) => path);

    expect(offenders).toEqual([]);
  });
});
