import { createFileRoute } from '@tanstack/react-router';
import { birthSearchSchema } from '@/features/la-so/birth-input';

/** Thông tin sinh nằm ở tầng này để cả trang nhập lẫn trang lá số cùng đọc một bộ tham số. */
export const Route = createFileRoute('/_site/la-so')({
  validateSearch: birthSearchSchema,
});
