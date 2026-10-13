import { queryOptions } from '@tanstack/react-query';
import type {
  SaveVanHanEntryInput,
  VanHanEditorQuery,
  VanHanEntryFieldsFragment,
  VanHanYearQuery,
  VanHanYearsQuery,
} from '@/gql/graphql';
import { graphqlRequest } from '@/lib/graphql-request';
import {
  publishVanHanYearDocument,
  saveVanHanEntryDocument,
  unpublishVanHanYearDocument,
  vanHanEditorDocument,
  vanHanYearDocument,
  vanHanYearsDocument,
} from './admin-van-han.document';

export type VanHanYearSummary = VanHanYearsQuery['vanHanYears'][number];
export type VanHanYearView = VanHanYearQuery['vanHanYear'];
export type VanHanSlotRow = VanHanYearView['slots'][number];
export type VanHanEditorView = VanHanEditorQuery['vanHanEditor'];
export type VanHanBirthYearOption = VanHanEditorView['birthYearOptions'][number];
export type VanHanEntryContent = VanHanEntryFieldsFragment;

export const VAN_HAN_QUERY_KEY = ['admin', 'van-han'] as const;

export function vanHanYearsQuery() {
  return queryOptions({
    queryKey: [...VAN_HAN_QUERY_KEY, 'years'],
    queryFn: () => graphqlRequest(vanHanYearsDocument),
  });
}

export function vanHanYearQuery(year: number) {
  return queryOptions({
    queryKey: [...VAN_HAN_QUERY_KEY, 'year', year],
    queryFn: () => graphqlRequest(vanHanYearDocument, { year }),
  });
}

export function vanHanEditorQuery(year: number, zodiacOrder: number) {
  return queryOptions({
    queryKey: [...VAN_HAN_QUERY_KEY, 'editor', year, zodiacOrder],
    queryFn: () => graphqlRequest(vanHanEditorDocument, { year, zodiacOrder }),
    gcTime: 0,
  });
}

export function saveVanHanEntry(input: SaveVanHanEntryInput) {
  return graphqlRequest(saveVanHanEntryDocument, { input });
}

export function publishVanHanYear(year: number) {
  return graphqlRequest(publishVanHanYearDocument, { year });
}

export function unpublishVanHanYear(year: number) {
  return graphqlRequest(unpublishVanHanYearDocument, { year });
}
