import { createFileRoute } from '@tanstack/react-router';
import { AiPage } from '@/features/admin/pages/ai-page';

export const Route = createFileRoute('/ai')({
  component: AiPage,
});
