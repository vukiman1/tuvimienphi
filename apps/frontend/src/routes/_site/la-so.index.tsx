import { createFileRoute, redirect } from '@tanstack/react-router';
import { birthInputSchema } from '@/features/la-so/birth-input';
import { LaSoHistoryPage } from '@/features/la-so/pages/la-so-history-page';
import { seo } from '@/lib/seo';

/**
 * Lá số từng sống ở chính `/la-so`, nên link và bookmark cũ vẫn mang đủ tham số sinh tới đây —
 * chuyển tiếp sang trang lá số thay vì bắt người ta nhập lại.
 */
export const Route = createFileRoute('/_site/la-so/')({
  component: LaSoHistoryPage,
  head: () =>
    seo({
      title: 'Lập lá số tử vi online',
      description:
        'Lập lá số tử vi miễn phí theo ngày giờ sinh. An sao chính xác, luận giải 12 cung mệnh chi tiết và dễ hiểu.',
      path: '/la-so',
    }),
  beforeLoad: ({ search }) => {
    if (birthInputSchema.safeParse(search).success) {
      throw redirect({ to: '/la-so/detail', search });
    }
  },
});
