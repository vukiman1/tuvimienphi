import { createFileRoute } from '@tanstack/react-router';
import { LoginPanel } from '@/features/auth/login-panel';

export const Route = createFileRoute('/login')({
  component: LoginPanel,
});
