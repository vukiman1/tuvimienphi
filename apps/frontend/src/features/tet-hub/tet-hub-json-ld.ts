import type { BreadcrumbItem } from './breadcrumb-item';
import { SITE_NAME, absoluteUrl } from '@/lib/seo';

const SCHEMA_CONTEXT = 'https://schema.org';
const PUBLISHER_LOGO_PATH = '/brand/icon.png';

interface ArticleJsonLdInput {
  readonly headline: string;
  readonly description: string;
  readonly path: string;
  readonly generatedAt?: string;
}

export function articleJsonLd({
  headline,
  description,
  path,
  generatedAt,
}: ArticleJsonLdInput): Record<string, unknown> {
  const organization = { '@type': 'Organization', name: SITE_NAME };
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Article',
    headline,
    description,
    ...(generatedAt ? { datePublished: generatedAt, dateModified: generatedAt } : {}),
    inLanguage: 'vi',
    url: absoluteUrl(path),
    author: organization,
    publisher: {
      ...organization,
      logo: { '@type': 'ImageObject', url: absoluteUrl(PUBLISHER_LOGO_PATH) },
    },
  };
}

export function breadcrumbJsonLd(items: readonly BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map(({ name, path }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: absoluteUrl(path),
    })),
  };
}

export function faqPageJsonLd(
  faq: readonly { readonly question: string; readonly answer: string }[],
): Record<string, unknown> {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'FAQPage',
    mainEntity: faq.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}
