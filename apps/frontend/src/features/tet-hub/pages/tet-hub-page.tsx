import type { ReactElement } from 'react';
import type { TetHubIntro } from '@org/shared-contracts';
import { PageHero, ReadingZone, TextLink } from '@/design-system';
import { ArticleParagraphs } from '../components/ArticleParagraphs';
import { ConGiapTiles } from '../components/ConGiapTiles';
import { TetHubBreadcrumb } from '../components/TetHubBreadcrumb';
import { TetHubCta } from '../components/TetHubCta';
import { TET_HUB_BREADCRUMB } from '../tet-hub-breadcrumb';
import { TET_HUB_EYEBROW } from '../tet-hub-eyebrow';
import { TET_EVE_PAINTING } from '../tet-hub-paintings';
import { TET_HUB_LINK_LABEL } from '../tet-hub-paths';

const VAN_HAN_PATH = '/van-han';

interface TetHubPageProps {
  readonly intro: TetHubIntro;
}

export function TetHubPage({ intro }: TetHubPageProps): ReactElement {
  return (
    <main className="w-full bg-day">
      <PageHero
        breadcrumb={<TetHubBreadcrumb items={TET_HUB_BREADCRUMB} />}
        eyebrow={TET_HUB_EYEBROW}
        title={TET_HUB_LINK_LABEL}
        painting={TET_EVE_PAINTING}
      >
        <ConGiapTiles />
      </PageHero>
      <div className="px-4 py-10 md:px-6 md:py-14">
        <ReadingZone>
          <div className="flex flex-col gap-10">
            {intro.intro.length > 0 ? <ArticleParagraphs paragraphs={intro.intro} /> : null}
            <div>
              <p>Muốn xem vận hạn theo con giáp qua các năm?</p>
              <div className="mt-4">
                <TextLink to={VAN_HAN_PATH}>Xem vận hạn theo con giáp</TextLink>
              </div>
            </div>
            <TetHubCta />
          </div>
        </ReadingZone>
      </div>
    </main>
  );
}
