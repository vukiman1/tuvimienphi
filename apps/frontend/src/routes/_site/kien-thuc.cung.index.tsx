import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ContentKind } from '@org/shared-contracts';
import { KienThucNotFound } from '@/features/kien-thuc/components/kien-thuc-not-found';
import { indexHead } from '@/features/kien-thuc/head/index-head';
import { IndexPage } from '@/features/kien-thuc/pages/index-page';
import { loadIndexPage } from '@/features/kien-thuc/route-data/index-route';
import { KienThucPageStatus } from '@/features/kien-thuc/route-data/kien-thuc-page-status';

function CungIndexRoute(): ReactElement {
  const data = Route.useLoaderData();
  if (data.status === KienThucPageStatus.NotFound) {
    return <KienThucNotFound />;
  }
  return <IndexPage data={data} />;
}

export const Route = createFileRoute('/_site/kien-thuc/cung/')({
  loader: () =>
    import('@/features/kien-thuc/kien-thuc-content').then(({ KIEN_THUC_SOURCE }) =>
      loadIndexPage(ContentKind.Cung, KIEN_THUC_SOURCE),
    ),
  head: ({ loaderData }) => indexHead(ContentKind.Cung, loaderData),
  component: CungIndexRoute,
});
