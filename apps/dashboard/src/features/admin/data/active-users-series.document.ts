import { graphql } from '@/gql';

export const activeUsersSeriesDocument = graphql(`
  query ActiveUsersSeries($from: String, $to: String) {
    activeUsersSeries(from: $from, to: $to) {
      date
      count
    }
  }
`);
