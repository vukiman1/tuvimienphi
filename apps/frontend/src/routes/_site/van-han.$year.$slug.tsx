import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { loadVanHanYearPage } from '@/features/van-han/load-van-han-year-page';
import { VanHanZodiacPage } from '@/features/van-han/pages/van-han-zodiac-page';
import { vanHanZodiacHead } from '@/features/van-han/van-han-zodiac-head';

function VanHanYearZodiacRoute(): ReactElement {
  const { chi, year, published, publishedYears } = Route.useLoaderData();
  return (
    <VanHanZodiacPage
      chi={chi}
      current={published}
      publishedYears={publishedYears}
      yearInPath={year}
    />
  );
}

export const Route = createFileRoute('/_site/van-han/$year/$slug')({
  loader: ({ params, context }) => loadVanHanYearPage(context.queryClient, params),
  head: ({ loaderData }) =>
    loaderData ? vanHanZodiacHead(loaderData.chi, loaderData.published) : {},
  component: VanHanYearZodiacRoute,
});
