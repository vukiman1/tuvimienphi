import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import type { TetHubIntro } from '@org/shared-contracts';
import { ArticleParagraphs } from '../components/ArticleParagraphs';
import { ConGiapTiles } from '../components/ConGiapTiles';
import { TetHubBreadcrumb } from '../components/TetHubBreadcrumb';
import { TetHubCta } from '../components/TetHubCta';
import { TET_HUB_BREADCRUMB } from '../tet-hub-breadcrumb';

const VAN_HAN_PATH = '/van-han';

interface TetHubPageProps {
  readonly intro: TetHubIntro;
}

export function TetHubPage({ intro }: TetHubPageProps): ReactElement {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <TetHubBreadcrumb items={TET_HUB_BREADCRUMB} />
      <h1 className="mt-4 text-[26px] leading-tight font-semibold text-[#2a1f0e] md:text-[30px]">
        Tử vi 2027 theo tuổi
      </h1>
      <div className="mt-6 flex flex-col gap-10">
        {intro.intro.length > 0 ? (
          <div className="text-[17px] leading-relaxed text-[#3b2d18]">
            <ArticleParagraphs paragraphs={intro.intro} />
          </div>
        ) : null}
        <ConGiapTiles />
        <p className="text-[15px] text-[#3b2d18]">
          Muốn xem vận hạn theo con giáp qua các năm?{' '}
          <Link
            to={VAN_HAN_PATH}
            className="font-semibold text-[#9e2b1e] underline-offset-4 hover:underline"
          >
            Xem vận hạn theo con giáp
          </Link>
        </p>
        <TetHubCta />
      </div>
    </main>
  );
}
