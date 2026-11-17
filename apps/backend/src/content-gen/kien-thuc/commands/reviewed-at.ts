const VIET_NAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';

export function reviewedAtOf(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: VIET_NAM_TIME_ZONE }).format(now);
}
