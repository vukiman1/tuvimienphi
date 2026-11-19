import { ContentKind } from '@org/shared-contracts';
import { SITE_LOGO_PATH, SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/seo';
import { indexPath } from '../kien-thuc-paths';

const SCHEMA_CONTEXT = 'https://schema.org';
const CONTENT_LANGUAGE = 'vi';

interface KienThucArticleJsonLdInput {
  readonly headline: string;
  readonly description: string;
  readonly path: string;
  readonly reviewedAt: string;
  readonly image: string;
}

interface DefinedTermJsonLdInput {
  readonly name: string;
  readonly description: string;
  readonly path: string;
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

export function definedTermJsonLd({
  name,
  description,
  path,
}: DefinedTermJsonLdInput): Record<string, unknown> {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'DefinedTerm',
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: CONTENT_LANGUAGE,
    inDefinedTermSet: absoluteUrl(indexPath(ContentKind.ThuatNgu)),
  };
}
