import { graphql } from '@/gql';

export const adminPaymentsDocument = graphql(`
  query AdminPayments($page: Int, $limit: Int, $status: PaymentStatus) {
    payments(page: $page, limit: $limit, status: $status) {
      total
      payments {
        id
        amountVnd
        content
        referenceCode
        status
        unmatchedReason
        creditsGranted
        suggestedCredits
        userEmail
        transactionAt
      }
    }
  }
`);

export const assignPaymentDocument = graphql(`
  mutation AssignPayment($input: AssignPaymentInput!) {
    assignPayment(input: $input) {
      id
      status
      creditsGranted
      userEmail
    }
  }
`);
