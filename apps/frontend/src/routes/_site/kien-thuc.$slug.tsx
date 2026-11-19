import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { KienThucNotFound } from '@/features/kien-thuc/components/kien-thuc-not-found';
import { lessonHead } from '@/features/kien-thuc/head/lesson-head';
import { LessonPage } from '@/features/kien-thuc/pages/lesson-page';
import { KienThucPageStatus } from '@/features/kien-thuc/route-data/kien-thuc-page-status';
import { loadLessonPage } from '@/features/kien-thuc/route-data/lesson-route';
import { loadKienThucSearchIndex } from '@/features/kien-thuc/search/load-search-index';

function LessonRoute(): ReactElement {
  const data = Route.useLoaderData();
  if (data.status === KienThucPageStatus.NotFound) {
    return <KienThucNotFound />;
  }
  return (
    <LessonPage
      lesson={data.lesson}
      manifest={data.manifest}
      loadSearchIndex={loadKienThucSearchIndex}
    />
  );
}

export const Route = createFileRoute('/_site/kien-thuc/$slug')({
  loader: ({ params }) =>
    import('@/features/kien-thuc/kien-thuc-content').then(({ KIEN_THUC_SOURCE }) =>
      loadLessonPage(params.slug, KIEN_THUC_SOURCE),
    ),
  head: ({ params, loaderData }) => lessonHead(params.slug, loaderData),
  component: LessonRoute,
});
