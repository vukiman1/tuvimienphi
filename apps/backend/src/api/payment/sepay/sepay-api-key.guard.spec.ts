import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { SepayApiKeyGuard } from './sepay-api-key.guard';

const API_KEY = 'secret-key';

const buildGuard = (configuredKey: string): SepayApiKeyGuard => {
  const configService = { getOrThrow: () => configuredKey } as unknown as ConfigService;
  return new SepayApiKeyGuard(configService);
};

const contextWith = (authorization: string | undefined): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ headers: { authorization } }) }),
  }) as unknown as ExecutionContext;

describe('SepayApiKeyGuard', () => {
  it('accepts the configured key', () => {
    expect(buildGuard(API_KEY).canActivate(contextWith(`Apikey ${API_KEY}`))).toBe(true);
  });

  it('rejects a wrong key', () => {
    expect(() => buildGuard(API_KEY).canActivate(contextWith('Apikey nope'))).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects a key of a different length', () => {
    expect(() => buildGuard(API_KEY).canActivate(contextWith(`Apikey ${API_KEY}x`))).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects a request without an authorization header', () => {
    expect(() => buildGuard(API_KEY).canActivate(contextWith(undefined))).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects every request while the configured key is empty', () => {
    const guard = buildGuard('');
    expect(() => guard.canActivate(contextWith('Apikey '))).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(contextWith('Apikey'))).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(contextWith(undefined))).toThrow(UnauthorizedException);
  });
});
