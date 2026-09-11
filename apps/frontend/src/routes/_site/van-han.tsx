import { createFileRoute } from '@tanstack/react-router';
import { VanHanPage } from '@/features/van-han/pages/van-han-page';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/_site/van-han')({
  component: VanHanPage,
  head: () =>
    seo({
      title: 'Xem vận hạn theo năm',
      description:
        'Xem vận hạn, sao chiếu mệnh và hạn Tam Tai theo tuổi trong năm. Biết trước cát hung để chủ động hóa giải.',
      path: '/van-han',
    }),
});
