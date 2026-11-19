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
const FADED_TEXT = /opacity-|\btext-[\w-]+\/\d+\b/;
const PLAIN_RING = /(^|\s)ring-/;
const RASTER_MEDIA_IMPORT = /from '@\/(config\/media|lib\/zodiac-icons)'/;
const SERIF_TITLE = /\bTitleFace\.Serif\b/;
const DISPLAY_TITLE = /<DisplayTitle\b/;
const SECTION_HEADING_FILE = 'components/section-heading.tsx';
const LESSON_AND_ENTRY_FILES: readonly string[] = ['pages/lesson-page.tsx', 'pages/entry-page.tsx'];
const MEDIA_MODULE = 'kien-thuc-media.ts';
const CHINESE_CHARACTER = /\p{Script=Han}/u;
const PLAYFAIR_UPRIGHT_WEIGHT = /\bfont-bold\b/;
const PLAYFAIR_ITALIC_WEIGHT = /\bfont-semibold\b/;

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

function offendingFiles(isOffending: (text: string) => boolean): readonly string[] {
  return sourceFiles(FEATURE_ROOT)
    .filter(({ text }) => isOffending(text))
    .map(({ path }) => path);
}

describe('kien-thuc fonts and media', () => {
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

  it('sets Playfair only as the two faces the home page loads, 700 upright and 600 italic', () => {
    const offenders = offendingStrings((value) => {
      if (!EMPHASIS_FACE.test(value)) return false;
      return ITALIC.test(value)
        ? !PLAYFAIR_ITALIC_WEIGHT.test(value)
        : !PLAYFAIR_UPRIGHT_WEIGHT.test(value);
    });

    expect(offenders).toEqual([]);
  });

  it('sets lesson and entry section headings only through the serif SectionHeading', () => {
    const files = sourceFiles(FEATURE_ROOT);
    const sectionHeading = files.find(({ path }) => path === SECTION_HEADING_FILE);
    const offenders = files
      .filter(({ path }) => LESSON_AND_ENTRY_FILES.includes(path))
      .filter(({ text }) => DISPLAY_TITLE.test(text))
      .map(({ path }) => path);

    expect(sectionHeading?.text).toMatch(SERIF_TITLE);
    expect(offenders).toEqual([]);
  });

  it('fades no text', () => {
    const offenders = offendingStrings((value) => FADED_TEXT.test(value));

    expect(offenders).toEqual([]);
  });

  it('draws state marks with inset rings', () => {
    const offenders = offendingStrings((value) => PLAIN_RING.test(value));

    expect(offenders).toEqual([]);
  });

  it('reaches raster media only through the one media module', () => {
    const offenders = offendingFiles((text) => RASTER_MEDIA_IMPORT.test(text)).filter(
      (path) => path !== MEDIA_MODULE,
    );

    expect(offenders).toEqual([]);
  });

  it('holds no Chinese characters', () => {
    expect(offendingFiles((text) => CHINESE_CHARACTER.test(text))).toEqual([]);
  });
});
