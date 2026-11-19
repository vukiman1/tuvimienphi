import type { ReactElement } from 'react';
import type { KienThucManifest } from '@org/shared-contracts';
import { KIEN_THUC_STEPS } from '@org/shared-kien-thuc';
import { TextLink } from '@/design-system';
import { TET_HUB_LINK_LABEL, TET_HUB_PATH } from '@/features/tet-hub/tet-hub-paths';
import { HeroStartButton } from '../components/hero-start-button';
import { HubHero } from '../components/hub-hero';
import { KienThucCta } from '../components/kien-thuc-cta';
import { ReferenceTiles } from '../components/reference-tiles';
import { StepList } from '../components/step-list';
import type { SearchIndexLoader } from '../content-source';
import { HubProgressSlot } from '../progress/hub-progress-slot';
import { publishedLessons } from '../published-pages';
import { SearchBox } from '../search/search-box';

const HUB_EYEBROW = 'Học tử vi từ đầu';
const HUB_TITLE = 'Đọc lá số trong';
const HUB_LEAD =
  'Mỗi bước vài bài ngắn, đọc theo thứ tự: từ lá số là gì đến đọc lá số của chính bạn.';

interface HubPageProps {
  readonly manifest: KienThucManifest;
  readonly loadSearchIndex: SearchIndexLoader;
}

export function HubPage({ manifest, loadSearchIndex }: HubPageProps): ReactElement {
  return (
    <main className="w-full bg-day">
      <HubHero
        eyebrow={HUB_EYEBROW}
        title={HUB_TITLE}
        accent={`${KIEN_THUC_STEPS.length} bước`}
        lead={HUB_LEAD}
      >
        <div className="flex flex-col gap-6 md:gap-10">
          <HeroStartButton manifest={manifest} />
          <div className="w-full md:max-w-sm">
            <SearchBox
              loadSearchIndex={loadSearchIndex}
              firstLesson={publishedLessons(manifest)[0]}
            />
          </div>
        </div>
      </HubHero>
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
