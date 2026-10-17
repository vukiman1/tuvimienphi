export class GiftCodeNotFoundError extends Error {
  constructor(code: string) {
    super(`Gift code ${code} does not exist or is inactive`);
    this.name = 'GiftCodeNotFoundError';
  }
}

export class GiftCodeExpiredError extends Error {
  constructor(code: string) {
    super(`Gift code ${code} has expired`);
    this.name = 'GiftCodeExpiredError';
  }
}

export class GiftCodeUsedUpError extends Error {
  constructor(code: string) {
    super(`Gift code ${code} has no redemptions left`);
    this.name = 'GiftCodeUsedUpError';
  }
}

export class GiftCodeAlreadyRedeemedError extends Error {
  constructor(code: string, userId: string) {
    super(`Gift code ${code} was already redeemed by user ${userId}`);
    this.name = 'GiftCodeAlreadyRedeemedError';
  }
}
