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
