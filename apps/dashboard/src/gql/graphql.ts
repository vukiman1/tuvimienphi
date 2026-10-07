/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type AdminUserSortField =
  | 'BALANCE'
  | 'CREATED_AT'
  | 'EMAIL';

export type Role =
  | 'ADMIN'
  | 'SELLER'
  | 'SUPER_ADMIN'
  | 'USER';

export type SaveVanHanEntryInput = {
  luanGiai: Array<VanHanAspectInput>;
  luuNien: string;
  sourceUrl?: string | null | undefined;
  tungTuoi: Array<VanHanAgeInput>;
  year: number;
  zodiacOrder: number;
};

export type SortDirection =
  | 'ASC'
  | 'DESC';

export type VanHanAgeInput = {
  birthYear: number;
  female: string;
  male: string;
};

export type VanHanAspectInput = {
  aspect: string;
  body: string;
  rating: number;
};

export type VanHanMissingPart =
  | 'LUAN_GIAI'
  | 'LUU_NIEN'
  | 'TUNG_TUOI';

export type ActiveUsersSeriesQueryVariables = Exact<{
  from?: string | null | undefined;
  to?: string | null | undefined;
}>;


export type ActiveUsersSeriesQuery = { activeUsersSeries: Array<{ date: string, count: number }> };

export type MetricFieldsFragment = { value: number, previous: number, series: Array<{ date: string, count: number }> };

export type AdminOverviewQueryVariables = Exact<{
  from?: string | null | undefined;
  to?: string | null | undefined;
}>;


export type AdminOverviewQuery = { overview: { from: string, to: string, totalUsers: number, googleUsers: number, passwordUsers: number, savedCharts: number, activeUsers: { value: number, previous: number, series: Array<{ date: string, count: number }> }, logins: { value: number, previous: number, series: Array<{ date: string, count: number }> }, newUsers: { value: number, previous: number, series: Array<{ date: string, count: number }> }, newCharts: { value: number, previous: number, series: Array<{ date: string, count: number }> }, devices: Array<{ label: string, count: number }> } };

export type AdminUsersQueryVariables = Exact<{
  page?: number | null | undefined;
  limit?: number | null | undefined;
  search?: string | null | undefined;
  roles?: Array<Role> | Role | null | undefined;
  isEmailVerified?: boolean | null | undefined;
  joinedFrom?: string | null | undefined;
  joinedTo?: string | null | undefined;
  balanceMin?: number | null | undefined;
  balanceMax?: number | null | undefined;
  sortBy?: AdminUserSortField | null | undefined;
  sortDirection?: SortDirection | null | undefined;
}>;


export type AdminUsersQuery = { users: { total: number, users: Array<{ id: string, email: string, displayName: string | null, avatar: string | null, role: Role, isEmailVerified: boolean, balance: number, createdAt: string, genCount: number, lastActiveAt: string | null }> } };

export type VanHanYearsQueryVariables = Exact<{ [key: string]: never; }>;


export type VanHanYearsQuery = { vanHanYears: Array<{ year: number, publishedAt: string | null, entryCount: number }> };

export type VanHanYearQueryVariables = Exact<{
  year: number;
}>;


export type VanHanYearQuery = { vanHanYear: { year: number, canChi: string, publishedAt: string | null, slots: Array<{ zodiacOrder: number, zodiac: string, missing: Array<VanHanMissingPart>, entry: { id: string, updatedAt: string } | null }> } };

export type VanHanEntryFieldsFragment = { id: string, luuNien: string, sourceUrl: string, updatedAt: string, luanGiai: Array<{ aspect: string, rating: number, body: string }>, tungTuoi: Array<{ birthYear: number, male: string, female: string }> };

export type VanHanEditorQueryVariables = Exact<{
  year: number;
  zodiacOrder: number;
}>;


export type VanHanEditorQuery = { vanHanEditor: { year: number, canChi: string, publishedAt: string | null, slot: { zodiacOrder: number, zodiac: string, entry: { id: string, luuNien: string, sourceUrl: string, updatedAt: string, luanGiai: Array<{ aspect: string, rating: number, body: string }>, tungTuoi: Array<{ birthYear: number, male: string, female: string }> } | null }, previousEntry: { id: string, luuNien: string, sourceUrl: string, updatedAt: string, luanGiai: Array<{ aspect: string, rating: number, body: string }>, tungTuoi: Array<{ birthYear: number, male: string, female: string }> } | null, birthYearOptions: Array<{ birthYear: number, canChi: string, menh: string, age: number }> } };

export type SaveVanHanEntryMutationVariables = Exact<{
  input: SaveVanHanEntryInput;
}>;


export type SaveVanHanEntryMutation = { saveVanHanEntry: { zodiacOrder: number, missing: Array<VanHanMissingPart>, entry: { id: string, updatedAt: string } | null } };

export type PublishVanHanYearMutationVariables = Exact<{
  year: number;
}>;


export type PublishVanHanYearMutation = { publishVanHanYear: { year: number, publishedAt: string | null } };

export type UnpublishVanHanYearMutationVariables = Exact<{
  year: number;
}>;


export type UnpublishVanHanYearMutation = { unpublishVanHanYear: { year: number, publishedAt: string | null } };

export type RecentActivityQueryVariables = Exact<{
  page?: number | null | undefined;
  limit?: number | null | undefined;
}>;


export type RecentActivityQuery = { recentActivity: { total: number, entries: Array<{ id: string, occurredAt: string, event: string, userId: string | null, actorEmail: string | null, actorName: string | null }> } };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const MetricFieldsFragmentDoc = new TypedDocumentString(`
    fragment MetricFields on PeriodMetric {
  value
  previous
  series {
    date
    count
  }
}
    `, {"fragmentName":"MetricFields"}) as unknown as TypedDocumentString<MetricFieldsFragment, unknown>;
export const VanHanEntryFieldsFragmentDoc = new TypedDocumentString(`
    fragment VanHanEntryFields on AdminVanHanEntry {
  id
  luuNien
  sourceUrl
  updatedAt
  luanGiai {
    aspect
    rating
    body
  }
  tungTuoi {
    birthYear
    male
    female
  }
}
    `, {"fragmentName":"VanHanEntryFields"}) as unknown as TypedDocumentString<VanHanEntryFieldsFragment, unknown>;
export const ActiveUsersSeriesDocument = new TypedDocumentString(`
    query ActiveUsersSeries($from: String, $to: String) {
  activeUsersSeries(from: $from, to: $to) {
    date
    count
  }
}
    `) as unknown as TypedDocumentString<ActiveUsersSeriesQuery, ActiveUsersSeriesQueryVariables>;
export const AdminOverviewDocument = new TypedDocumentString(`
    query AdminOverview($from: String, $to: String) {
  overview(from: $from, to: $to) {
    from
    to
    totalUsers
    googleUsers
    passwordUsers
    savedCharts
    activeUsers {
      ...MetricFields
    }
    logins {
      ...MetricFields
    }
    newUsers {
      ...MetricFields
    }
    newCharts {
      ...MetricFields
    }
    devices {
      label
      count
    }
  }
}
    fragment MetricFields on PeriodMetric {
  value
  previous
  series {
    date
    count
  }
}`) as unknown as TypedDocumentString<AdminOverviewQuery, AdminOverviewQueryVariables>;
export const AdminUsersDocument = new TypedDocumentString(`
    query AdminUsers($page: Int, $limit: Int, $search: String, $roles: [Role!], $isEmailVerified: Boolean, $joinedFrom: String, $joinedTo: String, $balanceMin: Int, $balanceMax: Int, $sortBy: AdminUserSortField, $sortDirection: SortDirection) {
  users(
    page: $page
    limit: $limit
    search: $search
    roles: $roles
    isEmailVerified: $isEmailVerified
    joinedFrom: $joinedFrom
    joinedTo: $joinedTo
    balanceMin: $balanceMin
    balanceMax: $balanceMax
    sortBy: $sortBy
    sortDirection: $sortDirection
  ) {
    total
    users {
      id
      email
      displayName
      avatar
      role
      isEmailVerified
      balance
      createdAt
      genCount
      lastActiveAt
    }
  }
}
    `) as unknown as TypedDocumentString<AdminUsersQuery, AdminUsersQueryVariables>;
export const VanHanYearsDocument = new TypedDocumentString(`
    query VanHanYears {
  vanHanYears {
    year
    publishedAt
    entryCount
  }
}
    `) as unknown as TypedDocumentString<VanHanYearsQuery, VanHanYearsQueryVariables>;
export const VanHanYearDocument = new TypedDocumentString(`
    query VanHanYear($year: Int!) {
  vanHanYear(year: $year) {
    year
    canChi
    publishedAt
    slots {
      zodiacOrder
      zodiac
      missing
      entry {
        id
        updatedAt
      }
    }
  }
}
    `) as unknown as TypedDocumentString<VanHanYearQuery, VanHanYearQueryVariables>;
export const VanHanEditorDocument = new TypedDocumentString(`
    query VanHanEditor($year: Int!, $zodiacOrder: Int!) {
  vanHanEditor(year: $year, zodiacOrder: $zodiacOrder) {
    year
    canChi
    publishedAt
    slot {
      zodiacOrder
      zodiac
      entry {
        ...VanHanEntryFields
      }
    }
    previousEntry {
      ...VanHanEntryFields
    }
    birthYearOptions {
      birthYear
      canChi
      menh
      age
    }
  }
}
    fragment VanHanEntryFields on AdminVanHanEntry {
  id
  luuNien
  sourceUrl
  updatedAt
  luanGiai {
    aspect
    rating
    body
  }
  tungTuoi {
    birthYear
    male
    female
  }
}`) as unknown as TypedDocumentString<VanHanEditorQuery, VanHanEditorQueryVariables>;
export const SaveVanHanEntryDocument = new TypedDocumentString(`
    mutation SaveVanHanEntry($input: SaveVanHanEntryInput!) {
  saveVanHanEntry(input: $input) {
    zodiacOrder
    missing
    entry {
      id
      updatedAt
    }
  }
}
    `) as unknown as TypedDocumentString<SaveVanHanEntryMutation, SaveVanHanEntryMutationVariables>;
export const PublishVanHanYearDocument = new TypedDocumentString(`
    mutation PublishVanHanYear($year: Int!) {
  publishVanHanYear(year: $year) {
    year
    publishedAt
  }
}
    `) as unknown as TypedDocumentString<PublishVanHanYearMutation, PublishVanHanYearMutationVariables>;
export const UnpublishVanHanYearDocument = new TypedDocumentString(`
    mutation UnpublishVanHanYear($year: Int!) {
  unpublishVanHanYear(year: $year) {
    year
    publishedAt
  }
}
    `) as unknown as TypedDocumentString<UnpublishVanHanYearMutation, UnpublishVanHanYearMutationVariables>;
export const RecentActivityDocument = new TypedDocumentString(`
    query RecentActivity($page: Int, $limit: Int) {
  recentActivity(page: $page, limit: $limit) {
    total
    entries {
      id
      occurredAt
      event
      userId
      actorEmail
      actorName
    }
  }
}
    `) as unknown as TypedDocumentString<RecentActivityQuery, RecentActivityQueryVariables>;