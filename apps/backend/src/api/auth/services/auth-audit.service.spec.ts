import type { Request } from 'express';
import { AuthAuditService, AuthEvent, type AuthEventContext } from './auth-audit.service';
import { ActivityLogService } from '../../activity/activity-log.service';

function requestWith(overrides: Partial<Request>): AuthEventContext['request'] {
  return { headers: {}, ...overrides } as Request;
}

function auditWith(record: jest.Mock): AuthAuditService {
  const activity = { record } as unknown as ActivityLogService;
  return new AuthAuditService(activity);
}

describe('AuthAuditService.record', () => {
  it('writes a login to the activity log with the address it came from', () => {
    const record = jest.fn();
    const request = requestWith({
      ip: '198.51.100.7',
      headers: { 'user-agent': 'Mozilla/5.0' },
    });

    auditWith(record).record(AuthEvent.LOGIN_SUCCEEDED, {
      userId: 'user-1',
      email: 'kim@example.com',
      jti: 'session-1',
      request,
    });

    expect(record).toHaveBeenCalledWith(AuthEvent.LOGIN_SUCCEEDED, {
      userId: 'user-1',
      actorEmail: 'kim@example.com',
      ipAddress: '198.51.100.7',
      userAgent: 'Mozilla/5.0',
      metadata: { jti: 'session-1' },
    });
  });

  it('prefers the forwarded address, since the app sits behind a proxy', () => {
    const record = jest.fn();
    const request = requestWith({
      ip: '10.0.0.1',
      headers: { 'x-forwarded-for': '203.0.113.9, 10.0.0.1' },
    });

    auditWith(record).record(AuthEvent.LOGIN_FAILED, { email: 'stranger@example.com', request });

    expect(record).toHaveBeenCalledWith(
      AuthEvent.LOGIN_FAILED,
      expect.objectContaining({ ipAddress: '203.0.113.9' }),
    );
  });

  it('records an event that carries no request at all', () => {
    const record = jest.fn();

    auditWith(record).record(AuthEvent.EMAIL_VERIFIED, { userId: 'user-1' });

    expect(record).toHaveBeenCalledWith(AuthEvent.EMAIL_VERIFIED, {
      userId: 'user-1',
      actorEmail: undefined,
      ipAddress: undefined,
      userAgent: undefined,
      metadata: null,
    });
  });
});
