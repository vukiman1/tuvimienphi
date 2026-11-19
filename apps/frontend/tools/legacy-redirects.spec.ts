import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ContentKind, pageRef, parsePageRef } from '@org/shared-contracts';
import { plannedPage } from '@org/shared-kien-thuc';
import type { PlannedPage } from '@org/shared-kien-thuc';

const LEGACY_REDIRECTS_URL = pathToFileURL(join(__dirname, 'legacy-redirects.mjs')).href;
const RUNNER_SCRIPT = `
import { LEGACY_REDIRECTS } from ${JSON.stringify(LEGACY_REDIRECTS_URL)};
console.log(JSON.stringify(LEGACY_REDIRECTS));
`;
const CLOUDFLARE_REDIRECTS_PATH = join(__dirname, '../public/_redirects');
const NGINX_CONF_PATH = join(__dirname, '../nginx.conf');
const NGINX_REDIRECT_PATTERN = /location = (\S+) \{\s*return 301 (\S+);\s*\}/g;
const KIEN_THUC_PREFIX = '/kien-thuc/';
const REF_SEPARATOR = '/';
const TRAILING_SLASH = '/';

interface LegacyRedirect {
  readonly from: string;
  readonly to: string;
}

function loadLegacyRedirects(): readonly LegacyRedirect[] {
  const output = execFileSync(process.execPath, ['--input-type=module', '-e', RUNNER_SCRIPT], {
    encoding: 'utf8',
  });
  return JSON.parse(output) as readonly LegacyRedirect[];
}

function withSlashForm(redirect: LegacyRedirect): readonly LegacyRedirect[] {
  return [redirect, { from: `${redirect.from}${TRAILING_SLASH}`, to: redirect.to }];
}

function refText(path: string): string {
  const rest = path.slice(KIEN_THUC_PREFIX.length);
  return rest.includes(REF_SEPARATOR) ? rest : `${ContentKind.Bai}${REF_SEPARATOR}${rest}`;
}

function plannedPageAt(path: string): PlannedPage | undefined {
  const parsed = parsePageRef(refText(path));
  return parsed ? plannedPage(pageRef(parsed.kind, parsed.slug)) : undefined;
}

const LEGACY_REDIRECTS = loadLegacyRedirects();
const SERVED_REDIRECTS = LEGACY_REDIRECTS.flatMap(withSlashForm);

describe('LEGACY_REDIRECTS', () => {
  it('serves every legacy redirect and its trailing-slash form as a 301 on Cloudflare', () => {
    const lines = readFileSync(CLOUDFLARE_REDIRECTS_PATH, 'utf8')
      .split('\n')
      .filter((line) => line.trim() !== '');

    expect(lines).toEqual(SERVED_REDIRECTS.map(({ from, to }) => `${from} ${to} 301`));
  });

  it('serves the same redirects and trailing-slash forms from nginx', () => {
    const conf = readFileSync(NGINX_CONF_PATH, 'utf8');

    const served = [...conf.matchAll(NGINX_REDIRECT_PATTERN)].map(([, from, to]) => ({ from, to }));

    expect(served).toEqual(SERVED_REDIRECTS);
  });

  it('redirects only to planned pages and never shadows a lesson', () => {
    expect(LEGACY_REDIRECTS.filter(({ to }) => plannedPageAt(to) === undefined)).toEqual([]);
    expect(LEGACY_REDIRECTS.filter(({ from }) => plannedPageAt(from) !== undefined)).toEqual([]);
  });
});
