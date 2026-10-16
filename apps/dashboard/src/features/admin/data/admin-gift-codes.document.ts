import { graphql } from '@/gql';

export const adminGiftCodesDocument = graphql(`
  query AdminGiftCodes {
    giftCodes {
      id
      code
      credits
      maxRedemptions
      redeemedCount
      expiresAt
      isActive
      createdByEmail
      createdAt
    }
  }
`);

export const createGiftCodeDocument = graphql(`
  mutation CreateGiftCode($input: CreateGiftCodeInput!) {
    createGiftCode(input: $input) {
      id
    }
  }
`);

export const setGiftCodeActiveDocument = graphql(`
  mutation SetGiftCodeActive($id: ID!, $isActive: Boolean!) {
    setGiftCodeActive(id: $id, isActive: $isActive) {
      id
      isActive
    }
  }
`);
