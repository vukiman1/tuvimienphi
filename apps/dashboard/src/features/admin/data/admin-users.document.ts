import { graphql } from '@/gql';

export const adminUsersDocument = graphql(`
  query AdminUsers($page: Int, $limit: Int, $search: String) {
    users(page: $page, limit: $limit, search: $search) {
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
