import { AnalyticsTokenError, injectAnalyticsBeacon } from './analytics-beacon';

const HTML = '<html><head><title>Tử Vi</title></head><body></body></html>';
const TOKEN = '0123456789abcdef0123456789abcdef';
const BEACON = `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${TOKEN}"}'></script>`;

describe('injectAnalyticsBeacon', () => {
  it('leaves the page untouched when no token is configured', () => {
    expect(injectAnalyticsBeacon(HTML, '')).toBe(HTML);
  });

  it('inserts exactly one beacon right before </head>', () => {
    const html = injectAnalyticsBeacon(HTML, TOKEN);

    expect(html).toBe(HTML.replace('</head>', `${BEACON}</head>`));
    expect(html.split('cloudflareinsights').length - 1).toBe(1);
  });

  it.each([`${TOKEN.slice(1)}'`, `${TOKEN.slice(1)}"`, `${TOKEN.slice(1)}<`, 'not-a-token'])(
    'rejects a token that is not 32 hex characters: %p',
    (token) => {
      expect(() => injectAnalyticsBeacon(HTML, token)).toThrow(AnalyticsTokenError);
    },
  );
});
