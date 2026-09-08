import { queryOptions } from '@tanstack/react-query';
import {
  birthKey,
  LuanGiaiChapterStatus,
  type BirthInput,
  type LuanGiaiChapterResponse,
} from '@org/shared-contracts';
import { httpRequest } from '@/lib/http-request';

/**
 * Một chương chỉ sinh đúng một lần cho mỗi lá số rồi nằm lại trong database, nên chờ chỉ xảy ra ở
 * lần đầu. Hỏi lại mỗi hai giây là đủ cho một việc mất khoảng năm giây, và rẻ hơn nhiều so với dựng
 * một đường đẩy: API chạy trên hàm serverless nên không giữ được kết nối dài.
 */
const POLL_INTERVAL_MS = 2_000;

export const luanGiaiQueries = {
  chapter: (birth: BirthInput, order: string) =>
    queryOptions({
      queryKey: ['luan-giai', birthKey(birth), order],
      queryFn: () =>
        httpRequest.get<LuanGiaiChapterResponse>(`/luan-giai/${birthKey(birth)}/${order}`),
      refetchInterval: (query) =>
        query.state.data?.status === LuanGiaiChapterStatus.Pending ? POLL_INTERVAL_MS : false,
      staleTime: Infinity,
    }),
};

export function requestChapter(birth: BirthInput, order: string): Promise<LuanGiaiChapterResponse> {
  return httpRequest.post<LuanGiaiChapterResponse>(`/luan-giai/${order}`, birth);
}
