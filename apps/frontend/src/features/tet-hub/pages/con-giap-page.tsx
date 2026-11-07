import type { ReactElement } from 'react';
import { CHI, TET_HUB_VIEW_YEAR } from '@org/shared-tu-vi';
import type { ConGiapArticle } from '@org/shared-contracts';
import { ArticleParagraphs } from '../components/ArticleParagraphs';
import { ArticleSection } from '../components/ArticleSection';
import { ConGiapYearTiles } from '../components/ConGiapYearTiles';
import { HowWeCount } from '../components/HowWeCount';
import { TetHubBreadcrumb } from '../components/TetHubBreadcrumb';
import { TetHubCta } from '../components/TetHubCta';
import { conGiapBreadcrumb } from '../con-giap-breadcrumb';

interface ConGiapPageProps {
  readonly chi: number;
  readonly article: ConGiapArticle;
}

export function ConGiapPage({ chi, article }: ConGiapPageProps): ReactElement {
  const chiName = CHI[chi];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <TetHubBreadcrumb items={conGiapBreadcrumb(chi)} />
      <h1 className="mt-4 text-[26px] leading-tight font-semibold text-[#2a1f0e] md:text-[30px]">
        Tử vi tuổi {chiName} năm {TET_HUB_VIEW_YEAR}
      </h1>
      <div className="mt-6 flex flex-col gap-10">
        <article className="flex flex-col gap-10 rounded-2xl border border-[#e7d9bf] bg-[#fffaf0] px-5 py-7 text-[17px] leading-relaxed text-[#3b2d18] md:px-8">
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
        <ConGiapYearTiles chi={chi} chiName={chiName} />
        <TetHubCta />
        <HowWeCount />
      </div>
    </main>
  );
}
