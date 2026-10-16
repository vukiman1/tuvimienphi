import { createFileRoute } from '@tanstack/react-router';
import { PaymentsPage } from '@/features/admin/pages/payments-page';

export const Route = createFileRoute('/payments')({
  component: PaymentsPage,
});
