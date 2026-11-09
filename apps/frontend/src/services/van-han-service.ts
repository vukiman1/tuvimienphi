import { queryOptions } from '@tanstack/react-query';
import { httpRequest } from '@/lib/http-request';
import type { VanHanCurrent, VanHanEntry } from '@org/shared-contracts';
import { publishedYearOf } from '@/features/van-han/van-han-view';

export const vanHanService = {
  current() {
    return httpRequest.get<VanHanCurrent | null>('/van-han/current');
  },
  publishedYears() {
    return httpRequest.get<number[]>('/van-han/years');
  },
  async publishedYear(year: number): Promise<VanHanCurrent | null> {
    const entries = await httpRequest.get<VanHanEntry[]>('/van-han', { params: { year } });
    return publishedYearOf(year, entries);
  },
};

export const vanHanQueries = {
  current: () =>
    queryOptions({
      queryKey: ['van-han', 'current'],
      queryFn: () => vanHanService.current(),
      staleTime: Infinity,
    }),
  publishedYears: () =>
    queryOptions({
      queryKey: ['van-han', 'years'],
      queryFn: () => vanHanService.publishedYears(),
      staleTime: Infinity,
    }),
  publishedYear: (year: number) =>
    queryOptions({
      queryKey: ['van-han', 'year', year],
      queryFn: () => vanHanService.publishedYear(year),
      staleTime: Infinity,
    }),
};

export default vanHanService;
