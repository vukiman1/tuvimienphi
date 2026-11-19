import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ContentKind } from '@org/shared-contracts';
import { KienThucNotFound } from '@/features/kien-thuc/components/kien-thuc-not-found';
import { entryHead } from '@/features/kien-thuc/head/entry-head';
import { EntryPage } from '@/features/kien-thuc/pages/entry-page';
import { loadEntryPage } from '@/features/kien-thuc/route-data/entry-route';
import { KienThucPageStatus } from '@/features/kien-thuc/route-data/kien-thuc-page-status';
import { loadKienThucSearchIndex } from '@/features/kien-thuc/search/load-search-index';

function TermEntryRoute(): ReactElement {
  const data = Route.useLoaderData();
  if (data.status === KienThucPageStatus.NotFound) {
    return <KienThucNotFound />;
  }
  return (
    <EntryPage
      entry={data.entry}
      manifest={data.manifest}
      loadSearchIndex={loadKienThucSearchIndex}
    />
  );
}

export const Route = createFileRoute('/_site/kien-thuc/thuat-ngu/$slug')({
  loader: ({ params }) =>
    import('@/features/kien-thuc/kien-thuc-content').then(({ KIEN_THUC_SOURCE }) =>
      loadEntryPage(ContentKind.ThuatNgu, params.slug, KIEN_THUC_SOURCE),
    ),
  head: ({ params, loaderData }) => entryHead(ContentKind.ThuatNgu, params.slug, loaderData),
  component: TermEntryRoute,
});
