import { createFileRoute } from '@tanstack/react-router';
import { NgayTotPage } from '@/features/ngay-tot/pages/ngay-tot-page';

export const Route = createFileRoute('/_site/ngay-tot')({
  component: NgayTotPage,
});
