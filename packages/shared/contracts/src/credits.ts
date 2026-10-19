export interface CreditSummary {
  readonly dailyLimit: number;
  readonly dailyRemaining: number;
  readonly chapterCredits: number;
}

export interface CreditCheckout {
  readonly qrImageUrl: string;
  readonly bankCode: string;
  readonly accountNumber: string;
  readonly accountName: string;
  readonly amountVnd: number;
  readonly transferContent: string;
  readonly creditsPerPayment: number;
}

export const GIFT_CODE_MAX_LENGTH = 32;
export const MAX_GIFT_CODE_CREDITS = 1000;
export const MAX_GIFT_CODE_REDEMPTIONS = 100000;
export const MIN_ASSIGNED_CREDITS = 1;
export const MAX_ASSIGNED_CREDITS = 1000;
export const MAX_CREDIT_ADJUSTMENT = 1000;
export const MAX_DAILY_CHAPTER_QUOTA = 100;

export interface RedeemGiftCodeRequest {
  readonly code: string;
}

export interface RedeemGiftCodeResponse {
  readonly creditsGranted: number;
  readonly chapterCredits: number;
}
