/**
 * Central SEO helpers. Because the app is a client-rendered SPA, these tags are applied to
 * `document.head` by TanStack Router's `HeadContent` after hydration — good enough for Google's
 * JS renderer and correct on client navigation, but NOT present in the initial HTML. Server-side
 * rendering / prerendering is the follow-up needed for JS-blind crawlers (CocCoc, Zalo, Facebook).
 */

/**
 * Canonical production origin (no trailing slash). Deliberately a constant, not env-derived:
 * canonical + Open Graph URLs must always point at production, never at a localhost or preview host.
 * The sitemap generator in `vite.config.mts` keeps the same default (overridable there via env).
 */
export const SITE_URL = 'https://xemtuvimienphi.top';

export const SITE_NAME = 'Tử Vi Miễn Phí';

/** Default social share image, served from `public/`. */
const DEFAULT_OG_IMAGE = '/brand/icon.png';

/** Build an absolute URL from a site-relative path (`/kien-thuc` → `https://…/kien-thuc`). */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** A single entry in TanStack Router's `meta` array. */
type MetaTag =
  | { readonly title: string }
  | { readonly name: string; readonly content: string }
  | { readonly property: string; readonly content: string };

interface LinkTag {
  readonly rel: string;
  readonly href: string;
}

interface SeoOptions {
  /** Page-specific title. The site name is appended automatically unless `titleExact` is set. */
  readonly title: string;
  readonly description: string;
  /** Site-relative path used for canonical + `og:url` (e.g. `/kien-thuc`). */
  readonly path: string;
  /** Absolute or site-relative image for social cards. */
  readonly image?: string;
  /** `website` for landing pages, `article` for blog posts. */
  readonly type?: 'website' | 'article';
  /** Use the title verbatim instead of appending ` | Tử Vi Miễn Phí` (e.g. the home page). */
  readonly titleExact?: boolean;
  /** Keep the page out of the index (auth, dashboard, redirect-only routes). */
  readonly noindex?: boolean;
  /**
   * Emit a `<link rel="canonical">`. Leave off on the root defaults: TanStack merges the head of
   * every matched route and dedups links by full equality, so a root canonical would render a second,
   * conflicting canonical alongside each leaf route's own. Off ⇒ only the leaf route sets it.
   */
  readonly canonical?: boolean;
}

/** Produce the `{ meta, links }` object a route's `head` should return. */
export function seo(options: SeoOptions): { meta: MetaTag[]; links: LinkTag[] } {
  const {
    title,
    description,
    path,
    type = 'website',
    titleExact = false,
    noindex = false,
    canonical = true,
  } = options;
  const fullTitle = titleExact ? title : `${title} | ${SITE_NAME}`;
  const url = absoluteUrl(path);
  const image = absoluteUrl(options.image ?? DEFAULT_OG_IMAGE);

  const meta: MetaTag[] = [
    { title: fullTitle },
    { name: 'description', content: description },
    { name: 'robots', content: noindex ? 'noindex, nofollow' : 'index, follow' },

    // Open Graph (Facebook, Zalo, generic link previews)
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:type', content: type },
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: image },
    { property: 'og:locale', content: 'vi_VN' },

    // Twitter/X card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: fullTitle },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
  ];

  return { meta, links: canonical ? [{ rel: 'canonical', href: url }] : [] };
}

/**
 * JSON-LD as a `meta` entry (not `scripts`): `HeadContent` renders the `script:ld+json` convention
 * into the head, whereas the `scripts` field is only emitted by the body-level `<Scripts>` component.
 * This TanStack build types `meta` as JSX meta attributes and so rejects an entry whose only key is
 * `script:ld+json`, even though its runtime handles exactly that shape — hence the bridging cast.
 */
export function jsonLdMeta(data: Record<string, unknown>): MetaTag {
  return { 'script:ld+json': data } as unknown as MetaTag;
}

/** Organization schema — declared once on the root so it rides along on every page. */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/brand/icon.png'),
  };
}
