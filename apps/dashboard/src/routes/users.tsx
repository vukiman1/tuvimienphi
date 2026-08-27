import { createFileRoute } from '@tanstack/react-router';
import { UsersPage } from '@/features/admin/pages/users-page';
import { adminQueries } from '@/features/admin/data/queries';

export const Route = createFileRoute('/users')({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminQueries.users()),
  component: UsersPage,
});
