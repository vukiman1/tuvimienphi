/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { fileURLToPath, URL } from 'node:url';
import { createRequire } from 'node:module';

const { version } = createRequire(import.meta.url)('./package.json');

export default defineConfig(() => ({
  root: import.meta.dirname,
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  cacheDir: '../../node_modules/.vite/apps/dashboard',
  server: {
    port: 4300,
    host: 'localhost',
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: false },
    },
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [
    // Router plugin must run before the React plugin so the generated route tree is transformed too.
    // autoCodeSplitting splits each route's component into its own lazy chunk, so the initial load
    // only ships the shell + the landing route.
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
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
          if (id.includes('@ant-design/charts') || id.includes('@antv')) return 'charts';
          if (id.includes('antd') || id.includes('@ant-design') || id.includes('rc-'))
            return 'antd';
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
    setupFiles: ['src/test-setup.ts'],
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    passWithNoTests: true,
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
