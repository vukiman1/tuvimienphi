import { createFileRoute } from '@tanstack/react-router';
import { VanHanEditorPage } from '@/features/admin/pages/van-han-editor-page';

export const Route = createFileRoute('/van-han_/$year/$zodiacOrder')({
  params: {
    parse: ({ year, zodiacOrder }) => ({ year: Number(year), zodiacOrder: Number(zodiacOrder) }),
    stringify: ({ year, zodiacOrder }) => ({
      year: String(year),
      zodiacOrder: String(zodiacOrder),
    }),
  },
  component: VanHanEditorPage,
});
