import { graphql } from '@/gql';

export const metricFieldsFragment = graphql(`
  fragment MetricFields on PeriodMetric {
    value
    previous
    series {
      date
      count
    }
  }
`);

export const adminOverviewDocument = graphql(`
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
`);
