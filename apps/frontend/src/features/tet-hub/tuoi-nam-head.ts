import { tuoiNamSlug, type TuoiNamFacts } from '@org/shared-tu-vi';
import type { TuoiNamArticle } from '@org/shared-contracts';
import { articlePageHead, faqPageJsonLd, type SeoHead } from './tet-hub-json-ld';
import { tetHubPagePath } from './tet-hub-paths';
import { tuoiNamBreadcrumb } from './tuoi-nam-breadcrumb';

function tuoiNamTitle(facts: TuoiNamFacts): string {
  return `Tử vi tuổi ${facts.canChi} ${facts.birthYear} năm ${facts.viewYear}: sao chiếu mệnh, hạn, Tam tai (nam & nữ)`;
}

function tuoiNamDescription(facts: TuoiNamFacts): string {
  return `Tuổi ${facts.canChi} ${facts.birthYear} năm ${facts.viewYear} (tuổi mụ ${facts.tuoi}, mệnh ${facts.menh.name}): nam mạng sao ${facts.nam.sao}, hạn ${facts.nam.han}; nữ mạng sao ${facts.nu.sao}, hạn ${facts.nu.han}. Kèm Tam tai, Thái tuế và lời khuyên cho cả năm.`;
}

export function tuoiNamHead(facts: TuoiNamFacts, article: TuoiNamArticle): SeoHead {
  return articlePageHead({
    title: tuoiNamTitle(facts),
    description: tuoiNamDescription(facts),
    path: tetHubPagePath(tuoiNamSlug(facts.birthYear)),
    generatedAt: article.generatedAt,
    breadcrumb: tuoiNamBreadcrumb(facts),
    extraJsonLd: [faqPageJsonLd(article.faq)],
  });
}
