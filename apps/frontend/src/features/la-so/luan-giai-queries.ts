import { queryOptions } from '@tanstack/react-query';
import {
  birthKey,
  type BirthInput,
  type LuanGiaiChapterResponse,
  type LuanGiaiChapterStatusMap,
} from '@org/shared-contracts';
import { httpRequest } from '@/lib/http-request';

/** Nội dung một chương, chỉ nạp khi người ta thật sự mở chương đó. */
export const luanGiaiQueries = {
  /**
   * Trạng thái cả sáu chương, hỏi ngay khi mở trang. Không có nó thì mục lục không biết chương nào
   * đã có bài, và người dùng phải bấm từng chương mới biết chương đó có gì.
   */
  statusMap: (birth: BirthInput) =>
    queryOptions({
      queryKey: ['luan-giai', birthKey(birth)] as const,
      queryFn: () => httpRequest.get<LuanGiaiChapterStatusMap>(`/luan-giai/${birthKey(birth)}`),
      staleTime: Infinity,
    }),

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
