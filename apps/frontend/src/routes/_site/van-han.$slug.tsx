import type { ReactElement } from 'react';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { VanHanZodiacPage } from '@/features/van-han/pages/van-han-zodiac-page';
import { zodiacChiFromVanHanSlug } from '@/features/van-han/van-han-paths';
import { vanHanZodiacHead } from '@/features/van-han/van-han-zodiac-head';
import { vanHanQueries } from '@/services/van-han-service';

function VanHanZodiacRoute(): ReactElement {
  const { chi, current } = Route.useLoaderData();
  return <VanHanZodiacPage chi={chi} current={current} />;
}

export const Route = createFileRoute('/_site/van-han/$slug')({
  loader: async ({ params, context }) => {
    const chi = zodiacChiFromVanHanSlug(params.slug);
    if (!chi) throw notFound();
    const current = await context.queryClient.ensureQueryData(vanHanQueries.current());
    return { chi, current };
  },
  head: ({ loaderData }) =>
    loaderData ? vanHanZodiacHead(loaderData.chi, loaderData.current) : {},
  component: VanHanZodiacRoute,
});
