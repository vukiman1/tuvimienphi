import type { Plugin } from 'vite';

const BEACON_SRC = 'https://static.cloudflareinsights.com/beacon.min.js';
const CLOUDFLARE_TOKEN_PATTERN = /^[0-9a-f]{32}$/i;
const HEAD_CLOSE = '</head>';

export class AnalyticsTokenError extends Error {
  constructor() {
    super('VITE_CF_ANALYTICS_TOKEN must be the 32 hex characters Cloudflare Web Analytics issues');
    this.name = 'AnalyticsTokenError';
  }
}

export function injectAnalyticsBeacon(html: string, token: string): string {
  if (!token) return html;
  if (!CLOUDFLARE_TOKEN_PATTERN.test(token)) throw new AnalyticsTokenError();
  const beacon = `<script defer src="${BEACON_SRC}" data-cf-beacon='{"token":"${token}"}'></script>`;
  return html.replace(HEAD_CLOSE, `${beacon}${HEAD_CLOSE}`);
}

export function analyticsBeaconPlugin(token: string): Plugin {
  return {
    name: 'cloudflare-analytics-beacon',
    apply: 'build',
    transformIndexHtml: (html) => injectAnalyticsBeacon(html, token),
  };
}
