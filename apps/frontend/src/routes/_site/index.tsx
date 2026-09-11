import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/features/home/pages/home-page';
import { SITE_NAME, seo } from '@/lib/seo';

export const Route = createFileRoute('/_site/')({
  component: HomePage,
  head: () =>
    seo({
      title: `${SITE_NAME} — Xem tử vi, lá số, ngày tốt online`,
      titleExact: true,
      description:
        'Xem tử vi miễn phí, lập lá số tử vi, tra ngày tốt xấu và vận hạn theo năm. Luận giải chi tiết, dễ hiểu cho người mới.',
      path: '/',
    }),
});
