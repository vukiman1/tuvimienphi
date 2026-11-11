import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const MODULE_URL = pathToFileURL(join(__dirname, 'strip-modulepreload-links.mjs')).href;
const RUNNER_SCRIPT = `
import { stripModulePreloadLinks } from ${JSON.stringify(MODULE_URL)};
process.stdout.write(stripModulePreloadLinks(process.argv[1]));
`;
const MODULEPRELOAD_LINK = '<link rel="modulepreload" crossorigin="" href="/assets/react.js">';
const ROUTER_MODULEPRELOAD_LINK =
  '<link as="script" crossorigin="" rel="modulepreload" href="/assets/site.js">';
const ENTRY_SCRIPT_TAG = '<script type="module" crossorigin="" src="/assets/index.js"></script>';
const STYLESHEET_LINK = '<link rel="stylesheet" href="/assets/index.css">';

function strip(html: string): string {
  return execFileSync(process.execPath, ['--input-type=module', '-e', RUNNER_SCRIPT, html], {
    encoding: 'utf8',
  });
}

describe('stripModulePreloadLinks', () => {
  it('removes modulepreload links whatever the order of their attributes', () => {
    const html = strip(`<head>${MODULEPRELOAD_LINK}${ROUTER_MODULEPRELOAD_LINK}</head>`);

    expect(html).toBe('<head></head>');
  });

  it('keeps the entry script and stylesheets', () => {
    const head = `<head>${ENTRY_SCRIPT_TAG}${STYLESHEET_LINK}</head>`;

    expect(strip(head)).toBe(head);
  });
});
