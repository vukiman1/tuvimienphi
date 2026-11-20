import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { VanHanPage } from '@/features/van-han/pages/van-han-page';
import { seo } from '@/lib/seo';
import { vanHanQueries } from '@/services/van-han-service';

function VanHanRoute(): ReactElement {
  const { current, publishedYears } = Route.useLoaderData();
  return <VanHanPage current={current} publishedYears={publishedYears} />;
}

export const Route = createFileRoute('/_site/van-han/')({
  loader: async ({ context }) => {
    const [current, publishedYears] = await Promise.all([
      context.queryClient.ensureQueryData(vanHanQueries.current()),
      context.queryClient.ensureQueryData(vanHanQueries.publishedYears()),
    ]);
    return { current, publishedYears };
  },
  component: VanHanRoute,
  head: () =>
    seo({
      title: 'Xem vận hạn theo năm',
      description:
        'Xem vận hạn, sao chiếu mệnh và hạn Tam Tai theo tuổi trong năm. Biết trước cát hung để chủ động hóa giải.',
      path: '/van-han',
    }),
});
