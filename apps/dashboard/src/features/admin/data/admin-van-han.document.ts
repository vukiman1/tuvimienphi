import { graphql } from '@/gql';

export const vanHanYearsDocument = graphql(`
  query VanHanYears {
    vanHanYears {
      year
      publishedAt
      entryCount
    }
  }
`);

export const vanHanYearDocument = graphql(`
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
`);

export const vanHanEntryFieldsFragment = graphql(`
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
`);

export const vanHanEditorDocument = graphql(`
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
`);

export const saveVanHanEntryDocument = graphql(`
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
`);

export const publishVanHanYearDocument = graphql(`
  mutation PublishVanHanYear($year: Int!) {
    publishVanHanYear(year: $year) {
      year
      publishedAt
    }
  }
`);

export const unpublishVanHanYearDocument = graphql(`
  mutation UnpublishVanHanYear($year: Int!) {
    unpublishVanHanYear(year: $year) {
      year
      publishedAt
    }
  }
`);
