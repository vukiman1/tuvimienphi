import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ChapterTone } from '@/design-system';
import { HomePage } from '@/features/home/pages/home-page';
import { validateHomeSearch } from '@/features/home/home-search';
import { SITE_NAME, seo } from '@/lib/seo';

function HomeRoute(): ReactElement {
  const { gender, viewYear } = Route.useSearch();
  return <HomePage initialGender={gender} viewYear={viewYear} />;
}

export const Route = createFileRoute('/_site/')({
  component: HomeRoute,
  staticData: { isStoryPage: true, openingTone: ChapterTone.Night },
  validateSearch: validateHomeSearch,
  head: () =>
    seo({
      title: `${SITE_NAME} — Xem tử vi, lá số, ngày tốt online`,
      titleExact: true,
      description:
        'Xem tử vi miễn phí, lập lá số tử vi, tra ngày tốt xấu và vận hạn theo năm. Luận giải chi tiết, dễ hiểu cho người mới.',
      path: '/',
    }),
});
