import type { Plugin } from 'vite';

export const SPA_SHELL_FILE_NAME = 'spa-shell.html';
const ENTRY_HTML_FILE_NAME = 'index.html';
const HEAD_CLOSE = '</head>';
const NOINDEX_META = '<meta name="robots" content="noindex">';

interface BundleOutput {
  readonly type: string;
  readonly source?: string | Uint8Array;
}

type BundleOutputs = Readonly<Record<string, BundleOutput>>;

interface SpaShellAsset {
  readonly type: 'asset';
  readonly fileName: string;
  readonly source: string;
}

export class SpaShellError extends Error {
  constructor(reason: string) {
    super(`Cannot build ${SPA_SHELL_FILE_NAME}: ${reason}`);
    this.name = 'SpaShellError';
  }
}

export function toSpaShell(html: string): string {
  if (!html.includes(HEAD_CLOSE)) {
    throw new SpaShellError(`the entry HTML has no ${HEAD_CLOSE} to put the noindex tag before`);
  }
  return html.replace(HEAD_CLOSE, `${NOINDEX_META}${HEAD_CLOSE}`);
}

export function buildSpaShellAsset(bundle: BundleOutputs): SpaShellAsset {
  const entry = bundle[ENTRY_HTML_FILE_NAME];
  if (entry?.type !== 'asset' || typeof entry.source !== 'string') {
    throw new SpaShellError(`the bundle has no ${ENTRY_HTML_FILE_NAME} to copy`);
  }
  return { type: 'asset', fileName: SPA_SHELL_FILE_NAME, source: toSpaShell(entry.source) };
}

export function spaShellPlugin(): Plugin {
  return {
    name: 'spa-shell',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      this.emitFile(buildSpaShellAsset(bundle));
    },
  };
}
