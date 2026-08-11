import { createFileRoute } from '@tanstack/react-router';
import { LaSoPage } from '@/features/la-so/pages/la-so-page';

export const Route = createFileRoute('/_site/la-so')({
  component: LaSoPage,
});
