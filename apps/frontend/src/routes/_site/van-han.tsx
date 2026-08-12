import { createFileRoute } from '@tanstack/react-router';
import { VanHanPage } from '@/features/van-han/pages/van-han-page';

export const Route = createFileRoute('/_site/van-han')({
  component: VanHanPage,
});
