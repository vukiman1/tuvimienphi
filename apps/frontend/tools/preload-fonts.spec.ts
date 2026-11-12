import { MissingPreloadFontError, injectFontPreloads } from './preload-fonts';

const HTML = '<html><head><title>Tử Vi</title></head><body></body></html>';
const PATTERNS = [
  /inter-tight-latin-800-normal-[\w-]+\.woff2$/,
  /inter-tight-vietnamese-800-normal-[\w-]+\.woff2$/,
];
const BUNDLE_FILES = [
  'assets/index-abc.js',
  'assets/inter-tight-latin-800-normal-CRGCHRPv.woff2',
  'assets/inter-tight-latin-800-normal-D2te1T7i.woff',
  'assets/inter-tight-latin-ext-800-normal-Xyz.woff2',
  'assets/inter-tight-vietnamese-800-normal-Abc.woff2',
];

describe('injectFontPreloads', () => {
  it('preloads only the woff2 files the patterns name, right before </head>', () => {
    expect(injectFontPreloads(HTML, BUNDLE_FILES, PATTERNS)).toBe(
      HTML.replace(
        '</head>',
        '<link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/inter-tight-latin-800-normal-CRGCHRPv.woff2">' +
          '<link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/inter-tight-vietnamese-800-normal-Abc.woff2">' +
          '</head>',
      ),
    );
  });

  it('fails the build when a font to preload is no longer in the bundle', () => {
    expect(() =>
      injectFontPreloads(
        HTML,
        BUNDLE_FILES.filter((file) => !file.includes('vietnamese')),
        PATTERNS,
      ),
    ).toThrow(MissingPreloadFontError);
  });
});
