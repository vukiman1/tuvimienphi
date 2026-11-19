import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const MODULE_URL = pathToFileURL(join(__dirname, 'hydration-errors.mjs')).href;
const RUNNER_SCRIPT = `
import { isHydrationErrorMessage } from ${JSON.stringify(MODULE_URL)};
process.stdout.write(String(isHydrationErrorMessage(process.argv[1])));
`;

function isHydrationError(message: string): boolean {
  const answer = execFileSync(
    process.execPath,
    ['--input-type=module', '-e', RUNNER_SCRIPT, message],
    {
      encoding: 'utf8',
    },
  );
  return answer === 'true';
}

describe('isHydrationErrorMessage', () => {
  it.each([
    'Recovered from a render error Error: Minified React error #418; visit https://react.dev/errors/418?args[]=text',
    'Uncaught Error: Minified React error #423; visit https://react.dev/errors/423',
    'Minified React error #425; visit https://react.dev/errors/425',
    "Hydration failed because the server rendered text didn't match the client.",
  ])('flags %s', (message) => {
    expect(isHydrationError(message)).toBe(true);
  });

  it.each([
    'Minified React error #185; visit https://react.dev/errors/185',
    'Failed to load resource: the server responded with a status of 403 ()',
  ])('ignores %s', (message) => {
    expect(isHydrationError(message)).toBe(false);
  });
});
