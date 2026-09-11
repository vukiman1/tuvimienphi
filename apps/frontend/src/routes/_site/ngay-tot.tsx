import { createFileRoute } from '@tanstack/react-router';
import { NgayTotPage } from '@/features/ngay-tot/pages/ngay-tot-page';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/_site/ngay-tot')({
  component: NgayTotPage,
  head: () =>
    seo({
      title: 'Xem ngày tốt xấu',
      description:
        'Tra cứu ngày tốt xấu theo lịch âm dương: ngày hoàng đạo, hắc đạo, giờ tốt để cưới hỏi, khai trương, xuất hành, động thổ.',
      path: '/ngay-tot',
    }),
});
