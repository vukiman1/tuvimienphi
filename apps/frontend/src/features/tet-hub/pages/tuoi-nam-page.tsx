import type { ReactElement } from 'react';
import type { TuoiNamFacts } from '@org/shared-tu-vi';
import type { TuoiNamArticle } from '@org/shared-contracts';
import { Breadcrumb, Emphasis, PageHero } from '@/design-system';
import { HowWeCount } from '../components/HowWeCount';
import { TetHubCta } from '../components/TetHubCta';
import { TuoiNamArticleView } from '../components/TuoiNamArticleView';
import { TuoiNamFaq } from '../components/TuoiNamFaq';
import { TuoiNamRelated } from '../components/TuoiNamRelated';
import { TuoiNamSummary } from '../components/TuoiNamSummary';
import { TET_HUB_EYEBROW } from '../tet-hub-eyebrow';
import { conGiapPainting } from '../tet-hub-paintings';
import { tuoiNamBreadcrumb } from '../tuoi-nam-breadcrumb';

interface TuoiNamPageProps {
  readonly facts: TuoiNamFacts;
  readonly article: TuoiNamArticle;
}

export function TuoiNamPage({ facts, article }: TuoiNamPageProps): ReactElement {
  return (
    <main className="w-full bg-day">
      <PageHero
        breadcrumb={<Breadcrumb items={tuoiNamBreadcrumb(facts)} />}
        eyebrow={TET_HUB_EYEBROW}
        painting={conGiapPainting(facts.chi)}
        title={
          <>
            Tử vi tuổi{' '}
            <Emphasis isAccent>
              {facts.canChi} {facts.birthYear}
            </Emphasis>{' '}
            năm {facts.viewYear}
          </>
        }
      />
      <div className="mx-auto grid w-full max-w-reading gap-10 px-4 py-10 md:px-6 md:py-14 lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_20rem]">
        <TuoiNamSummary
          facts={facts}
          className="tall-lg:sticky tall-lg:top-6 lg:col-start-2 lg:row-start-1 lg:self-start"
        />
        <div className="flex min-w-0 flex-col gap-12 lg:col-start-1 lg:row-start-1">
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
