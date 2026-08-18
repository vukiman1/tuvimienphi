import { createFileRoute } from '@tanstack/react-router';
import { KienThucPage } from '@/features/kien-thuc/pages/kien-thuc-page';

export const Route = createFileRoute('/_site/kien-thuc/')({
  component: KienThucPage,
});
