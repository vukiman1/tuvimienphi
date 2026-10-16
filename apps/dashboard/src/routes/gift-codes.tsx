import { createFileRoute } from '@tanstack/react-router';
import { GiftCodesPage } from '@/features/admin/pages/gift-codes-page';

export const Route = createFileRoute('/gift-codes')({
  component: GiftCodesPage,
});
