import { describe, expect, it } from 'vitest';
import { ACTIVITY_LABEL, activityLabel } from './activity-label';

const BACKEND_EVENTS = [
  'auth.login.succeeded',
  'auth.login.failed',
  'auth.logout',
  'auth.logout_all',
  'auth.token.refreshed',
  'auth.registered',
  'auth.email.verified',
  'auth.password.reset_requested',
  'auth.password.reset',
  'auth.password.changed',
  'auth.login.two_factor_required',
  'auth.login.two_factor_failed',
  'auth.two_factor.enabled',
  'auth.two_factor.disabled',
  'auth.two_factor.recovery_requested',
  'auth.two_factor.recovered',
  'la-so.viewed',
];

describe('activityLabel', () => {
  it('has wording for every event the backend can send', () => {
    const missing = BACKEND_EVENTS.filter((event) => !(event in ACTIVITY_LABEL));

    expect(missing).toEqual([]);
  });

  it('shows the raw event when the backend sends one the console has not learnt yet', () => {
    expect(activityLabel('billing.invoice.paid')).toBe('billing.invoice.paid');
  });

  it('reads as something a person did', () => {
    expect(activityLabel('auth.login.failed')).toBe('đăng nhập thất bại');
  });
});
