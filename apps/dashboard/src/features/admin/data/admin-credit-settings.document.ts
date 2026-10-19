import { graphql } from '@/gql';

export const adminCreditSettingsDocument = graphql(`
  query AdminCreditSettings {
    creditSettings {
      dailyChapterQuota
    }
  }
`);

export const updateCreditSettingsDocument = graphql(`
  mutation UpdateCreditSettings($input: UpdateCreditSettingsInput!) {
    updateCreditSettings(input: $input) {
      dailyChapterQuota
    }
  }
`);
