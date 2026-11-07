import { tuoiNamSlug, type TuoiNamFacts } from '@org/shared-tu-vi';
import type { TuoiNamArticle } from '@org/shared-contracts';
import { SITE_NAME, absoluteUrl, jsonLdMeta, seo } from '@/lib/seo';
import { tetHubPagePath } from './tet-hub-paths';
import { tuoiNamBreadcrumb } from './tuoi-nam-breadcrumb';

type SeoHead = ReturnType<typeof seo>;

const SCHEMA_CONTEXT = 'https://schema.org';
const PUBLISHER_LOGO_PATH = '/brand/icon.png';

function tuoiNamTitle(facts: TuoiNamFacts): string {
  return `Tử vi tuổi ${facts.canChi} ${facts.birthYear} năm ${facts.viewYear}: sao chiếu mệnh, hạn, Tam tai (nam & nữ)`;
}

function tuoiNamDescription(facts: TuoiNamFacts): string {
  return `Tuổi ${facts.canChi} ${facts.birthYear} năm ${facts.viewYear} (tuổi mụ ${facts.tuoi}, mệnh ${facts.menh.name}): nam mạng sao ${facts.nam.sao}, hạn ${facts.nam.han}; nữ mạng sao ${facts.nu.sao}, hạn ${facts.nu.han}. Kèm Tam tai, Thái tuế và lời khuyên cho cả năm.`;
}

function articleJsonLd(
  facts: TuoiNamFacts,
  article: TuoiNamArticle,
  path: string,
): Record<string, unknown> {
  const organization = { '@type': 'Organization', name: SITE_NAME };
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Article',
    headline: tuoiNamTitle(facts),
    description: tuoiNamDescription(facts),
    datePublished: article.generatedAt,
    dateModified: article.generatedAt,
    inLanguage: 'vi',
    url: absoluteUrl(path),
    author: organization,
    publisher: {
      ...organization,
      logo: { '@type': 'ImageObject', url: absoluteUrl(PUBLISHER_LOGO_PATH) },
    },
  };
}

function breadcrumbJsonLd(facts: TuoiNamFacts): Record<string, unknown> {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: tuoiNamBreadcrumb(facts).map(({ name, path }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: absoluteUrl(path),
    })),
  };
}

function faqPageJsonLd(article: TuoiNamArticle): Record<string, unknown> {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'FAQPage',
    mainEntity: article.faq.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

export function tuoiNamHead(facts: TuoiNamFacts, article: TuoiNamArticle): SeoHead {
  const path = tetHubPagePath(tuoiNamSlug(facts.birthYear));
  const base = seo({
    title: tuoiNamTitle(facts),
    description: tuoiNamDescription(facts),
    path,
    type: 'article',
  });
  return {
    ...base,
    meta: [
      ...base.meta,
      jsonLdMeta(articleJsonLd(facts, article, path)),
      jsonLdMeta(breadcrumbJsonLd(facts)),
      jsonLdMeta(faqPageJsonLd(article)),
    ],
  };
}
