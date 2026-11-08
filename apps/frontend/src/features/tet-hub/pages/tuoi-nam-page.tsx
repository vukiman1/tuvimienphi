import type { ReactElement } from 'react';
import type { TuoiNamFacts } from '@org/shared-tu-vi';
import type { TuoiNamArticle } from '@org/shared-contracts';
import { HowWeCount } from '../components/HowWeCount';
import { TetHubBreadcrumb } from '../components/TetHubBreadcrumb';
import { TetHubCta } from '../components/TetHubCta';
import { TuoiNamArticleView } from '../components/TuoiNamArticleView';
import { TuoiNamFaq } from '../components/TuoiNamFaq';
import { TuoiNamRelated } from '../components/TuoiNamRelated';
import { TuoiNamSummary } from '../components/TuoiNamSummary';
import { tuoiNamBreadcrumb } from '../tuoi-nam-breadcrumb';

interface TuoiNamPageProps {
  readonly facts: TuoiNamFacts;
  readonly article: TuoiNamArticle;
}

export function TuoiNamPage({ facts, article }: TuoiNamPageProps): ReactElement {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      <TetHubBreadcrumb items={tuoiNamBreadcrumb(facts)} />
      <h1 className="mt-4 text-[26px] leading-tight font-semibold text-[#2a1f0e] md:text-[30px]">
        Tử vi tuổi {facts.canChi} {facts.birthYear} năm {facts.viewYear}
      </h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <TuoiNamSummary
          facts={facts}
          className="lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:self-start"
        />
        <div className="flex min-w-0 flex-col gap-10 lg:col-start-1 lg:row-start-1">
          <TuoiNamArticleView facts={facts} article={article} />
          <TetHubCta />
          <HowWeCount />
          <TuoiNamFaq faq={article.faq} />
          <TuoiNamRelated facts={facts} />
        </div>
      </div>
    </main>
  );
}
