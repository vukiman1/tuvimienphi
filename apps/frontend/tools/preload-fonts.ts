import type { Plugin } from 'vite';

const HEAD_CLOSE = '</head>';
const WOFF2_EXTENSION = '.woff2';

export class MissingPreloadFontError extends Error {
  constructor(pattern: RegExp) {
    super(`No woff2 file in the bundle matches the font preload pattern ${pattern.source}`);
    this.name = 'MissingPreloadFontError';
  }
}

function findFontFile(fileNames: readonly string[], pattern: RegExp): string {
  const match = fileNames.find(
    (fileName) => fileName.endsWith(WOFF2_EXTENSION) && pattern.test(fileName),
  );
  if (match === undefined) {
    throw new MissingPreloadFontError(pattern);
  }
  return match;
}

export function injectFontPreloads(
  html: string,
  fileNames: readonly string[],
  patterns: readonly RegExp[],
): string {
  const links = patterns
    .map((pattern) => findFontFile(fileNames, pattern))
    .map(
      (fileName) =>
        `<link rel="preload" as="font" type="font/woff2" crossorigin href="/${fileName}">`,
    )
    .join('');
  return html.replace(HEAD_CLOSE, `${links}${HEAD_CLOSE}`);
}

export function preloadFontsPlugin(patterns: readonly RegExp[]): Plugin {
  return {
    name: 'preload-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler: (html, context) =>
        injectFontPreloads(html, Object.keys(context.bundle ?? {}), patterns),
    },
  };
}
