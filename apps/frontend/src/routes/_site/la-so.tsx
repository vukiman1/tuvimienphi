import { createFileRoute } from '@tanstack/react-router';
import { birthSearchSchema } from '@/features/la-so/birth-input';
import { LaSoPage } from '@/features/la-so/pages/la-so-page';

export const Route = createFileRoute('/_site/la-so')({
  component: LaSoPage,
  validateSearch: birthSearchSchema,
});
