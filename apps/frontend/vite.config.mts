import { defaultClientConditions, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { createRequire } from 'node:module';
import { fileURLToPath, URL } from 'node:url';
import { loadFrontendConfig } from './config/index.ts';
import { analyticsBeaconPlugin } from './tools/analytics-beacon.ts';
import { preloadFontsPlugin } from './tools/preload-fonts.ts';

const requireFromHere = createRequire(import.meta.url);
const isAnalyze = process.env.ANALYZE === 'true';
const ROUTER_AND_QUERY_PACKAGES =
  /[\\/]node_modules[\\/]@tanstack[\\/](react-router|router-core|history|react-query|query-core|react-store|store)[\\/]/;
const STARTUP_UI_PACKAGES =
  /[\\/]node_modules[\\/](clsx|tailwind-merge|class-variance-authority|zustand)[\\/]/;
const LUCIDE_ICON_RUNTIME =
  /[\\/]node_modules[\\/]lucide-react[\\/]dist[\\/]esm[\\/]((createLucideIcon|Icon|defaultAttributes|context)\.mjs$|shared[\\/])/;
const HEADING_FONT_FILES: readonly RegExp[] = [
  /inter-tight-latin-800-normal-[\w-]+\.woff2$/,
  /inter-tight-vietnamese-800-normal-[\w-]+\.woff2$/,
  /playfair-display-latin-600-italic-[\w-]+\.woff2$/,
  /playfair-display-vietnamese-600-italic-[\w-]+\.woff2$/,
];

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
      analyticsBeaconPlugin(frontendConfig.analytics.cloudflareToken),
      preloadFontsPlugin(HEADING_FONT_FILES),
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
            if (ROUTER_AND_QUERY_PACKAGES.test(id)) return 'tanstack';
            if (id.includes('@sentry')) return 'sentry';
            if (STARTUP_UI_PACKAGES.test(id) || LUCIDE_ICON_RUNTIME.test(id)) {
              return 'startup-vendor';
            }
            return undefined;
          },
        },
      },
    },
  };
});
