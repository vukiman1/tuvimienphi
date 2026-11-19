import type { ReactElement } from 'react';
import type { KienThucManifest } from '@org/shared-contracts';
import { KIEN_THUC_STEPS } from '@org/shared-kien-thuc';
import { Emphasis, PageHero, TextLink } from '@/design-system';
import { TET_HUB_LINK_LABEL, TET_HUB_PATH } from '@/features/tet-hub/tet-hub-paths';
import { HeroStartButton } from '../components/hero-start-button';
import { KienThucCta } from '../components/kien-thuc-cta';
import { ReferenceTiles } from '../components/reference-tiles';
import { StepList } from '../components/step-list';
import type { SearchIndexLoader } from '../content-source';
import { HubProgressSlot } from '../progress/hub-progress-slot';
import { publishedLessons } from '../published-pages';
import { SearchBox } from '../search/search-box';

const HUB_EYEBROW = 'Học tử vi từ đầu';
const HUB_LEAD =
  'Mỗi bước vài bài ngắn, đọc theo thứ tự: từ lá số là gì đến đọc lá số của chính bạn.';

interface HubPageProps {
  readonly manifest: KienThucManifest;
  readonly loadSearchIndex: SearchIndexLoader;
}

export function HubPage({ manifest, loadSearchIndex }: HubPageProps): ReactElement {
  return (
    <main className="w-full bg-day">
      <PageHero
        eyebrow={HUB_EYEBROW}
        title={
          <>
            Đọc lá số trong <Emphasis isAccent>{`${KIEN_THUC_STEPS.length} bước`}</Emphasis>
          </>
        }
        lead={HUB_LEAD}
      >
        <div className="flex max-w-xl flex-col gap-4">
          <HeroStartButton manifest={manifest} />
          <SearchBox
            loadSearchIndex={loadSearchIndex}
            firstLesson={publishedLessons(manifest)[0]}
          />
        </div>
      </PageHero>
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-10 md:px-6 md:py-14">
        <div className="flex flex-col gap-6">
          <StepList manifest={manifest} />
          <HubProgressSlot />
        </div>
        <ReferenceTiles manifest={manifest} />
        <div>
          <TextLink to={TET_HUB_PATH}>{`${TET_HUB_LINK_LABEL} →`}</TextLink>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-14 md:px-6">
        <KienThucCta />
      </div>
    </main>
  );
}
