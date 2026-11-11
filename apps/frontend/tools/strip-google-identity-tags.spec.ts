import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const MODULE_URL = pathToFileURL(join(__dirname, 'strip-google-identity-tags.mjs')).href;
const RUNNER_SCRIPT = `
import { stripGoogleIdentityTags } from ${JSON.stringify(MODULE_URL)};
process.stdout.write(stripGoogleIdentityTags(process.argv[1]));
`;
const GOOGLE_SCRIPT_TAG =
  '<script src="https://accounts.google.com/gsi/client?hl=en" async="" defer=""></script>';
const GOOGLE_LINK_TAG =
  '<link id="googleidentityservice" type="text/css" media="all" href="https://accounts.google.com/gsi/style" rel="stylesheet">';
const APP_SCRIPT_TAG = '<script type="module" src="/assets/index.js"></script>';
const APP_LINK_TAG = '<link rel="stylesheet" href="/assets/index.css">';

function strip(html: string): string {
  return execFileSync(process.execPath, ['--input-type=module', '-e', RUNNER_SCRIPT, html], {
    encoding: 'utf8',
  });
}

describe('stripGoogleIdentityTags', () => {
  it('removes the script and stylesheet Google injected while the page rendered', () => {
    const html = strip(`<head>${GOOGLE_SCRIPT_TAG}${GOOGLE_LINK_TAG}</head>`);

    expect(html).toBe('<head></head>');
  });

  it('keeps the tags of the app itself', () => {
    const appTags = `<head>${APP_SCRIPT_TAG}${APP_LINK_TAG}</head>`;

    expect(strip(appTags)).toBe(appTags);
  });
});
