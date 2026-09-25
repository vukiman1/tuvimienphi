import { createFileRoute } from '@tanstack/react-router';
import { BlogPage } from '@/features/admin/pages/blog-page';

export const Route = createFileRoute('/blog')({
  component: BlogPage,
});
