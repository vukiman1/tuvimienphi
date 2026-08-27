/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/dashboard',
  server: {
    port: 4300,
    host: 'localhost',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [
    // Router plugin must run before the React plugin so the generated route tree is transformed too.
    // autoCodeSplitting splits each route's component (and its deps, e.g. recharts) into its own
    // lazy chunk, so the initial load only ships the shell + the landing route.
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
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
          if (id.includes('recharts') || id.includes('d3-')) return 'recharts';
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler'))
            return 'react';
          if (id.includes('@tanstack')) return 'tanstack';
          return 'vendor';
        },
      },
    },
  },
  test: {
    name: '@org/dashboard',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
