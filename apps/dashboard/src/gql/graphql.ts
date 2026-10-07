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

export type AiHealthStatus =
  | 'FAILED'
  | 'OK';

export type AiProvider =
  | 'ANTHROPIC'
  | 'GEMINI'
  | 'OPENAI';

export type AiSource =
  | 'CONSOLE'
  | 'ENVIRONMENT'
  | 'NONE';

export type AiUsagePurpose =
  | 'CHECK'
  | 'GENERATION';

export type Role =
  | 'ADMIN'
  | 'SELLER'
  | 'SUPER_ADMIN'
  | 'USER';

export type SaveAiProviderInput = {
  apiKey?: string | null | undefined;
  models: Array<string>;
  provider: AiProvider;
};

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

export type TestAiProviderInput = {
  apiKey?: string | null | undefined;
  models: Array<string>;
  provider: AiProvider;
};

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

export type AiProviderFieldsFragment = { provider: AiProvider, hasApiKey: boolean, apiKeyHint: string | null, models: Array<string>, isActive: boolean, monthlyBudgetUsd: number | null, updatedAt: string | null, health: { status: AiHealthStatus, checkedAt: string, latencyMs: number | null, model: string | null, error: string | null } | null };

export type AiSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type AiSettingsQuery = { aiSettings: { source: AiSource, providers: Array<{ provider: AiProvider, hasApiKey: boolean, apiKeyHint: string | null, models: Array<string>, isActive: boolean, monthlyBudgetUsd: number | null, updatedAt: string | null, health: { status: AiHealthStatus, checkedAt: string, latencyMs: number | null, model: string | null, error: string | null } | null }> } };

export type AiProviderModelsQueryVariables = Exact<{
  provider: AiProvider;
  apiKey?: string | null | undefined;
}>;


export type AiProviderModelsQuery = { aiProviderModels: Array<string> };

export type SaveAiProviderMutationVariables = Exact<{
  input: SaveAiProviderInput;
}>;


export type SaveAiProviderMutation = { saveAiProvider: { provider: AiProvider, hasApiKey: boolean, apiKeyHint: string | null, models: Array<string>, isActive: boolean, monthlyBudgetUsd: number | null, updatedAt: string | null, health: { status: AiHealthStatus, checkedAt: string, latencyMs: number | null, model: string | null, error: string | null } | null } };

export type ClearAiProviderKeyMutationVariables = Exact<{
  provider: AiProvider;
}>;


export type ClearAiProviderKeyMutation = { clearAiProviderKey: { source: AiSource } };

export type SetActiveAiProviderMutationVariables = Exact<{
  provider?: AiProvider | null | undefined;
}>;


export type SetActiveAiProviderMutation = { setActiveAiProvider: { source: AiSource } };

export type CheckAiProviderMutationVariables = Exact<{
  provider: AiProvider;
}>;


export type CheckAiProviderMutation = { checkAiProvider: { provider: AiProvider, hasApiKey: boolean, apiKeyHint: string | null, models: Array<string>, isActive: boolean, monthlyBudgetUsd: number | null, updatedAt: string | null, health: { status: AiHealthStatus, checkedAt: string, latencyMs: number | null, model: string | null, error: string | null } | null } };

export type TestAiProviderMutationVariables = Exact<{
  input: TestAiProviderInput;
}>;


export type TestAiProviderMutation = { testAiProvider: { status: AiHealthStatus, checkedAt: string, latencyMs: number | null, model: string | null, error: string | null } };

export type AiUsageQueryVariables = Exact<{
  from: string;
  to: string;
}>;


export type AiUsageQuery = { aiUsage: Array<{ day: string, provider: AiProvider, model: string, purpose: AiUsagePurpose, calls: number, failedCalls: number, quotaHits: number, inputTokens: number, outputTokens: number, costUsd: number | null }> };

export type SetAiProviderBudgetMutationVariables = Exact<{
  provider: AiProvider;
  monthlyBudgetUsd?: number | null | undefined;
}>;


export type SetAiProviderBudgetMutation = { setAiProviderBudget: { provider: AiProvider, monthlyBudgetUsd: number | null } };

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
export const AiProviderFieldsFragmentDoc = new TypedDocumentString(`
    fragment AiProviderFields on AdminAiProvider {
  provider
  hasApiKey
  apiKeyHint
  models
  isActive
  monthlyBudgetUsd
  updatedAt
  health {
    status
    checkedAt
    latencyMs
    model
    error
  }
}
    `, {"fragmentName":"AiProviderFields"}) as unknown as TypedDocumentString<AiProviderFieldsFragment, unknown>;
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
export const AiSettingsDocument = new TypedDocumentString(`
    query AiSettings {
  aiSettings {
    source
    providers {
      ...AiProviderFields
    }
  }
}
    fragment AiProviderFields on AdminAiProvider {
  provider
  hasApiKey
  apiKeyHint
  models
  isActive
  monthlyBudgetUsd
  updatedAt
  health {
    status
    checkedAt
    latencyMs
    model
    error
  }
}`) as unknown as TypedDocumentString<AiSettingsQuery, AiSettingsQueryVariables>;
export const AiProviderModelsDocument = new TypedDocumentString(`
    query AiProviderModels($provider: AiProvider!, $apiKey: String) {
  aiProviderModels(provider: $provider, apiKey: $apiKey)
}
    `) as unknown as TypedDocumentString<AiProviderModelsQuery, AiProviderModelsQueryVariables>;
export const SaveAiProviderDocument = new TypedDocumentString(`
    mutation SaveAiProvider($input: SaveAiProviderInput!) {
  saveAiProvider(input: $input) {
    ...AiProviderFields
  }
}
    fragment AiProviderFields on AdminAiProvider {
  provider
  hasApiKey
  apiKeyHint
  models
  isActive
  monthlyBudgetUsd
  updatedAt
  health {
    status
    checkedAt
    latencyMs
    model
    error
  }
}`) as unknown as TypedDocumentString<SaveAiProviderMutation, SaveAiProviderMutationVariables>;
export const ClearAiProviderKeyDocument = new TypedDocumentString(`
    mutation ClearAiProviderKey($provider: AiProvider!) {
  clearAiProviderKey(provider: $provider) {
    source
  }
}
    `) as unknown as TypedDocumentString<ClearAiProviderKeyMutation, ClearAiProviderKeyMutationVariables>;
export const SetActiveAiProviderDocument = new TypedDocumentString(`
    mutation SetActiveAiProvider($provider: AiProvider) {
  setActiveAiProvider(provider: $provider) {
    source
  }
}
    `) as unknown as TypedDocumentString<SetActiveAiProviderMutation, SetActiveAiProviderMutationVariables>;
export const CheckAiProviderDocument = new TypedDocumentString(`
    mutation CheckAiProvider($provider: AiProvider!) {
  checkAiProvider(provider: $provider) {
    ...AiProviderFields
  }
}
    fragment AiProviderFields on AdminAiProvider {
  provider
  hasApiKey
  apiKeyHint
  models
  isActive
  monthlyBudgetUsd
  updatedAt
  health {
    status
    checkedAt
    latencyMs
    model
    error
  }
}`) as unknown as TypedDocumentString<CheckAiProviderMutation, CheckAiProviderMutationVariables>;
export const TestAiProviderDocument = new TypedDocumentString(`
    mutation TestAiProvider($input: TestAiProviderInput!) {
  testAiProvider(input: $input) {
    status
    checkedAt
    latencyMs
    model
    error
  }
}
    `) as unknown as TypedDocumentString<TestAiProviderMutation, TestAiProviderMutationVariables>;
export const AiUsageDocument = new TypedDocumentString(`
    query AiUsage($from: String!, $to: String!) {
  aiUsage(from: $from, to: $to) {
    day
    provider
    model
    purpose
    calls
    failedCalls
    quotaHits
    inputTokens
    outputTokens
    costUsd
  }
}
    `) as unknown as TypedDocumentString<AiUsageQuery, AiUsageQueryVariables>;
export const SetAiProviderBudgetDocument = new TypedDocumentString(`
    mutation SetAiProviderBudget($provider: AiProvider!, $monthlyBudgetUsd: Float) {
  setAiProviderBudget(provider: $provider, monthlyBudgetUsd: $monthlyBudgetUsd) {
    provider
    monthlyBudgetUsd
  }
}
    `) as unknown as TypedDocumentString<SetAiProviderBudgetMutation, SetAiProviderBudgetMutationVariables>;
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