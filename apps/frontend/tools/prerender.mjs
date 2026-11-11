/**
 * Static prerender ("SSG by crawl"). After `vite build`, this boots the built app on a local preview
 * server, renders each public route in a real browser (so `window`, TanStack Router and the head tags
 * all behave exactly as in production), and writes the fully-rendered HTML back into `dist/<route>/index.html`.
 *
 * Result: JS-blind crawlers (CocCoc, Zalo, Facebook link preview) receive real content + meta tags,
 * while browsers still boot the SPA and take over. Personalised/noindex routes are left as the SPA shell.
 *
 * Run AFTER the build, from apps/frontend:  node tools/prerender.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { preview } from 'vite';
import { chromium, request as playwrightRequest } from 'playwright';
import { getSeoRoutes, getSitemapEntries } from './seo-routes.mjs';
import { renderSitemap } from './sitemap.mjs';
import { stripGoogleIdentityTags } from './strip-google-identity-tags.mjs';
import { stripModulePreloadLinks } from './strip-modulepreload-links.mjs';
import { fetchPublishedVanHanYears } from './van-han-years.mjs';

const ANALYTICS_BEACON_URLS = 'https://static.cloudflareinsights.com/**';
const API_PATH_PREFIX = '/api';
const DEFAULT_PRERENDER_API_BASE_URL = 'https://api.xemtuvimienphi.top/api';
const PRERENDER_API_BASE_URL = process.env.PRERENDER_API_BASE_URL ?? DEFAULT_PRERENDER_API_BASE_URL;
const DEFAULT_SITE_URL = 'https://xemtuvimienphi.top';
const SITE_URL = (process.env.VITE_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/$/, '');
const SITEMAP_FILE_NAME = 'sitemap.xml';
const READ_METHOD = 'GET';
const UNREACHABLE_API_ERROR_CODE = 'connectionfailed';
const FIRST_FAILING_STATUS = 400;
const ERROR_TOAST_SELECTOR = '.Toastify__toast';
const FAILURE_SEPARATOR = '; ';

class PrerenderErrorToastError extends Error {
  constructor(route, toastText) {
    super(`${route} rendered an error toast instead of its content: ${toastText}`);
    this.name = 'PrerenderErrorToastError';
  }
}

class PrerenderApiError extends Error {
  constructor(route, failures) {
    super(`${route} needed API data the build could not get: ${failures.join(FAILURE_SEPARATOR)}`);
    this.name = 'PrerenderApiError';
  }
}

function isApiRequest(url) {
  return url.pathname.startsWith(`${API_PATH_PREFIX}/`);
}

function productionApiUrl(requestUrl) {
  const { pathname, search } = new URL(requestUrl);
  return `${PRERENDER_API_BASE_URL}${pathname.slice(API_PATH_PREFIX.length)}${search}`;
}

function createApiReadCache(apiContext) {
  const responses = new Map();
  return (apiUrl) => {
    if (!responses.has(apiUrl)) {
      responses.set(
        apiUrl,
        apiContext.get(apiUrl).then(async (response) => ({
          status: response.status(),
          headers: response.headers(),
          body: await response.body(),
        })),
      );
    }
    return responses.get(apiUrl);
  };
}

function forwardApiReadsToProduction({ pageOrigin, readApiOnce, failures }) {
  return async (route) => {
    const request = route.request();
    if (request.method() !== READ_METHOD) {
      await route.abort();
      return;
    }
    const apiUrl = productionApiUrl(request.url());
    let response;
    try {
      response = await readApiOnce(apiUrl);
    } catch (error) {
      failures.push(`${apiUrl} unreachable (${error.message.split('\n')[0]})`);
      await route.abort(UNREACHABLE_API_ERROR_CODE);
      return;
    }
    if (response.status >= FIRST_FAILING_STATUS) {
      failures.push(`${apiUrl} answered ${response.status}`);
    }
    await route.fulfill({
      status: response.status,
      body: response.body,
      headers: {
        ...response.headers,
        'access-control-allow-origin': pageOrigin,
        'access-control-allow-credentials': 'true',
      },
    });
  };
}

async function assertRenderedFromApi(page, route, failures) {
  if (failures.length > 0) {
    throw new PrerenderApiError(route, failures);
  }
  const toasts = page.locator(ERROR_TOAST_SELECTOR);
  if ((await toasts.count()) > 0) {
    throw new PrerenderErrorToastError(route, (await toasts.allInnerTexts()).join(' | '));
  }
}

const frontendRoot = fileURLToPath(new URL('..', import.meta.url));
const distDir = join(frontendRoot, 'dist');

/** Map a route to its output file: `/` → dist/index.html, `/kien-thuc` → dist/kien-thuc/index.html. */
function outputFileFor(route) {
  const clean = route.replace(/^\/+|\/+$/g, '');
  return clean ? join(distDir, clean, 'index.html') : join(distDir, 'index.html');
}

async function main() {
  const vanHanYears = await fetchPublishedVanHanYears(PRERENDER_API_BASE_URL);
  const routes = getSeoRoutes({ vanHanYears });
  console.log(`[prerender] ${routes.length} routes (Vận hạn years: ${vanHanYears.join(', ')})`);

  const server = await preview({
    root: frontendRoot,
    preview: { port: 0, strictPort: false },
  });
  const baseUrl = server.resolvedUrls?.local?.[0]?.replace(/\/$/, '');
  if (!baseUrl) throw new Error('[prerender] could not resolve preview server URL');
  console.log(`[prerender] preview at ${baseUrl}`);

  const browser = await chromium.launch();
  const apiContext = await playwrightRequest.newContext();
  const readApiOnce = createApiReadCache(apiContext);
  // Capture every route BEFORE writing anything: the preview server serves files from dist via the
  // SPA fallback, so writing a prerendered index.html mid-crawl would feed it back into later routes
  // (leaking one page's head tags/content into the next). Buffer here, flush after the crawl.
  const captured = [];
  try {
    for (const route of routes) {
      const page = await browser.newPage();
      await page.route(ANALYTICS_BEACON_URLS, (route) => route.abort());
      const failures = [];
      await page.route(
        isApiRequest,
        forwardApiReadsToProduction({ pageOrigin: baseUrl, readApiOnce, failures }),
      );
      try {
        await page.goto(baseUrl + route, { waitUntil: 'networkidle', timeout: 30_000 });
        // Wait for the client router to mount a visible content region (not just the invisible
        // head tags HeadContent renders as the first children of #root).
        await page.waitForSelector('#root main, #root h1', { state: 'visible', timeout: 15_000 });
        // Drop the loading splash so the saved HTML shows content, not the spinner.
        await page.evaluate(() => document.getElementById('app-splash')?.remove());
        await assertRenderedFromApi(page, route, failures);
        // The router injects absolute preview-origin URLs for preloaded chunks (http://localhost:PORT/assets/…).
        // Rewrite them back to root-relative so the assets resolve in production.
        const raw = (await page.content()).replace(/^<!doctype html>/i, '');
        const html =
          '<!doctype html>\n' +
          stripModulePreloadLinks(stripGoogleIdentityTags(raw.split(baseUrl).join('')));
        captured.push({ route, html });
        console.log(`[prerender] ✓ ${route}`);
      } catch (error) {
        console.error(`[prerender] ✗ ${route}: ${error.message}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await apiContext.dispose();
    await browser.close();
    await new Promise((resolve) => server.httpServer.close(resolve));
  }

  for (const { route, html } of captured) {
    const outFile = outputFileFor(route);
    await mkdir(dirname(outFile), { recursive: true });
    await writeFile(outFile, html, 'utf8');
  }

  const sitemapEntries = getSitemapEntries({ vanHanYears });
  await writeFile(
    join(distDir, SITEMAP_FILE_NAME),
    renderSitemap(SITE_URL, sitemapEntries),
    'utf8',
  );

  console.log(`[prerender] wrote ${captured.length}/${routes.length} routes to dist/`);
  console.log(`[prerender] wrote ${sitemapEntries.length} URLs to dist/${SITEMAP_FILE_NAME}`);
  if (captured.length < routes.length) process.exitCode = 1;
}

await main();
