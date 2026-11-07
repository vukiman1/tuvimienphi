import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { TetHubSlugPage } from '@/features/tet-hub/pages/tet-hub-slug-page';
import {
  loadTetHubSlugPage,
  tetHubSlugHead,
  type TetHubSlugPageData,
} from '@/features/tet-hub/tet-hub-slug-route';

async function loadPage(slug: string): Promise<TetHubSlugPageData> {
  const { loadConGiapArticle, loadTuoiNamArticle } =
    await import('@/features/tet-hub/tet-hub-content');
  return loadTetHubSlugPage(slug, { tuoiNam: loadTuoiNamArticle, conGiap: loadConGiapArticle });
}

function TetHubSlugRoute(): ReactElement {
  return <TetHubSlugPage data={Route.useLoaderData()} />;
}

export const Route = createFileRoute('/_site/kien-thuc/tu-vi-2027/$slug')({
  loader: ({ params }) => loadPage(params.slug),
  head: ({ params, loaderData }) => tetHubSlugHead(params.slug, loaderData),
  component: TetHubSlugRoute,
});
