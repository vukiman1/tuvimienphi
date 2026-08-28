import { queryOptions } from '@tanstack/react-query';
import {
  adPopups,
  adRedirects,
  adminUsers,
  blogPosts,
  genByType,
  kpiStats,
  trafficSeries,
  trafficSources,
  vanHanEntries,
} from './mock';

/**
 * Mock-backed query layer. Each resolver returns local data after a short delay to mimic network
 * latency (so loading states are exercised). Replace the bodies with `httpRequest.get(...)` calls
 * when the admin API lands — the query keys and return types stay the same.
 */
function resolve<T>(data: T, delay = 320): Promise<T> {
  return new Promise((res) => setTimeout(() => res(data), delay));
}

export const adminQueries = {
  overview: () =>
    queryOptions({
      queryKey: ['admin', 'overview'],
      queryFn: () =>
        resolve({
          kpis: kpiStats,
          traffic: trafficSeries,
          sources: trafficSources,
          genByType,
        }),
    }),

  users: () =>
    queryOptions({
      queryKey: ['admin', 'users'],
      queryFn: () => resolve(adminUsers),
    }),

  blog: () =>
    queryOptions({
      queryKey: ['admin', 'blog'],
      queryFn: () => resolve(blogPosts),
    }),

  ads: () =>
    queryOptions({
      queryKey: ['admin', 'ads'],
      queryFn: () => resolve({ redirects: adRedirects, popups: adPopups }),
    }),

  vanHan: () =>
    queryOptions({
      queryKey: ['admin', 'van-han'],
      queryFn: () => resolve(vanHanEntries),
    }),
};
