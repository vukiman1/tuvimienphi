import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const SITEMAP_URL = pathToFileURL(join(__dirname, 'sitemap.mjs')).href;
const RUNNER_SCRIPT = `
import { renderSitemap } from ${JSON.stringify(SITEMAP_URL)};
process.stdout.write(renderSitemap(process.argv[1], JSON.parse(process.argv[2])));
`;
const SITE_URL = 'https://xemtuvimienphi.top';

interface SitemapEntry {
  readonly path: string;
  readonly lastModified?: string;
}

function renderSitemap(entries: readonly SitemapEntry[]): string {
  return execFileSync(
    process.execPath,
    ['--input-type=module', '-e', RUNNER_SCRIPT, SITE_URL, JSON.stringify(entries)],
    { encoding: 'utf8' },
  );
}

describe('renderSitemap', () => {
  it('lists every route under the site URL', () => {
    const xml = renderSitemap([{ path: '/' }, { path: '/van-han/2026/tuoi-ty' }]);

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset')).toBe(true);
    expect(xml).toContain('<loc>https://xemtuvimienphi.top/</loc>');
    expect(xml).toContain('<loc>https://xemtuvimienphi.top/van-han/2026/tuoi-ty</loc>');
  });

  it('dates only the routes whose change date is known', () => {
    const xml = renderSitemap([
      { path: '/kien-thuc/tu-vi-2027/tuoi-ty', lastModified: '2026-11-08T10:34:05.087Z' },
      { path: '/' },
    ]);

    expect(xml).toContain(
      '<loc>https://xemtuvimienphi.top/kien-thuc/tu-vi-2027/tuoi-ty</loc>\n    <lastmod>2026-11-08T10:34:05.087Z</lastmod>',
    );
    expect(xml.match(/<lastmod>/g)).toHaveLength(1);
  });
});
