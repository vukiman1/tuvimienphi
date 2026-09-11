import { createFileRoute, redirect } from '@tanstack/react-router';
import { birthInputSchema } from '@/features/la-so/birth-input';
import { LaSoPage } from '@/features/la-so/pages/la-so-page';
import { seo } from '@/lib/seo';

/** Không đủ thông tin sinh thì không có lá số nào để dựng — trả về trang nhập. */
export const Route = createFileRoute('/_site/la-so/detail')({
  component: LaSoPage,
  // Lá số dựng từ tham số sinh trong URL — nội dung cá nhân, không nên đưa vào chỉ mục.
  head: () =>
    seo({
      title: 'Lá số tử vi của bạn',
      description: 'Lá số tử vi được lập theo ngày giờ sinh bạn cung cấp.',
      path: '/la-so/detail',
      noindex: true,
    }),
  beforeLoad: ({ search }) => {
    if (!birthInputSchema.safeParse(search).success) {
      throw redirect({ to: '/la-so' });
    }
  },
});
