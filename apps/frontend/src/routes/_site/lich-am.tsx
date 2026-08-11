import { createFileRoute } from '@tanstack/react-router';
import { LichAmPage } from '@/features/lich-am/pages/lich-am-page';

export const Route = createFileRoute('/_site/lich-am')({
  component: LichAmPage,
});
