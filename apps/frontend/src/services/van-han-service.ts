import { queryOptions } from '@tanstack/react-query';
import { httpRequest } from '@/lib/http-request';
import type { VanHanEntry } from '@org/shared-contracts';

export const vanHanService = {
  listByYear(year: number) {
    return httpRequest.get<VanHanEntry[]>('/van-han', { params: { year } });
  },
};

export const vanHanQueries = {
  byYear: (year: number) =>
    queryOptions({
      queryKey: ['van-han', year],
      queryFn: () => vanHanService.listByYear(year),
      staleTime: Infinity,
    }),
};

export default vanHanService;
