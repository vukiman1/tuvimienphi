import { createFileRoute } from '@tanstack/react-router';
import { GieoQuePage } from '@/features/gieo-que/pages/gieo-que-page';

export const Route = createFileRoute('/_site/gieo-que')({
  component: GieoQuePage,
});
