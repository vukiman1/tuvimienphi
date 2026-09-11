import { defaultClientConditions, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import type { Plugin } from 'vite';
import { loadFrontendConfig } from './config/index.ts';
import { getSeoRoutes } from './tools/seo-routes.mjs';

const requireFromHere = createRequire(import.meta.url);
const isAnalyze = process.env.ANALYZE === 'true';

/**
 * Emit `sitemap.xml` into the build output from the shared public-route list (see tools/seo-routes.mjs),
 * so every build produces a sitemap that matches the shipped articles with no manual upkeep.
 */
function sitemapPlugin(siteUrl: string): Plugin {
  return {
    name: 'generate-sitemap',
    apply: 'build',
    closeBundle() {
      const urls = getSeoRoutes()
        .map((path) => `  <url>\n    <loc>${siteUrl}${path}</loc>\n  </url>`)
        .join('\n');
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
      writeFileSync(fileURLToPath(new URL('./dist/sitemap.xml', import.meta.url)), xml);
    },
  };
}

const siteUrl = (process.env.VITE_SITE_URL ?? 'https://xemtuvimienphi.top').replace(/\/$/, '');

export default defineConfig(({ command, mode }) => {
  const frontendConfig = loadFrontendConfig(mode, requireFromHere);

  return {
    root: import.meta.dirname,
    cacheDir: '../../node_modules/.vite/apps/frontend',
    server: {
      port: 4200,
      host: 'localhost',
    },
    preview: {
      port: 4200,
      host: 'localhost',
    },
    define: {
      __FRONTEND_CONFIG__: JSON.stringify(frontendConfig),
    },
    plugins: [
      // autoCodeSplitting splits each route's component (and its deps, e.g. the large mock/data
      // modules) into its own chunk, loaded on navigation instead of in the initial bundle.
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
      sitemapPlugin(siteUrl),
      isAnalyze &&
        visualizer({
          filename: './dist/stats.html',
          template: 'treemap',
          gzipSize: true,
          brotliSize: true,
          open: false,
        }),
    ],
    resolve: {
      // Dev đọc thẳng TS source của package shared nên sửa engine là HMR chạy ngay; không có nó thì
      // trình duyệt vẫn nhận `dist` dựng lúc khởi động và mọi thay đổi im lặng trôi mất. Bản build
      // vẫn đi qua `dist` như cũ.
      ...(command === 'serve' ? { conditions: ['@org/source', ...defaultClientConditions] } : {}),
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [],
    // },
    build: {
      outDir: './dist',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          // Keep heavy, rarely-changing vendors in their own long-cacheable chunks.
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            // Match the package dir precisely so sibling packages (@sentry/react,
            // react-toastify, radix-ui) are not swept into the React runtime chunk.
            if (/[\\/](react|react-dom|scheduler)@/.test(id)) return 'react';
            if (id.includes('@tanstack')) return 'tanstack';
            if (id.includes('@sentry')) return 'sentry';
            return 'vendor';
          },
        },
      },
    },
  };
});
