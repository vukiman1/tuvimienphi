import { queryOptions } from '@tanstack/react-query';
import { birthKey, type BirthInput, type LuanGiaiChapterResponse } from '@org/shared-contracts';
import { httpRequest } from '@/lib/http-request';

/**
 * Query này giữ bài đã đọc để đổi qua mục khác rồi quay lại không phải xin lần nữa. Nó không tự
 * chạy: `enabled` chỉ bật sau khi POST trả về, và chính POST nạp sẵn kết quả vào đây.
 */
export const luanGiaiQueries = {
  chapter: (birth: BirthInput, order: string) =>
    queryOptions({
      queryKey: ['luan-giai', birthKey(birth), order],
      queryFn: () =>
        httpRequest.get<LuanGiaiChapterResponse>(`/luan-giai/${birthKey(birth)}/${order}`),
      staleTime: Infinity,
    }),
};

export function requestChapter(birth: BirthInput, order: string): Promise<LuanGiaiChapterResponse> {
  return httpRequest.post<LuanGiaiChapterResponse>(`/luan-giai/${order}`, birth);
}
