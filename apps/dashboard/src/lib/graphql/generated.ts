import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type AdPopup = {
  __typename?: 'AdPopup';
  active: Scalars['Boolean']['output'];
  clicks: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  image: Scalars['String']['output'];
  impressions: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  target: Scalars['String']['output'];
  trigger: Scalars['String']['output'];
};

export type AdRedirect = {
  __typename?: 'AdRedirect';
  active: Scalars['Boolean']['output'];
  clicks: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  target: Scalars['String']['output'];
};

export type AdminOverview = {
  __typename?: 'AdminOverview';
  genByType: Array<GenTypeSlice>;
  kpis: Array<KpiStat>;
  sources: Array<SourceSlice>;
  traffic: Array<TrafficPoint>;
};

export type AdminUser = {
  __typename?: 'AdminUser';
  avatarSeed: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  credits: Scalars['Int']['output'];
  displayName: Scalars['String']['output'];
  email: Scalars['String']['output'];
  genCount: Scalars['Int']['output'];
  genHistory: Array<GenRecord>;
  id: Scalars['String']['output'];
  lastActiveAt: Scalars['String']['output'];
  role: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type AdsData = {
  __typename?: 'AdsData';
  popups: Array<AdPopup>;
  redirects: Array<AdRedirect>;
};

export type BirthInfo = {
  __typename?: 'BirthInfo';
  birthDate: Scalars['String']['output'];
  birthHour: Scalars['String']['output'];
  calendar: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  gender: Scalars['String']['output'];
};

export type BlogPost = {
  __typename?: 'BlogPost';
  author: Scalars['String']['output'];
  category: Scalars['String']['output'];
  id: Scalars['String']['output'];
  publishedAt?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  status: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  views: Scalars['Int']['output'];
};

export type CreateAdPopupInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  image: Scalars['String']['input'];
  name: Scalars['String']['input'];
  target: Scalars['String']['input'];
  trigger: Scalars['String']['input'];
};

export type CreateAdRedirectInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  label: Scalars['String']['input'];
  slug: Scalars['String']['input'];
  target: Scalars['String']['input'];
};

export type CreatePostInput = {
  author: Scalars['String']['input'];
  category: Scalars['String']['input'];
  publishedAt?: InputMaybe<Scalars['String']['input']>;
  slug: Scalars['String']['input'];
  status: Scalars['String']['input'];
  title: Scalars['String']['input'];
  views?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateVanHanEntryInput = {
  age: Scalars['Int']['input'];
  published?: InputMaybe<Scalars['Boolean']['input']>;
  rating: Scalars['String']['input'];
  star: Scalars['String']['input'];
  summary: Scalars['String']['input'];
  year: Scalars['Int']['input'];
};

export type GenRecord = {
  __typename?: 'GenRecord';
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  input: BirthInfo;
  kind: Scalars['String']['output'];
};

export type GenTypeSlice = {
  __typename?: 'GenTypeSlice';
  count: Scalars['Int']['output'];
  type: Scalars['String']['output'];
};

export type KpiStat = {
  __typename?: 'KpiStat';
  deltaPct: Scalars['Float']['output'];
  format: Scalars['String']['output'];
  key: Scalars['String']['output'];
  label: Scalars['String']['output'];
  spark: Array<Scalars['Float']['output']>;
  trend: Scalars['String']['output'];
  value: Scalars['Float']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  banUser: AdminUser;
  createAdPopup: AdPopup;
  createAdRedirect: AdRedirect;
  createPost: BlogPost;
  createVanHanEntry: VanHanEntry;
  deleteAdPopup: Scalars['Boolean']['output'];
  deleteAdRedirect: Scalars['Boolean']['output'];
  deletePost: Scalars['Boolean']['output'];
  toggleAdPopupActive: AdPopup;
  toggleAdRedirectActive: AdRedirect;
  toggleVanHanPublished: VanHanEntry;
  updateAdPopup: AdPopup;
  updateAdRedirect: AdRedirect;
  updatePost: BlogPost;
  updateVanHanEntry: VanHanEntry;
};

export type MutationBanUserArgs = {
  id: Scalars['String']['input'];
};

export type MutationCreateAdPopupArgs = {
  input: CreateAdPopupInput;
};

export type MutationCreateAdRedirectArgs = {
  input: CreateAdRedirectInput;
};

export type MutationCreatePostArgs = {
  input: CreatePostInput;
};

export type MutationCreateVanHanEntryArgs = {
  input: CreateVanHanEntryInput;
};

export type MutationDeleteAdPopupArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeleteAdRedirectArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeletePostArgs = {
  id: Scalars['String']['input'];
};

export type MutationToggleAdPopupActiveArgs = {
  id: Scalars['String']['input'];
};

export type MutationToggleAdRedirectActiveArgs = {
  id: Scalars['String']['input'];
};

export type MutationToggleVanHanPublishedArgs = {
  id: Scalars['String']['input'];
};

export type MutationUpdateAdPopupArgs = {
  id: Scalars['String']['input'];
  input: UpdateAdPopupInput;
};

export type MutationUpdateAdRedirectArgs = {
  id: Scalars['String']['input'];
  input: UpdateAdRedirectInput;
};

export type MutationUpdatePostArgs = {
  id: Scalars['String']['input'];
  input: UpdatePostInput;
};

export type MutationUpdateVanHanEntryArgs = {
  id: Scalars['String']['input'];
  input: UpdateVanHanEntryInput;
};

export type Query = {
  __typename?: 'Query';
  adminOverview: AdminOverview;
  adminUsers: Array<AdminUser>;
  adminVanHan: Array<VanHanEntry>;
  ads: AdsData;
  blog: Array<BlogPost>;
};

export type SourceSlice = {
  __typename?: 'SourceSlice';
  element: Scalars['String']['output'];
  source: Scalars['String']['output'];
  visits: Scalars['Int']['output'];
};

export type TrafficPoint = {
  __typename?: 'TrafficPoint';
  date: Scalars['String']['output'];
  users: Scalars['Int']['output'];
  views: Scalars['Int']['output'];
};

export type UpdateAdPopupInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  target?: InputMaybe<Scalars['String']['input']>;
  trigger?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateAdRedirectInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  target?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePostInput = {
  author?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  views?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateVanHanEntryInput = {
  age?: InputMaybe<Scalars['Int']['input']>;
  published?: InputMaybe<Scalars['Boolean']['input']>;
  rating?: InputMaybe<Scalars['String']['input']>;
  star?: InputMaybe<Scalars['String']['input']>;
  summary?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type VanHanEntry = {
  __typename?: 'VanHanEntry';
  age: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  published: Scalars['Boolean']['output'];
  rating: Scalars['String']['output'];
  star: Scalars['String']['output'];
  summary: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  year: Scalars['Int']['output'];
};

export type AdminUserFieldsFragment = {
  __typename?: 'AdminUser';
  id: string;
  displayName: string;
  email: string;
  avatarSeed: string;
  role: string;
  status: string;
  credits: number;
  genCount: number;
  createdAt: string;
  lastActiveAt: string;
  genHistory: Array<{
    __typename?: 'GenRecord';
    id: string;
    kind: string;
    createdAt: string;
    input: {
      __typename?: 'BirthInfo';
      fullName: string;
      gender: string;
      birthDate: string;
      birthHour: string;
      calendar: string;
    };
  }>;
};

export type BlogPostFieldsFragment = {
  __typename?: 'BlogPost';
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  status: string;
  views: number;
  updatedAt: string;
  publishedAt?: string | null;
};

export type AdRedirectFieldsFragment = {
  __typename?: 'AdRedirect';
  id: string;
  label: string;
  slug: string;
  target: string;
  clicks: number;
  active: boolean;
  createdAt: string;
};

export type AdPopupFieldsFragment = {
  __typename?: 'AdPopup';
  id: string;
  name: string;
  trigger: string;
  image: string;
  target: string;
  impressions: number;
  clicks: number;
  active: boolean;
};

export type VanHanEntryFieldsFragment = {
  __typename?: 'VanHanEntry';
  id: string;
  year: number;
  age: number;
  star: string;
  rating: string;
  summary: string;
  updatedAt: string;
  published: boolean;
};

export type AdminOverviewQueryVariables = Exact<{ [key: string]: never }>;

export type AdminOverviewQuery = {
  __typename?: 'Query';
  adminOverview: {
    __typename?: 'AdminOverview';
    kpis: Array<{
      __typename?: 'KpiStat';
      key: string;
      label: string;
      value: number;
      deltaPct: number;
      trend: string;
      spark: Array<number>;
      format: string;
    }>;
    traffic: Array<{ __typename?: 'TrafficPoint'; date: string; views: number; users: number }>;
    sources: Array<{ __typename?: 'SourceSlice'; source: string; visits: number; element: string }>;
    genByType: Array<{ __typename?: 'GenTypeSlice'; type: string; count: number }>;
  };
};

export type AdminUsersQueryVariables = Exact<{ [key: string]: never }>;

export type AdminUsersQuery = {
  __typename?: 'Query';
  adminUsers: Array<{
    __typename?: 'AdminUser';
    id: string;
    displayName: string;
    email: string;
    avatarSeed: string;
    role: string;
    status: string;
    credits: number;
    genCount: number;
    createdAt: string;
    lastActiveAt: string;
    genHistory: Array<{
      __typename?: 'GenRecord';
      id: string;
      kind: string;
      createdAt: string;
      input: {
        __typename?: 'BirthInfo';
        fullName: string;
        gender: string;
        birthDate: string;
        birthHour: string;
        calendar: string;
      };
    }>;
  }>;
};

export type BlogQueryVariables = Exact<{ [key: string]: never }>;

export type BlogQuery = {
  __typename?: 'Query';
  blog: Array<{
    __typename?: 'BlogPost';
    id: string;
    title: string;
    slug: string;
    category: string;
    author: string;
    status: string;
    views: number;
    updatedAt: string;
    publishedAt?: string | null;
  }>;
};

export type AdsQueryVariables = Exact<{ [key: string]: never }>;

export type AdsQuery = {
  __typename?: 'Query';
  ads: {
    __typename?: 'AdsData';
    redirects: Array<{
      __typename?: 'AdRedirect';
      id: string;
      label: string;
      slug: string;
      target: string;
      clicks: number;
      active: boolean;
      createdAt: string;
    }>;
    popups: Array<{
      __typename?: 'AdPopup';
      id: string;
      name: string;
      trigger: string;
      image: string;
      target: string;
      impressions: number;
      clicks: number;
      active: boolean;
    }>;
  };
};

export type AdminVanHanQueryVariables = Exact<{ [key: string]: never }>;

export type AdminVanHanQuery = {
  __typename?: 'Query';
  adminVanHan: Array<{
    __typename?: 'VanHanEntry';
    id: string;
    year: number;
    age: number;
    star: string;
    rating: string;
    summary: string;
    updatedAt: string;
    published: boolean;
  }>;
};

export type BanUserMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;

export type BanUserMutation = {
  __typename?: 'Mutation';
  banUser: {
    __typename?: 'AdminUser';
    id: string;
    displayName: string;
    email: string;
    avatarSeed: string;
    role: string;
    status: string;
    credits: number;
    genCount: number;
    createdAt: string;
    lastActiveAt: string;
    genHistory: Array<{
      __typename?: 'GenRecord';
      id: string;
      kind: string;
      createdAt: string;
      input: {
        __typename?: 'BirthInfo';
        fullName: string;
        gender: string;
        birthDate: string;
        birthHour: string;
        calendar: string;
      };
    }>;
  };
};

export type CreatePostMutationVariables = Exact<{
  input: CreatePostInput;
}>;

export type CreatePostMutation = {
  __typename?: 'Mutation';
  createPost: {
    __typename?: 'BlogPost';
    id: string;
    title: string;
    slug: string;
    category: string;
    author: string;
    status: string;
    views: number;
    updatedAt: string;
    publishedAt?: string | null;
  };
};

export type UpdatePostMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: UpdatePostInput;
}>;

export type UpdatePostMutation = {
  __typename?: 'Mutation';
  updatePost: {
    __typename?: 'BlogPost';
    id: string;
    title: string;
    slug: string;
    category: string;
    author: string;
    status: string;
    views: number;
    updatedAt: string;
    publishedAt?: string | null;
  };
};

export type DeletePostMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;

export type DeletePostMutation = { __typename?: 'Mutation'; deletePost: boolean };

export type CreateAdRedirectMutationVariables = Exact<{
  input: CreateAdRedirectInput;
}>;

export type CreateAdRedirectMutation = {
  __typename?: 'Mutation';
  createAdRedirect: {
    __typename?: 'AdRedirect';
    id: string;
    label: string;
    slug: string;
    target: string;
    clicks: number;
    active: boolean;
    createdAt: string;
  };
};

export type UpdateAdRedirectMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: UpdateAdRedirectInput;
}>;

export type UpdateAdRedirectMutation = {
  __typename?: 'Mutation';
  updateAdRedirect: {
    __typename?: 'AdRedirect';
    id: string;
    label: string;
    slug: string;
    target: string;
    clicks: number;
    active: boolean;
    createdAt: string;
  };
};

export type ToggleAdRedirectActiveMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;

export type ToggleAdRedirectActiveMutation = {
  __typename?: 'Mutation';
  toggleAdRedirectActive: {
    __typename?: 'AdRedirect';
    id: string;
    label: string;
    slug: string;
    target: string;
    clicks: number;
    active: boolean;
    createdAt: string;
  };
};

export type DeleteAdRedirectMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;

export type DeleteAdRedirectMutation = { __typename?: 'Mutation'; deleteAdRedirect: boolean };

export type CreateAdPopupMutationVariables = Exact<{
  input: CreateAdPopupInput;
}>;

export type CreateAdPopupMutation = {
  __typename?: 'Mutation';
  createAdPopup: {
    __typename?: 'AdPopup';
    id: string;
    name: string;
    trigger: string;
    image: string;
    target: string;
    impressions: number;
    clicks: number;
    active: boolean;
  };
};

export type UpdateAdPopupMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: UpdateAdPopupInput;
}>;

export type UpdateAdPopupMutation = {
  __typename?: 'Mutation';
  updateAdPopup: {
    __typename?: 'AdPopup';
    id: string;
    name: string;
    trigger: string;
    image: string;
    target: string;
    impressions: number;
    clicks: number;
    active: boolean;
  };
};

export type ToggleAdPopupActiveMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;

export type ToggleAdPopupActiveMutation = {
  __typename?: 'Mutation';
  toggleAdPopupActive: {
    __typename?: 'AdPopup';
    id: string;
    name: string;
    trigger: string;
    image: string;
    target: string;
    impressions: number;
    clicks: number;
    active: boolean;
  };
};

export type DeleteAdPopupMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;

export type DeleteAdPopupMutation = { __typename?: 'Mutation'; deleteAdPopup: boolean };

export type CreateVanHanEntryMutationVariables = Exact<{
  input: CreateVanHanEntryInput;
}>;

export type CreateVanHanEntryMutation = {
  __typename?: 'Mutation';
  createVanHanEntry: {
    __typename?: 'VanHanEntry';
    id: string;
    year: number;
    age: number;
    star: string;
    rating: string;
    summary: string;
    updatedAt: string;
    published: boolean;
  };
};

export type UpdateVanHanEntryMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: UpdateVanHanEntryInput;
}>;

export type UpdateVanHanEntryMutation = {
  __typename?: 'Mutation';
  updateVanHanEntry: {
    __typename?: 'VanHanEntry';
    id: string;
    year: number;
    age: number;
    star: string;
    rating: string;
    summary: string;
    updatedAt: string;
    published: boolean;
  };
};

export type ToggleVanHanPublishedMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;

export type ToggleVanHanPublishedMutation = {
  __typename?: 'Mutation';
  toggleVanHanPublished: {
    __typename?: 'VanHanEntry';
    id: string;
    year: number;
    age: number;
    star: string;
    rating: string;
    summary: string;
    updatedAt: string;
    published: boolean;
  };
};

export const AdminUserFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AdminUserFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AdminUser' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'displayName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'avatarSeed' } },
          { kind: 'Field', name: { kind: 'Name', value: 'role' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'credits' } },
          { kind: 'Field', name: { kind: 'Name', value: 'genCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastActiveAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'genHistory' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'input' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'fullName' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'gender' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'birthDate' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'birthHour' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'calendar' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AdminUserFieldsFragment, unknown>;
export const BlogPostFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'BlogPostFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'BlogPost' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'title' } },
          { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
          { kind: 'Field', name: { kind: 'Name', value: 'category' } },
          { kind: 'Field', name: { kind: 'Name', value: 'author' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'views' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'publishedAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<BlogPostFieldsFragment, unknown>;
export const AdRedirectFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AdRedirectFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AdRedirect' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'label' } },
          { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
          { kind: 'Field', name: { kind: 'Name', value: 'target' } },
          { kind: 'Field', name: { kind: 'Name', value: 'clicks' } },
          { kind: 'Field', name: { kind: 'Name', value: 'active' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AdRedirectFieldsFragment, unknown>;
export const AdPopupFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AdPopupFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AdPopup' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'trigger' } },
          { kind: 'Field', name: { kind: 'Name', value: 'image' } },
          { kind: 'Field', name: { kind: 'Name', value: 'target' } },
          { kind: 'Field', name: { kind: 'Name', value: 'impressions' } },
          { kind: 'Field', name: { kind: 'Name', value: 'clicks' } },
          { kind: 'Field', name: { kind: 'Name', value: 'active' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AdPopupFieldsFragment, unknown>;
export const VanHanEntryFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'VanHanEntryFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'VanHanEntry' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'year' } },
          { kind: 'Field', name: { kind: 'Name', value: 'age' } },
          { kind: 'Field', name: { kind: 'Name', value: 'star' } },
          { kind: 'Field', name: { kind: 'Name', value: 'rating' } },
          { kind: 'Field', name: { kind: 'Name', value: 'summary' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'published' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<VanHanEntryFieldsFragment, unknown>;
export const AdminOverviewDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'AdminOverview' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'adminOverview' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'kpis' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'key' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'label' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'deltaPct' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'trend' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'spark' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'format' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'traffic' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'date' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'views' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'users' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'sources' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'visits' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'element' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'genByType' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'count' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AdminOverviewQuery, AdminOverviewQueryVariables>;
export const AdminUsersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'AdminUsers' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'adminUsers' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AdminUserFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AdminUserFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AdminUser' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'displayName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'avatarSeed' } },
          { kind: 'Field', name: { kind: 'Name', value: 'role' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'credits' } },
          { kind: 'Field', name: { kind: 'Name', value: 'genCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastActiveAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'genHistory' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'input' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'fullName' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'gender' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'birthDate' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'birthHour' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'calendar' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AdminUsersQuery, AdminUsersQueryVariables>;
export const BlogDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Blog' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'blog' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'BlogPostFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'BlogPostFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'BlogPost' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'title' } },
          { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
          { kind: 'Field', name: { kind: 'Name', value: 'category' } },
          { kind: 'Field', name: { kind: 'Name', value: 'author' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'views' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'publishedAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<BlogQuery, BlogQueryVariables>;
export const AdsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Ads' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ads' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'redirects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AdRedirectFields' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'popups' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AdPopupFields' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AdRedirectFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AdRedirect' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'label' } },
          { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
          { kind: 'Field', name: { kind: 'Name', value: 'target' } },
          { kind: 'Field', name: { kind: 'Name', value: 'clicks' } },
          { kind: 'Field', name: { kind: 'Name', value: 'active' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AdPopupFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AdPopup' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'trigger' } },
          { kind: 'Field', name: { kind: 'Name', value: 'image' } },
          { kind: 'Field', name: { kind: 'Name', value: 'target' } },
          { kind: 'Field', name: { kind: 'Name', value: 'impressions' } },
          { kind: 'Field', name: { kind: 'Name', value: 'clicks' } },
          { kind: 'Field', name: { kind: 'Name', value: 'active' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AdsQuery, AdsQueryVariables>;
export const AdminVanHanDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'AdminVanHan' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'adminVanHan' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'VanHanEntryFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'VanHanEntryFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'VanHanEntry' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'year' } },
          { kind: 'Field', name: { kind: 'Name', value: 'age' } },
          { kind: 'Field', name: { kind: 'Name', value: 'star' } },
          { kind: 'Field', name: { kind: 'Name', value: 'rating' } },
          { kind: 'Field', name: { kind: 'Name', value: 'summary' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'published' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AdminVanHanQuery, AdminVanHanQueryVariables>;
export const BanUserDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'BanUser' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'banUser' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AdminUserFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AdminUserFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AdminUser' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'displayName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'avatarSeed' } },
          { kind: 'Field', name: { kind: 'Name', value: 'role' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'credits' } },
          { kind: 'Field', name: { kind: 'Name', value: 'genCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastActiveAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'genHistory' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'input' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'fullName' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'gender' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'birthDate' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'birthHour' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'calendar' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<BanUserMutation, BanUserMutationVariables>;
export const CreatePostDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreatePost' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CreatePostInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createPost' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'BlogPostFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'BlogPostFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'BlogPost' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'title' } },
          { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
          { kind: 'Field', name: { kind: 'Name', value: 'category' } },
          { kind: 'Field', name: { kind: 'Name', value: 'author' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'views' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'publishedAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreatePostMutation, CreatePostMutationVariables>;
export const UpdatePostDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdatePost' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UpdatePostInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updatePost' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'BlogPostFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'BlogPostFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'BlogPost' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'title' } },
          { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
          { kind: 'Field', name: { kind: 'Name', value: 'category' } },
          { kind: 'Field', name: { kind: 'Name', value: 'author' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'views' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'publishedAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdatePostMutation, UpdatePostMutationVariables>;
export const DeletePostDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeletePost' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deletePost' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeletePostMutation, DeletePostMutationVariables>;
export const CreateAdRedirectDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateAdRedirect' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CreateAdRedirectInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createAdRedirect' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AdRedirectFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AdRedirectFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AdRedirect' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'label' } },
          { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
          { kind: 'Field', name: { kind: 'Name', value: 'target' } },
          { kind: 'Field', name: { kind: 'Name', value: 'clicks' } },
          { kind: 'Field', name: { kind: 'Name', value: 'active' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateAdRedirectMutation, CreateAdRedirectMutationVariables>;
export const UpdateAdRedirectDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateAdRedirect' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UpdateAdRedirectInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateAdRedirect' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AdRedirectFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AdRedirectFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AdRedirect' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'label' } },
          { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
          { kind: 'Field', name: { kind: 'Name', value: 'target' } },
          { kind: 'Field', name: { kind: 'Name', value: 'clicks' } },
          { kind: 'Field', name: { kind: 'Name', value: 'active' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateAdRedirectMutation, UpdateAdRedirectMutationVariables>;
export const ToggleAdRedirectActiveDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ToggleAdRedirectActive' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'toggleAdRedirectActive' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AdRedirectFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AdRedirectFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AdRedirect' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'label' } },
          { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
          { kind: 'Field', name: { kind: 'Name', value: 'target' } },
          { kind: 'Field', name: { kind: 'Name', value: 'clicks' } },
          { kind: 'Field', name: { kind: 'Name', value: 'active' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ToggleAdRedirectActiveMutation,
  ToggleAdRedirectActiveMutationVariables
>;
export const DeleteAdRedirectDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteAdRedirect' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteAdRedirect' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteAdRedirectMutation, DeleteAdRedirectMutationVariables>;
export const CreateAdPopupDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateAdPopup' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CreateAdPopupInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createAdPopup' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AdPopupFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AdPopupFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AdPopup' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'trigger' } },
          { kind: 'Field', name: { kind: 'Name', value: 'image' } },
          { kind: 'Field', name: { kind: 'Name', value: 'target' } },
          { kind: 'Field', name: { kind: 'Name', value: 'impressions' } },
          { kind: 'Field', name: { kind: 'Name', value: 'clicks' } },
          { kind: 'Field', name: { kind: 'Name', value: 'active' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateAdPopupMutation, CreateAdPopupMutationVariables>;
export const UpdateAdPopupDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateAdPopup' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UpdateAdPopupInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateAdPopup' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AdPopupFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AdPopupFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AdPopup' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'trigger' } },
          { kind: 'Field', name: { kind: 'Name', value: 'image' } },
          { kind: 'Field', name: { kind: 'Name', value: 'target' } },
          { kind: 'Field', name: { kind: 'Name', value: 'impressions' } },
          { kind: 'Field', name: { kind: 'Name', value: 'clicks' } },
          { kind: 'Field', name: { kind: 'Name', value: 'active' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateAdPopupMutation, UpdateAdPopupMutationVariables>;
export const ToggleAdPopupActiveDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ToggleAdPopupActive' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'toggleAdPopupActive' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AdPopupFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AdPopupFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AdPopup' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'trigger' } },
          { kind: 'Field', name: { kind: 'Name', value: 'image' } },
          { kind: 'Field', name: { kind: 'Name', value: 'target' } },
          { kind: 'Field', name: { kind: 'Name', value: 'impressions' } },
          { kind: 'Field', name: { kind: 'Name', value: 'clicks' } },
          { kind: 'Field', name: { kind: 'Name', value: 'active' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ToggleAdPopupActiveMutation, ToggleAdPopupActiveMutationVariables>;
export const DeleteAdPopupDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteAdPopup' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteAdPopup' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteAdPopupMutation, DeleteAdPopupMutationVariables>;
export const CreateVanHanEntryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateVanHanEntry' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CreateVanHanEntryInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createVanHanEntry' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'VanHanEntryFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'VanHanEntryFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'VanHanEntry' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'year' } },
          { kind: 'Field', name: { kind: 'Name', value: 'age' } },
          { kind: 'Field', name: { kind: 'Name', value: 'star' } },
          { kind: 'Field', name: { kind: 'Name', value: 'rating' } },
          { kind: 'Field', name: { kind: 'Name', value: 'summary' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'published' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateVanHanEntryMutation, CreateVanHanEntryMutationVariables>;
export const UpdateVanHanEntryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateVanHanEntry' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UpdateVanHanEntryInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateVanHanEntry' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'VanHanEntryFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'VanHanEntryFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'VanHanEntry' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'year' } },
          { kind: 'Field', name: { kind: 'Name', value: 'age' } },
          { kind: 'Field', name: { kind: 'Name', value: 'star' } },
          { kind: 'Field', name: { kind: 'Name', value: 'rating' } },
          { kind: 'Field', name: { kind: 'Name', value: 'summary' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'published' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateVanHanEntryMutation, UpdateVanHanEntryMutationVariables>;
export const ToggleVanHanPublishedDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ToggleVanHanPublished' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'toggleVanHanPublished' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'VanHanEntryFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'VanHanEntryFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'VanHanEntry' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'year' } },
          { kind: 'Field', name: { kind: 'Name', value: 'age' } },
          { kind: 'Field', name: { kind: 'Name', value: 'star' } },
          { kind: 'Field', name: { kind: 'Name', value: 'rating' } },
          { kind: 'Field', name: { kind: 'Name', value: 'summary' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'published' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ToggleVanHanPublishedMutation, ToggleVanHanPublishedMutationVariables>;
