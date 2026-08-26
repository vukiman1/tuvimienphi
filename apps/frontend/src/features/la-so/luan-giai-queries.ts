import { queryOptions } from '@tanstack/react-query';
import { MOCK_LUAN_GIAI, type LuanGiaiContent } from '@/features/la-so/luan-giai-data';

/**
 * Nội dung từng mục nạp riêng khi người dùng bấm xem, không nạp sẵn cả sáu mục — phần lớn người vào
 * chỉ đọc một hai mục.
 *
 * Hiện `queryFn` trả dữ liệu mẫu sau một quãng chờ để dựng đúng các trạng thái giao diện. Khi có
 * backend thì chỉ thay thân hàm bằng `httpRequest.get`, phần còn lại giữ nguyên.
 */
const MOCK_LATENCY_MS = 700;

function fetchChapterContent(order: string): Promise<LuanGiaiContent | null> {
  const chapter = MOCK_LUAN_GIAI.chapters.find((item) => item.order === order);
  return new Promise((resolve) => {
    setTimeout(() => resolve(chapter?.content ?? null), MOCK_LATENCY_MS);
  });
}

export const luanGiaiQueries = {
  chapter: (order: string) =>
    queryOptions({
      queryKey: ['luan-giai', order],
      queryFn: () => fetchChapterContent(order),
      staleTime: Infinity,
    }),
};
