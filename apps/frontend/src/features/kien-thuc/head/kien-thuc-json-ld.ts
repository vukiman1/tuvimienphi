import { SITE_LOGO_PATH, SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/seo';

const SCHEMA_CONTEXT = 'https://schema.org';
const CONTENT_LANGUAGE = 'vi';

interface KienThucArticleJsonLdInput {
  readonly headline: string;
  readonly description: string;
  readonly path: string;
  readonly reviewedAt: string;
  readonly image: string;
}

export function kienThucArticleJsonLd({
  headline,
  description,
  path,
  reviewedAt,
  image,
}: KienThucArticleJsonLdInput): Record<string, unknown> {
  const organization = { '@type': 'Organization', name: SITE_NAME, url: SITE_URL };
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Article',
    headline,
    description,
    datePublished: reviewedAt,
    dateModified: reviewedAt,
    inLanguage: CONTENT_LANGUAGE,
    url: absoluteUrl(path),
    image: absoluteUrl(image),
    author: organization,
    publisher: {
      ...organization,
      logo: { '@type': 'ImageObject', url: absoluteUrl(SITE_LOGO_PATH) },
    },
  };
}
