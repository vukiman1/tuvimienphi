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

export type SortDirection =
  | 'ASC'
  | 'DESC';

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