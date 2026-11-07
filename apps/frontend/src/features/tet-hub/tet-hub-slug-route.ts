import {
  TET_HUB_VIEW_YEAR,
  findTuoiNamBySlug,
  tuoiNamFacts,
  type TuoiNamFacts,
} from '@org/shared-tu-vi';
import type { TuoiNamArticle } from '@org/shared-contracts';
import { seo } from '@/lib/seo';
import { tetHubPagePath } from './tet-hub-paths';
import { tuoiNamHead } from './tuoi-nam-head';

export enum TetHubPageKind {
  TuoiNam = 'tuoi-nam',
  NotFound = 'not-found',
}

export interface TuoiNamPageData {
  readonly kind: TetHubPageKind.TuoiNam;
  readonly facts: TuoiNamFacts;
  readonly article: TuoiNamArticle;
}

export interface NotFoundPageData {
  readonly kind: TetHubPageKind.NotFound;
}

export type TetHubSlugPageData = TuoiNamPageData | NotFoundPageData;

export type TuoiNamArticleLoader = (slug: string) => Promise<TuoiNamArticle | undefined>;

const NOT_FOUND: NotFoundPageData = { kind: TetHubPageKind.NotFound };

export async function loadTetHubSlugPage(
  slug: string,
  loadArticle: TuoiNamArticleLoader,
): Promise<TetHubSlugPageData> {
  const birthYear = findTuoiNamBySlug(slug);
  if (birthYear === undefined) return NOT_FOUND;

  const article = await loadArticle(slug);
  if (!article) return NOT_FOUND;

  return {
    kind: TetHubPageKind.TuoiNam,
    facts: tuoiNamFacts(birthYear, TET_HUB_VIEW_YEAR),
    article,
  };
}

function notFoundHead(slug: string): ReturnType<typeof seo> {
  return seo({
    title: 'Không tìm thấy trang',
    description: 'Trang tử vi theo tuổi bạn tìm không tồn tại hoặc chưa được đăng.',
    path: tetHubPagePath(slug),
    noindex: true,
  });
}

export function tetHubSlugHead(
  slug: string,
  data: TetHubSlugPageData | undefined,
): ReturnType<typeof seo> {
  if (data?.kind !== TetHubPageKind.TuoiNam) return notFoundHead(slug);
  return tuoiNamHead(data.facts, data.article);
}
