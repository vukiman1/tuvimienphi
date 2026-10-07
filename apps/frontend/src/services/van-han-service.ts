import { queryOptions } from '@tanstack/react-query';
import { httpRequest } from '@/lib/http-request';
import type { VanHanCurrent } from '@org/shared-contracts';

export const vanHanService = {
  current() {
    return httpRequest.get<VanHanCurrent | null>('/van-han/current');
  },
};

export const vanHanQueries = {
  current: () =>
    queryOptions({
      queryKey: ['van-han', 'current'],
      queryFn: () => vanHanService.current(),
      staleTime: Infinity,
    }),
};

export default vanHanService;
