import { SPA_SHELL_FILE_NAME, SpaShellError, buildSpaShellAsset, toSpaShell } from './spa-shell';

const ENTRY_HTML =
  '<!doctype html><html lang="vi"><head><meta charset="utf-8" /></head><body><div id="root"></div></body></html>';
const NOINDEX_META = '<meta name="robots" content="noindex">';
const ENTRY_CHUNK = { type: 'chunk', code: 'console.log(1)' } as const;

describe('toSpaShell', () => {
  it('keeps the built page and only marks it noindex right before </head>', () => {
    expect(toSpaShell(ENTRY_HTML)).toBe(ENTRY_HTML.replace('</head>', `${NOINDEX_META}</head>`));
  });

  it('refuses a page without a head to mark', () => {
    expect(() => toSpaShell('<div id="root"></div>')).toThrow(SpaShellError);
  });
});

describe('buildSpaShellAsset', () => {
  it('emits the noindex shell next to the built index.html', () => {
    const bundle = {
      'index.html': { type: 'asset', source: ENTRY_HTML },
      'assets/index.js': ENTRY_CHUNK,
    } as const;

    expect(buildSpaShellAsset(bundle)).toEqual({
      type: 'asset',
      fileName: SPA_SHELL_FILE_NAME,
      source: toSpaShell(ENTRY_HTML),
    });
  });

  it('fails the build when the bundle has no index.html to copy', () => {
    const bundle = {
      'other.html': { type: 'asset', source: ENTRY_HTML },
      'assets/index.js': ENTRY_CHUNK,
    } as const;

    expect(() => buildSpaShellAsset(bundle)).toThrow(SpaShellError);
  });
});
