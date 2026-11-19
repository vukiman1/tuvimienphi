import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { hubHead } from '@/features/kien-thuc/head/hub-head';
import { HubPage } from '@/features/kien-thuc/pages/hub-page';
import { loadHubPage } from '@/features/kien-thuc/route-data/hub-route';
import { loadKienThucSearchIndex } from '@/features/kien-thuc/search/load-search-index';

function HubRoute(): ReactElement {
  const manifest = Route.useLoaderData();
  return <HubPage manifest={manifest} loadSearchIndex={loadKienThucSearchIndex} />;
}

export const Route = createFileRoute('/_site/kien-thuc/')({
  loader: () =>
    import('@/features/kien-thuc/kien-thuc-content').then(({ KIEN_THUC_SOURCE }) =>
      loadHubPage(KIEN_THUC_SOURCE),
    ),
  head: () => hubHead(),
  component: HubRoute,
});
