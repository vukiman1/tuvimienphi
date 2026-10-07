/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query ActiveUsersSeries($from: String, $to: String) {\n    activeUsersSeries(from: $from, to: $to) {\n      date\n      count\n    }\n  }\n": typeof types.ActiveUsersSeriesDocument,
    "\n  fragment AiProviderFields on AdminAiProvider {\n    provider\n    hasApiKey\n    apiKeyHint\n    models\n    isActive\n    updatedAt\n    health {\n      status\n      checkedAt\n      latencyMs\n      model\n      error\n    }\n  }\n": typeof types.AiProviderFieldsFragmentDoc,
    "\n  query AiSettings {\n    aiSettings {\n      source\n      providers {\n        ...AiProviderFields\n      }\n    }\n  }\n": typeof types.AiSettingsDocument,
    "\n  query AiProviderModels($provider: AiProvider!, $apiKey: String) {\n    aiProviderModels(provider: $provider, apiKey: $apiKey)\n  }\n": typeof types.AiProviderModelsDocument,
    "\n  mutation SaveAiProvider($input: SaveAiProviderInput!) {\n    saveAiProvider(input: $input) {\n      ...AiProviderFields\n    }\n  }\n": typeof types.SaveAiProviderDocument,
    "\n  mutation ClearAiProviderKey($provider: AiProvider!) {\n    clearAiProviderKey(provider: $provider) {\n      source\n    }\n  }\n": typeof types.ClearAiProviderKeyDocument,
    "\n  mutation SetActiveAiProvider($provider: AiProvider) {\n    setActiveAiProvider(provider: $provider) {\n      source\n    }\n  }\n": typeof types.SetActiveAiProviderDocument,
    "\n  mutation CheckAiProvider($provider: AiProvider!) {\n    checkAiProvider(provider: $provider) {\n      ...AiProviderFields\n    }\n  }\n": typeof types.CheckAiProviderDocument,
    "\n  mutation TestAiProvider($input: TestAiProviderInput!) {\n    testAiProvider(input: $input) {\n      status\n      checkedAt\n      latencyMs\n      model\n      error\n    }\n  }\n": typeof types.TestAiProviderDocument,
    "\n  fragment MetricFields on PeriodMetric {\n    value\n    previous\n    series {\n      date\n      count\n    }\n  }\n": typeof types.MetricFieldsFragmentDoc,
    "\n  query AdminOverview($from: String, $to: String) {\n    overview(from: $from, to: $to) {\n      from\n      to\n      totalUsers\n      googleUsers\n      passwordUsers\n      savedCharts\n      activeUsers {\n        ...MetricFields\n      }\n      logins {\n        ...MetricFields\n      }\n      newUsers {\n        ...MetricFields\n      }\n      newCharts {\n        ...MetricFields\n      }\n      devices {\n        label\n        count\n      }\n    }\n  }\n": typeof types.AdminOverviewDocument,
    "\n  query AdminUsers(\n    $page: Int\n    $limit: Int\n    $search: String\n    $roles: [Role!]\n    $isEmailVerified: Boolean\n    $joinedFrom: String\n    $joinedTo: String\n    $balanceMin: Int\n    $balanceMax: Int\n    $sortBy: AdminUserSortField\n    $sortDirection: SortDirection\n  ) {\n    users(\n      page: $page\n      limit: $limit\n      search: $search\n      roles: $roles\n      isEmailVerified: $isEmailVerified\n      joinedFrom: $joinedFrom\n      joinedTo: $joinedTo\n      balanceMin: $balanceMin\n      balanceMax: $balanceMax\n      sortBy: $sortBy\n      sortDirection: $sortDirection\n    ) {\n      total\n      users {\n        id\n        email\n        displayName\n        avatar\n        role\n        isEmailVerified\n        balance\n        createdAt\n        genCount\n        lastActiveAt\n      }\n    }\n  }\n": typeof types.AdminUsersDocument,
    "\n  query VanHanYears {\n    vanHanYears {\n      year\n      publishedAt\n      entryCount\n    }\n  }\n": typeof types.VanHanYearsDocument,
    "\n  query VanHanYear($year: Int!) {\n    vanHanYear(year: $year) {\n      year\n      canChi\n      publishedAt\n      slots {\n        zodiacOrder\n        zodiac\n        missing\n        entry {\n          id\n          updatedAt\n        }\n      }\n    }\n  }\n": typeof types.VanHanYearDocument,
    "\n  fragment VanHanEntryFields on AdminVanHanEntry {\n    id\n    luuNien\n    sourceUrl\n    updatedAt\n    luanGiai {\n      aspect\n      rating\n      body\n    }\n    tungTuoi {\n      birthYear\n      male\n      female\n    }\n  }\n": typeof types.VanHanEntryFieldsFragmentDoc,
    "\n  query VanHanEditor($year: Int!, $zodiacOrder: Int!) {\n    vanHanEditor(year: $year, zodiacOrder: $zodiacOrder) {\n      year\n      canChi\n      publishedAt\n      slot {\n        zodiacOrder\n        zodiac\n        entry {\n          ...VanHanEntryFields\n        }\n      }\n      previousEntry {\n        ...VanHanEntryFields\n      }\n      birthYearOptions {\n        birthYear\n        canChi\n        menh\n        age\n      }\n    }\n  }\n": typeof types.VanHanEditorDocument,
    "\n  mutation SaveVanHanEntry($input: SaveVanHanEntryInput!) {\n    saveVanHanEntry(input: $input) {\n      zodiacOrder\n      missing\n      entry {\n        id\n        updatedAt\n      }\n    }\n  }\n": typeof types.SaveVanHanEntryDocument,
    "\n  mutation PublishVanHanYear($year: Int!) {\n    publishVanHanYear(year: $year) {\n      year\n      publishedAt\n    }\n  }\n": typeof types.PublishVanHanYearDocument,
    "\n  mutation UnpublishVanHanYear($year: Int!) {\n    unpublishVanHanYear(year: $year) {\n      year\n      publishedAt\n    }\n  }\n": typeof types.UnpublishVanHanYearDocument,
    "\n  query RecentActivity($page: Int, $limit: Int) {\n    recentActivity(page: $page, limit: $limit) {\n      total\n      entries {\n        id\n        occurredAt\n        event\n        userId\n        actorEmail\n        actorName\n      }\n    }\n  }\n": typeof types.RecentActivityDocument,
};
const documents: Documents = {
    "\n  query ActiveUsersSeries($from: String, $to: String) {\n    activeUsersSeries(from: $from, to: $to) {\n      date\n      count\n    }\n  }\n": types.ActiveUsersSeriesDocument,
    "\n  fragment AiProviderFields on AdminAiProvider {\n    provider\n    hasApiKey\n    apiKeyHint\n    models\n    isActive\n    updatedAt\n    health {\n      status\n      checkedAt\n      latencyMs\n      model\n      error\n    }\n  }\n": types.AiProviderFieldsFragmentDoc,
    "\n  query AiSettings {\n    aiSettings {\n      source\n      providers {\n        ...AiProviderFields\n      }\n    }\n  }\n": types.AiSettingsDocument,
    "\n  query AiProviderModels($provider: AiProvider!, $apiKey: String) {\n    aiProviderModels(provider: $provider, apiKey: $apiKey)\n  }\n": types.AiProviderModelsDocument,
    "\n  mutation SaveAiProvider($input: SaveAiProviderInput!) {\n    saveAiProvider(input: $input) {\n      ...AiProviderFields\n    }\n  }\n": types.SaveAiProviderDocument,
    "\n  mutation ClearAiProviderKey($provider: AiProvider!) {\n    clearAiProviderKey(provider: $provider) {\n      source\n    }\n  }\n": types.ClearAiProviderKeyDocument,
    "\n  mutation SetActiveAiProvider($provider: AiProvider) {\n    setActiveAiProvider(provider: $provider) {\n      source\n    }\n  }\n": types.SetActiveAiProviderDocument,
    "\n  mutation CheckAiProvider($provider: AiProvider!) {\n    checkAiProvider(provider: $provider) {\n      ...AiProviderFields\n    }\n  }\n": types.CheckAiProviderDocument,
    "\n  mutation TestAiProvider($input: TestAiProviderInput!) {\n    testAiProvider(input: $input) {\n      status\n      checkedAt\n      latencyMs\n      model\n      error\n    }\n  }\n": types.TestAiProviderDocument,
    "\n  fragment MetricFields on PeriodMetric {\n    value\n    previous\n    series {\n      date\n      count\n    }\n  }\n": types.MetricFieldsFragmentDoc,
    "\n  query AdminOverview($from: String, $to: String) {\n    overview(from: $from, to: $to) {\n      from\n      to\n      totalUsers\n      googleUsers\n      passwordUsers\n      savedCharts\n      activeUsers {\n        ...MetricFields\n      }\n      logins {\n        ...MetricFields\n      }\n      newUsers {\n        ...MetricFields\n      }\n      newCharts {\n        ...MetricFields\n      }\n      devices {\n        label\n        count\n      }\n    }\n  }\n": types.AdminOverviewDocument,
    "\n  query AdminUsers(\n    $page: Int\n    $limit: Int\n    $search: String\n    $roles: [Role!]\n    $isEmailVerified: Boolean\n    $joinedFrom: String\n    $joinedTo: String\n    $balanceMin: Int\n    $balanceMax: Int\n    $sortBy: AdminUserSortField\n    $sortDirection: SortDirection\n  ) {\n    users(\n      page: $page\n      limit: $limit\n      search: $search\n      roles: $roles\n      isEmailVerified: $isEmailVerified\n      joinedFrom: $joinedFrom\n      joinedTo: $joinedTo\n      balanceMin: $balanceMin\n      balanceMax: $balanceMax\n      sortBy: $sortBy\n      sortDirection: $sortDirection\n    ) {\n      total\n      users {\n        id\n        email\n        displayName\n        avatar\n        role\n        isEmailVerified\n        balance\n        createdAt\n        genCount\n        lastActiveAt\n      }\n    }\n  }\n": types.AdminUsersDocument,
    "\n  query VanHanYears {\n    vanHanYears {\n      year\n      publishedAt\n      entryCount\n    }\n  }\n": types.VanHanYearsDocument,
    "\n  query VanHanYear($year: Int!) {\n    vanHanYear(year: $year) {\n      year\n      canChi\n      publishedAt\n      slots {\n        zodiacOrder\n        zodiac\n        missing\n        entry {\n          id\n          updatedAt\n        }\n      }\n    }\n  }\n": types.VanHanYearDocument,
    "\n  fragment VanHanEntryFields on AdminVanHanEntry {\n    id\n    luuNien\n    sourceUrl\n    updatedAt\n    luanGiai {\n      aspect\n      rating\n      body\n    }\n    tungTuoi {\n      birthYear\n      male\n      female\n    }\n  }\n": types.VanHanEntryFieldsFragmentDoc,
    "\n  query VanHanEditor($year: Int!, $zodiacOrder: Int!) {\n    vanHanEditor(year: $year, zodiacOrder: $zodiacOrder) {\n      year\n      canChi\n      publishedAt\n      slot {\n        zodiacOrder\n        zodiac\n        entry {\n          ...VanHanEntryFields\n        }\n      }\n      previousEntry {\n        ...VanHanEntryFields\n      }\n      birthYearOptions {\n        birthYear\n        canChi\n        menh\n        age\n      }\n    }\n  }\n": types.VanHanEditorDocument,
    "\n  mutation SaveVanHanEntry($input: SaveVanHanEntryInput!) {\n    saveVanHanEntry(input: $input) {\n      zodiacOrder\n      missing\n      entry {\n        id\n        updatedAt\n      }\n    }\n  }\n": types.SaveVanHanEntryDocument,
    "\n  mutation PublishVanHanYear($year: Int!) {\n    publishVanHanYear(year: $year) {\n      year\n      publishedAt\n    }\n  }\n": types.PublishVanHanYearDocument,
    "\n  mutation UnpublishVanHanYear($year: Int!) {\n    unpublishVanHanYear(year: $year) {\n      year\n      publishedAt\n    }\n  }\n": types.UnpublishVanHanYearDocument,
    "\n  query RecentActivity($page: Int, $limit: Int) {\n    recentActivity(page: $page, limit: $limit) {\n      total\n      entries {\n        id\n        occurredAt\n        event\n        userId\n        actorEmail\n        actorName\n      }\n    }\n  }\n": types.RecentActivityDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ActiveUsersSeries($from: String, $to: String) {\n    activeUsersSeries(from: $from, to: $to) {\n      date\n      count\n    }\n  }\n"): typeof import('./graphql').ActiveUsersSeriesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment AiProviderFields on AdminAiProvider {\n    provider\n    hasApiKey\n    apiKeyHint\n    models\n    isActive\n    updatedAt\n    health {\n      status\n      checkedAt\n      latencyMs\n      model\n      error\n    }\n  }\n"): typeof import('./graphql').AiProviderFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AiSettings {\n    aiSettings {\n      source\n      providers {\n        ...AiProviderFields\n      }\n    }\n  }\n"): typeof import('./graphql').AiSettingsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AiProviderModels($provider: AiProvider!, $apiKey: String) {\n    aiProviderModels(provider: $provider, apiKey: $apiKey)\n  }\n"): typeof import('./graphql').AiProviderModelsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SaveAiProvider($input: SaveAiProviderInput!) {\n    saveAiProvider(input: $input) {\n      ...AiProviderFields\n    }\n  }\n"): typeof import('./graphql').SaveAiProviderDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ClearAiProviderKey($provider: AiProvider!) {\n    clearAiProviderKey(provider: $provider) {\n      source\n    }\n  }\n"): typeof import('./graphql').ClearAiProviderKeyDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetActiveAiProvider($provider: AiProvider) {\n    setActiveAiProvider(provider: $provider) {\n      source\n    }\n  }\n"): typeof import('./graphql').SetActiveAiProviderDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CheckAiProvider($provider: AiProvider!) {\n    checkAiProvider(provider: $provider) {\n      ...AiProviderFields\n    }\n  }\n"): typeof import('./graphql').CheckAiProviderDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation TestAiProvider($input: TestAiProviderInput!) {\n    testAiProvider(input: $input) {\n      status\n      checkedAt\n      latencyMs\n      model\n      error\n    }\n  }\n"): typeof import('./graphql').TestAiProviderDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment MetricFields on PeriodMetric {\n    value\n    previous\n    series {\n      date\n      count\n    }\n  }\n"): typeof import('./graphql').MetricFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AdminOverview($from: String, $to: String) {\n    overview(from: $from, to: $to) {\n      from\n      to\n      totalUsers\n      googleUsers\n      passwordUsers\n      savedCharts\n      activeUsers {\n        ...MetricFields\n      }\n      logins {\n        ...MetricFields\n      }\n      newUsers {\n        ...MetricFields\n      }\n      newCharts {\n        ...MetricFields\n      }\n      devices {\n        label\n        count\n      }\n    }\n  }\n"): typeof import('./graphql').AdminOverviewDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AdminUsers(\n    $page: Int\n    $limit: Int\n    $search: String\n    $roles: [Role!]\n    $isEmailVerified: Boolean\n    $joinedFrom: String\n    $joinedTo: String\n    $balanceMin: Int\n    $balanceMax: Int\n    $sortBy: AdminUserSortField\n    $sortDirection: SortDirection\n  ) {\n    users(\n      page: $page\n      limit: $limit\n      search: $search\n      roles: $roles\n      isEmailVerified: $isEmailVerified\n      joinedFrom: $joinedFrom\n      joinedTo: $joinedTo\n      balanceMin: $balanceMin\n      balanceMax: $balanceMax\n      sortBy: $sortBy\n      sortDirection: $sortDirection\n    ) {\n      total\n      users {\n        id\n        email\n        displayName\n        avatar\n        role\n        isEmailVerified\n        balance\n        createdAt\n        genCount\n        lastActiveAt\n      }\n    }\n  }\n"): typeof import('./graphql').AdminUsersDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query VanHanYears {\n    vanHanYears {\n      year\n      publishedAt\n      entryCount\n    }\n  }\n"): typeof import('./graphql').VanHanYearsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query VanHanYear($year: Int!) {\n    vanHanYear(year: $year) {\n      year\n      canChi\n      publishedAt\n      slots {\n        zodiacOrder\n        zodiac\n        missing\n        entry {\n          id\n          updatedAt\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').VanHanYearDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment VanHanEntryFields on AdminVanHanEntry {\n    id\n    luuNien\n    sourceUrl\n    updatedAt\n    luanGiai {\n      aspect\n      rating\n      body\n    }\n    tungTuoi {\n      birthYear\n      male\n      female\n    }\n  }\n"): typeof import('./graphql').VanHanEntryFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query VanHanEditor($year: Int!, $zodiacOrder: Int!) {\n    vanHanEditor(year: $year, zodiacOrder: $zodiacOrder) {\n      year\n      canChi\n      publishedAt\n      slot {\n        zodiacOrder\n        zodiac\n        entry {\n          ...VanHanEntryFields\n        }\n      }\n      previousEntry {\n        ...VanHanEntryFields\n      }\n      birthYearOptions {\n        birthYear\n        canChi\n        menh\n        age\n      }\n    }\n  }\n"): typeof import('./graphql').VanHanEditorDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SaveVanHanEntry($input: SaveVanHanEntryInput!) {\n    saveVanHanEntry(input: $input) {\n      zodiacOrder\n      missing\n      entry {\n        id\n        updatedAt\n      }\n    }\n  }\n"): typeof import('./graphql').SaveVanHanEntryDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation PublishVanHanYear($year: Int!) {\n    publishVanHanYear(year: $year) {\n      year\n      publishedAt\n    }\n  }\n"): typeof import('./graphql').PublishVanHanYearDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UnpublishVanHanYear($year: Int!) {\n    unpublishVanHanYear(year: $year) {\n      year\n      publishedAt\n    }\n  }\n"): typeof import('./graphql').UnpublishVanHanYearDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RecentActivity($page: Int, $limit: Int) {\n    recentActivity(page: $page, limit: $limit) {\n      total\n      entries {\n        id\n        occurredAt\n        event\n        userId\n        actorEmail\n        actorName\n      }\n    }\n  }\n"): typeof import('./graphql').RecentActivityDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
