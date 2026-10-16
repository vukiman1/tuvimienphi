import type { PaymentStatus, UnmatchedReason } from './payment-status.enum';

export interface PaymentSummary {
  readonly id: string;
  readonly amountVnd: number;
  readonly content: string;
  readonly referenceCode: string;
  readonly status: PaymentStatus;
  readonly unmatchedReason: UnmatchedReason | null;
  readonly creditsGranted: number;
  readonly suggestedCredits: number;
  readonly userEmail: string | null;
  readonly transactionAt: string;
}

export interface PaymentPageResult {
  readonly payments: readonly PaymentSummary[];
  readonly total: number;
}

export interface ListPaymentsQuery {
  readonly page?: number | null;
  readonly limit?: number | null;
  readonly status?: PaymentStatus | null;
}

export interface AssignPaymentCommand {
  readonly paymentId: string;
  readonly userEmail: string;
  readonly credits: number;
}
