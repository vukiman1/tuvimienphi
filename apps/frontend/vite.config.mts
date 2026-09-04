import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { createRequire } from 'node:module';
import { fileURLToPath, URL } from 'node:url';
import { loadFrontendConfig } from './config/index.ts';

const requireFromHere = createRequire(import.meta.url);
const isAnalyze = process.env.ANALYZE === 'true';

export default defineConfig(({ mode }) => {
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
