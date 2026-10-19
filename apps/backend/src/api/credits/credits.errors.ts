export class ChapterCreditsWouldGoNegativeError extends Error {
  constructor(userId: string, delta: number) {
    super(`Chapter credits adjustment of ${delta} for user ${userId} would go below zero`);
    this.name = 'ChapterCreditsWouldGoNegativeError';
  }
}

export class ChapterCreditsUserNotFoundError extends Error {
  constructor(userId: string) {
    super(`Cannot change chapter credits: user ${userId} not found`);
    this.name = 'ChapterCreditsUserNotFoundError';
  }
}

export class PaymentCodeAllocationError extends Error {
  constructor(userId: string) {
    super(`Could not allocate a payment code for user ${userId}`);
    this.name = 'PaymentCodeAllocationError';
  }
}

export class CreditSettingsMissingError extends Error {
  constructor() {
    super('The credit_settings row is missing; run the CreateCreditSettings migration');
    this.name = 'CreditSettingsMissingError';
  }
}
