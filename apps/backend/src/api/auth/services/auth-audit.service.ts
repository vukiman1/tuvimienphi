import { Injectable, Logger } from '@nestjs/common';
import type { Request } from 'express';
import { ActivityLogService } from '../../activity/activity-log.service';

export enum AuthEvent {
  LOGIN_SUCCEEDED = 'auth.login.succeeded',
  LOGIN_FAILED = 'auth.login.failed',
  LOGOUT = 'auth.logout',
  LOGOUT_ALL = 'auth.logout_all',
  TOKEN_REFRESHED = 'auth.token.refreshed',
  REGISTERED = 'auth.registered',
  EMAIL_VERIFIED = 'auth.email.verified',
  PASSWORD_RESET_REQUESTED = 'auth.password.reset_requested',
  PASSWORD_RESET = 'auth.password.reset',
  PASSWORD_CHANGED = 'auth.password.changed',
  LOGIN_TWO_FACTOR_REQUIRED = 'auth.login.two_factor_required',
  LOGIN_TWO_FACTOR_FAILED = 'auth.login.two_factor_failed',
  TWO_FACTOR_ENABLED = 'auth.two_factor.enabled',
  TWO_FACTOR_DISABLED = 'auth.two_factor.disabled',
  TWO_FACTOR_RECOVERY_REQUESTED = 'auth.two_factor.recovery_requested',
  TWO_FACTOR_RECOVERED = 'auth.two_factor.recovered',
}

export interface AuthEventContext {
  userId?: string;
  email?: string;
  jti?: string;
  request?: Request;
}

@Injectable()
export class AuthAuditService {
  private readonly logger = new Logger('AuthAudit');

  constructor(private readonly activity: ActivityLogService) {}

  record(event: AuthEvent, context: AuthEventContext = {}): void {
    const { request, ...fields } = context;
    const ip = request ? clientIp(request) : undefined;
    const userAgent = request?.headers['user-agent'];

    this.logger.log({ event, ...fields, ip, userAgent });

    this.activity.record(event, {
      userId: fields.userId,
      actorEmail: fields.email,
      ipAddress: ip,
      userAgent,
      metadata: fields.jti ? { jti: fields.jti } : null,
    });
  }
}

function clientIp(request: Request): string | undefined {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return request.ip;
}
