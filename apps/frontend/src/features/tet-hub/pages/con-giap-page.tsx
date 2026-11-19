import type { ReactElement } from 'react';
import { CHI, TET_HUB_VIEW_YEAR } from '@org/shared-tu-vi';
import type { ConGiapArticle } from '@org/shared-contracts';
import { Breadcrumb, Emphasis, PageHero, ReadingZone } from '@/design-system';
import { ArticleParagraphs } from '../components/ArticleParagraphs';
import { ArticleSection } from '../components/ArticleSection';
import { ConGiapYearTiles } from '../components/ConGiapYearTiles';
import { HowWeCount } from '../components/HowWeCount';
import { TetHubCta } from '../components/TetHubCta';
import { conGiapBreadcrumb } from '../con-giap-breadcrumb';
import { TET_HUB_EYEBROW } from '../tet-hub-eyebrow';
import { conGiapPainting } from '../tet-hub-paintings';

interface ConGiapPageProps {
  readonly chi: number;
  readonly article: ConGiapArticle;
}

export function ConGiapPage({ chi, article }: ConGiapPageProps): ReactElement {
  const chiName = CHI[chi];

  return (
    <main className="w-full bg-day">
      <PageHero
        breadcrumb={<Breadcrumb items={conGiapBreadcrumb(chi)} />}
        eyebrow={TET_HUB_EYEBROW}
        painting={conGiapPainting(chi)}
        title={
          <>
            Tử vi tuổi <Emphasis isAccent>{chiName}</Emphasis> năm {TET_HUB_VIEW_YEAR}
          </>
        }
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-10 md:px-6 md:py-14">
        <ReadingZone>
          <article className="flex flex-col gap-10">
            <ArticleSection
              id="tong-quan"
              title={`Tổng quan tuổi ${chiName} năm ${TET_HUB_VIEW_YEAR}`}
            >
              <ArticleParagraphs paragraphs={article.tongQuan} />
            </ArticleSection>
            <ArticleSection id="tam-tai" title="Tam tai">
              <ArticleParagraphs paragraphs={article.tamTai} />
            </ArticleSection>
            <ArticleSection id="thai-tue" title="Thái tuế">
              <ArticleParagraphs paragraphs={article.thaiTue} />
            </ArticleSection>
            <ArticleSection id="xong-dat" title={`Tuổi hợp xông đất cho gia chủ tuổi ${chiName}`}>
              <ArticleParagraphs paragraphs={article.xongDat} />
            </ArticleSection>
          </article>
        </ReadingZone>
        <ConGiapYearTiles chi={chi} />
        <ReadingZone>
          <div className="flex flex-col gap-10">
            <TetHubCta />
            <HowWeCount />
          </div>
        </ReadingZone>
      </div>
    </main>
  );
}
