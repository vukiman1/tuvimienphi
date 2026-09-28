import { graphql } from '@/gql';

export const recentActivityDocument = graphql(`
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
`);
