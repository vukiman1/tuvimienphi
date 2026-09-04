import { createFileRoute, redirect } from '@tanstack/react-router';
import { birthInputSchema } from '@/features/la-so/birth-input';
import { LaSoHistoryPage } from '@/features/la-so/pages/la-so-history-page';

/**
 * Lá số từng sống ở chính `/la-so`, nên link và bookmark cũ vẫn mang đủ tham số sinh tới đây —
 * chuyển tiếp sang trang lá số thay vì bắt người ta nhập lại.
 */
export const Route = createFileRoute('/_site/la-so/')({
  component: LaSoHistoryPage,
  beforeLoad: ({ search }) => {
    if (birthInputSchema.safeParse(search).success) {
      throw redirect({ to: '/la-so/detail', search });
    }
  },
});
