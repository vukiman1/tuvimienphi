import { queryOptions } from '@tanstack/react-query';
import {
  birthKey,
  isYearDependentChapter,
  type BirthInput,
  type LuanGiaiChapterResponse,
  type LuanGiaiChapterStatusMap,
} from '@org/shared-contracts';
import { httpRequest } from '@/lib/http-request';

function viewYearQuery(viewYear: number): string {
  return `?viewYear=${viewYear}`;
}

/** Nội dung một chương, chỉ nạp khi người ta thật sự mở chương đó. */
export const luanGiaiQueries = {
  /**
   * Trạng thái cả sáu chương, hỏi ngay khi mở trang. Không có nó thì mục lục không biết chương nào
   * đã có bài, và người dùng phải bấm từng chương mới biết chương đó có gì.
   */
  statusMap: (birth: BirthInput, viewYear: number) =>
    queryOptions({
      queryKey: ['luan-giai', birthKey(birth), 'status', viewYear] as const,
      queryFn: () =>
        httpRequest.get<LuanGiaiChapterStatusMap>(
          `/luan-giai/${birthKey(birth)}${viewYearQuery(viewYear)}`,
        ),
      staleTime: Infinity,
    }),

  chapter: (birth: BirthInput, order: string, viewYear: number) => {
    const isYearDependent = isYearDependentChapter(order);
    return queryOptions({
      queryKey: isYearDependent
        ? ['luan-giai', birthKey(birth), order, viewYear]
        : ['luan-giai', birthKey(birth), order],
      queryFn: () =>
        httpRequest.get<LuanGiaiChapterResponse>(
          `/luan-giai/${birthKey(birth)}/${order}${isYearDependent ? viewYearQuery(viewYear) : ''}`,
        ),
      staleTime: Infinity,
    });
  },
};

export function requestChapter(
  birth: BirthInput,
  order: string,
  viewYear: number,
): Promise<LuanGiaiChapterResponse> {
  const body = isYearDependentChapter(order) ? { ...birth, viewYear } : birth;
  return httpRequest.post<LuanGiaiChapterResponse>(`/luan-giai/${order}`, body);
}
