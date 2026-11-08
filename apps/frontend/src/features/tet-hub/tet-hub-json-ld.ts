import type { TuoiNamArticle } from '@org/shared-contracts';
import type { BreadcrumbItem } from './breadcrumb-item';
import { SITE_NAME, absoluteUrl, jsonLdMeta, seo } from '@/lib/seo';

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

export function faqPageJsonLd(faq: TuoiNamArticle['faq']): Record<string, unknown> {
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

export type SeoHead = ReturnType<typeof seo>;

interface ArticlePageHeadInput extends Omit<ArticleJsonLdInput, 'headline'> {
  readonly title: string;
  readonly breadcrumb: readonly BreadcrumbItem[];
  readonly extraJsonLd?: readonly Record<string, unknown>[];
}

export function articlePageHead({
  title,
  description,
  path,
  generatedAt,
  breadcrumb,
  extraJsonLd = [],
}: ArticlePageHeadInput): SeoHead {
  const base = seo({ title, description, path, type: 'article' });
  return {
    ...base,
    meta: [
      ...base.meta,
      jsonLdMeta(articleJsonLd({ headline: title, description, path, generatedAt })),
      jsonLdMeta(breadcrumbJsonLd(breadcrumb)),
      ...extraJsonLd.map(jsonLdMeta),
    ],
  };
}
