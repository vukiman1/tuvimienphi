import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const MODULE_URL = pathToFileURL(join(__dirname, 'strip-motion-ready.mjs')).href;
const RUNNER_SCRIPT = `
import { stripMotionReady } from ${JSON.stringify(MODULE_URL)};
process.stdout.write(stripMotionReady(process.argv[1]));
`;

function strip(html: string): string {
  return execFileSync(process.execPath, ['--input-type=module', '-e', RUNNER_SCRIPT, html], {
    encoding: 'utf8',
  });
}

describe('stripMotionReady', () => {
  it('drops the motion flag the app set on the root element', () => {
    expect(strip('<html lang="vi" data-motion="ready"><head></head></html>')).toBe(
      '<html lang="vi"><head></head></html>',
    );
  });

  it('leaves pages without the flag untouched', () => {
    const html = '<html lang="vi"><body data-motion-note="x"></body></html>';

    expect(strip(html)).toBe(html);
  });
});
