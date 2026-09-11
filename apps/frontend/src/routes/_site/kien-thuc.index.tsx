import { createFileRoute } from '@tanstack/react-router';
import { KienThucPage } from '@/features/kien-thuc/pages/kien-thuc-page';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/_site/kien-thuc/')({
  component: KienThucPage,
  head: () =>
    seo({
      title: 'Kiến thức tử vi',
      description:
        'Tổng hợp kiến thức tử vi từ cơ bản đến chuyên sâu: ý nghĩa sao, 12 cung mệnh, cách xem lá số và ứng dụng vào cuộc sống.',
      path: '/kien-thuc',
    }),
});
