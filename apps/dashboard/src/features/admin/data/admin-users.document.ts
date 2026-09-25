import { graphql } from '@/gql';

export const adminUsersDocument = graphql(`
  query AdminUsers(
    $page: Int
    $limit: Int
    $search: String
    $roles: [Role!]
    $isEmailVerified: Boolean
    $joinedFrom: String
    $joinedTo: String
    $balanceMin: Int
    $balanceMax: Int
    $sortBy: AdminUserSortField
    $sortDirection: SortDirection
  ) {
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
`);
