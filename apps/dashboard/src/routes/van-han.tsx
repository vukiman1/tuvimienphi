import { createFileRoute } from '@tanstack/react-router';
import { VanHanPage } from '@/features/admin/pages/van-han-page';

export const Route = createFileRoute('/van-han')({
  component: VanHanPage,
});
