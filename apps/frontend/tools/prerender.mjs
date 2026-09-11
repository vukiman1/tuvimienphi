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
import { chromium } from 'playwright';
import { getSeoRoutes } from './seo-routes.mjs';

const frontendRoot = fileURLToPath(new URL('..', import.meta.url));
const distDir = join(frontendRoot, 'dist');

/** Map a route to its output file: `/` → dist/index.html, `/kien-thuc` → dist/kien-thuc/index.html. */
function outputFileFor(route) {
  const clean = route.replace(/^\/+|\/+$/g, '');
  return clean ? join(distDir, clean, 'index.html') : join(distDir, 'index.html');
}

async function main() {
  const routes = getSeoRoutes();
  console.log(`[prerender] ${routes.length} routes`);

  const server = await preview({
    root: frontendRoot,
    preview: { port: 0, strictPort: false },
  });
  const baseUrl = server.resolvedUrls?.local?.[0]?.replace(/\/$/, '');
  if (!baseUrl) throw new Error('[prerender] could not resolve preview server URL');
  console.log(`[prerender] preview at ${baseUrl}`);

  const browser = await chromium.launch();
  // Capture every route BEFORE writing anything: the preview server serves files from dist via the
  // SPA fallback, so writing a prerendered index.html mid-crawl would feed it back into later routes
  // (leaking one page's head tags/content into the next). Buffer here, flush after the crawl.
  const captured = [];
  try {
    for (const route of routes) {
      const page = await browser.newPage();
      try {
        await page.goto(baseUrl + route, { waitUntil: 'networkidle', timeout: 30_000 });
        // Wait for the client router to mount a visible content region (not just the invisible
        // head tags HeadContent renders as the first children of #root).
        await page.waitForSelector('#root main, #root h1', { state: 'visible', timeout: 15_000 });
        // Drop the loading splash so the saved HTML shows content, not the spinner.
        await page.evaluate(() => document.getElementById('app-splash')?.remove());
        // The router injects absolute preview-origin URLs for preloaded chunks (http://localhost:PORT/assets/…).
        // Rewrite them back to root-relative so the assets resolve in production.
        const raw = (await page.content()).replace(/^<!doctype html>/i, '');
        const html = '<!doctype html>\n' + raw.split(baseUrl).join('');
        captured.push({ route, html });
        console.log(`[prerender] ✓ ${route}`);
      } catch (error) {
        console.error(`[prerender] ✗ ${route}: ${error.message}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.httpServer.close(resolve));
  }

  for (const { route, html } of captured) {
    const outFile = outputFileFor(route);
    await mkdir(dirname(outFile), { recursive: true });
    await writeFile(outFile, html, 'utf8');
  }

  console.log(`[prerender] wrote ${captured.length}/${routes.length} routes to dist/`);
  if (captured.length < routes.length) process.exitCode = 1;
}

await main();
