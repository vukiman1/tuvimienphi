export const EMAIL_QUEUE = 'email';

export enum EmailKind {
  WELCOME = 'welcome',
  EMAIL_VERIFICATION = 'email-verification',
  PASSWORD_RESET = 'password-reset',
  TWO_FACTOR_RECOVERY = 'two-factor-recovery',
}

export interface WelcomeEmailJob {
  readonly kind: EmailKind.WELCOME;
  readonly to: string;
}

export interface CodeEmailJob {
  readonly kind:
    EmailKind.EMAIL_VERIFICATION | EmailKind.PASSWORD_RESET | EmailKind.TWO_FACTOR_RECOVERY;
  readonly to: string;
  readonly code: string;
  readonly expiryMinutes: number;
}

export type EmailJob = WelcomeEmailJob | CodeEmailJob;
