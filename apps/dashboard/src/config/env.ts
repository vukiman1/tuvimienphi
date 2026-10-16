const DEV_CLIENT_URL = 'http://localhost:4200';
const PROD_CLIENT_URL = 'https://xemtuvimienphi.top';

/**
 * Runtime configuration for the console. Everything is overridable via Vite env vars so the same
 * build can point at local / staging / prod without code changes.
 */
export const env = {
  /** Base URL of the backend API (NestJS global prefix is `api`). */
  apiBaseUrl: import.meta.env.VITE_API_URL ?? '/api',
  appName: import.meta.env.VITE_APP_NAME ?? 'Tử Vi · Bảng điều khiển',
  isDev: import.meta.env.DEV,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
  clientUrl:
    import.meta.env.VITE_CLIENT_URL ?? (import.meta.env.DEV ? DEV_CLIENT_URL : PROD_CLIENT_URL),
  appVersion: __APP_VERSION__,
};
