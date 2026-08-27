import { createFileRoute } from '@tanstack/react-router';
import { BlogPage } from '@/features/admin/pages/blog-page';
import { adminQueries } from '@/features/admin/data/queries';

export const Route = createFileRoute('/blog')({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminQueries.blog()),
  component: BlogPage,
});
