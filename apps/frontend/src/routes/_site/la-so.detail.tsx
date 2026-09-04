import { createFileRoute, redirect } from '@tanstack/react-router';
import { birthInputSchema } from '@/features/la-so/birth-input';
import { LaSoPage } from '@/features/la-so/pages/la-so-page';

/** Không đủ thông tin sinh thì không có lá số nào để dựng — trả về trang nhập. */
export const Route = createFileRoute('/_site/la-so/detail')({
  component: LaSoPage,
  beforeLoad: ({ search }) => {
    if (!birthInputSchema.safeParse(search).success) {
      throw redirect({ to: '/la-so' });
    }
  },
});
