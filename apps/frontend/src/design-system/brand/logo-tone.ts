export enum LogoTone {
  OnDark = 'on-dark',
  OnLight = 'on-light',
}

export const LOGO_WORDMARK_CLASS: Readonly<Record<LogoTone, string>> = {
  [LogoTone.OnDark]: 'text-day',
  [LogoTone.OnLight]: 'text-ink',
};
