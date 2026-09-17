import { queryOptions } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import {
  AdminOverviewDocument,
  AdminUsersDocument,
  AdminVanHanDocument,
  AdsDocument,
  BlogDocument,
} from '@/lib/graphql/generated';
import type {
  AdPopup,
  AdRedirect,
  AdminUser,
  BlogPost,
  GenTypeSlice,
  KpiStat,
  SourceSlice,
  TrafficPoint,
  VanHanEntry,
} from './types';

export interface OverviewData {
  kpis: KpiStat[];
  traffic: TrafficPoint[];
  sources: SourceSlice[];
  genByType: GenTypeSlice[];
}

export const adminQueries = {
  overview: () =>
    queryOptions({
      queryKey: ['admin', 'overview'],
      queryFn: () =>
        graphqlClient.request(AdminOverviewDocument).then((r) => r.adminOverview as OverviewData),
    }),

  users: () =>
    queryOptions({
      queryKey: ['admin', 'users'],
      queryFn: () =>
        graphqlClient.request(AdminUsersDocument).then((r) => r.adminUsers as AdminUser[]),
    }),

  blog: () =>
    queryOptions({
      queryKey: ['admin', 'blog'],
      queryFn: () => graphqlClient.request(BlogDocument).then((r) => r.blog as BlogPost[]),
    }),

  ads: () =>
    queryOptions({
      queryKey: ['admin', 'ads'],
      queryFn: () =>
        graphqlClient
          .request(AdsDocument)
          .then((r) => r.ads as { redirects: AdRedirect[]; popups: AdPopup[] }),
    }),

  vanHan: () =>
    queryOptions({
      queryKey: ['admin', 'van-han'],
      queryFn: () =>
        graphqlClient.request(AdminVanHanDocument).then((r) => r.adminVanHan as VanHanEntry[]),
    }),
};
