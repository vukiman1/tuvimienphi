import { tuoiNamSlug, type TuoiNamFacts } from '@org/shared-tu-vi';
import type { TuoiNamArticle } from '@org/shared-contracts';
import { jsonLdMeta, seo } from '@/lib/seo';
import { tetHubPagePath } from './tet-hub-paths';
import { articleJsonLd, breadcrumbJsonLd, faqPageJsonLd } from './tet-hub-json-ld';
import { tuoiNamBreadcrumb } from './tuoi-nam-breadcrumb';

type SeoHead = ReturnType<typeof seo>;

function tuoiNamTitle(facts: TuoiNamFacts): string {
  return `Tử vi tuổi ${facts.canChi} ${facts.birthYear} năm ${facts.viewYear}: sao chiếu mệnh, hạn, Tam tai (nam & nữ)`;
}

function tuoiNamDescription(facts: TuoiNamFacts): string {
  return `Tuổi ${facts.canChi} ${facts.birthYear} năm ${facts.viewYear} (tuổi mụ ${facts.tuoi}, mệnh ${facts.menh.name}): nam mạng sao ${facts.nam.sao}, hạn ${facts.nam.han}; nữ mạng sao ${facts.nu.sao}, hạn ${facts.nu.han}. Kèm Tam tai, Thái tuế và lời khuyên cho cả năm.`;
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
      jsonLdMeta(
        articleJsonLd({
          headline: tuoiNamTitle(facts),
          description: tuoiNamDescription(facts),
          path,
          generatedAt: article.generatedAt,
        }),
      ),
      jsonLdMeta(breadcrumbJsonLd(tuoiNamBreadcrumb(facts))),
      jsonLdMeta(faqPageJsonLd(article.faq)),
    ],
  };
}
