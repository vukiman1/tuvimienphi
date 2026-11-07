import {
  TET_HUB_VIEW_YEAR,
  findConGiapBySlug,
  findTuoiNamBySlug,
  tuoiNamFacts,
  type TuoiNamFacts,
} from '@org/shared-tu-vi';
import type { ConGiapArticle, TuoiNamArticle } from '@org/shared-contracts';
import { seo } from '@/lib/seo';
import { TET_HUB_NOT_FOUND_DESCRIPTION, TET_HUB_NOT_FOUND_TITLE } from './tet-hub-not-found-copy';
import { tetHubPagePath } from './tet-hub-paths';
import { conGiapHead } from './con-giap-head';
import { tuoiNamHead } from './tuoi-nam-head';

export enum TetHubPageKind {
  TuoiNam = 'tuoi-nam',
  ConGiap = 'con-giap',
  NotFound = 'not-found',
}

export interface TuoiNamPageData {
  readonly kind: TetHubPageKind.TuoiNam;
  readonly facts: TuoiNamFacts;
  readonly article: TuoiNamArticle;
}

export interface ConGiapPageData {
  readonly kind: TetHubPageKind.ConGiap;
  readonly chi: number;
  readonly article: ConGiapArticle;
}

export interface NotFoundPageData {
  readonly kind: TetHubPageKind.NotFound;
}

export type TetHubSlugPageData = TuoiNamPageData | ConGiapPageData | NotFoundPageData;

export type TuoiNamArticleLoader = (slug: string) => Promise<TuoiNamArticle | undefined>;
export type ConGiapArticleLoader = (slug: string) => Promise<ConGiapArticle | undefined>;

export interface TetHubArticleLoaders {
  readonly tuoiNam: TuoiNamArticleLoader;
  readonly conGiap: ConGiapArticleLoader;
}

const NOT_FOUND: NotFoundPageData = { kind: TetHubPageKind.NotFound };

async function loadTuoiNamPage(
  birthYear: number,
  slug: string,
  loadArticle: TuoiNamArticleLoader,
): Promise<TetHubSlugPageData> {
  const article = await loadArticle(slug);
  if (!article) return NOT_FOUND;
  return {
    kind: TetHubPageKind.TuoiNam,
    facts: tuoiNamFacts(birthYear, TET_HUB_VIEW_YEAR),
    article,
  };
}

async function loadConGiapPage(
  chi: number,
  slug: string,
  loadArticle: ConGiapArticleLoader,
): Promise<TetHubSlugPageData> {
  const article = await loadArticle(slug);
  if (!article) return NOT_FOUND;
  return { kind: TetHubPageKind.ConGiap, chi, article };
}

export async function loadTetHubSlugPage(
  slug: string,
  loaders: TetHubArticleLoaders,
): Promise<TetHubSlugPageData> {
  const birthYear = findTuoiNamBySlug(slug);
  if (birthYear !== undefined) return loadTuoiNamPage(birthYear, slug, loaders.tuoiNam);

  const chi = findConGiapBySlug(slug);
  if (chi !== undefined) return loadConGiapPage(chi, slug, loaders.conGiap);

  return NOT_FOUND;
}

function notFoundHead(slug: string): ReturnType<typeof seo> {
  return seo({
    title: TET_HUB_NOT_FOUND_TITLE,
    description: TET_HUB_NOT_FOUND_DESCRIPTION,
    path: tetHubPagePath(slug),
    noindex: true,
  });
}

export function tetHubSlugHead(
  slug: string,
  data: TetHubSlugPageData | undefined,
): ReturnType<typeof seo> {
  if (data?.kind === TetHubPageKind.TuoiNam) return tuoiNamHead(data.facts, data.article);
  if (data?.kind === TetHubPageKind.ConGiap) return conGiapHead(data.chi, data.article);
  return notFoundHead(slug);
}
