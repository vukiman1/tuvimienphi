import { createHash } from 'crypto';
import type { ConfigService } from '@nestjs/config';
import { FunnelKeyHasher } from './funnel-key-hasher';
import { FunnelConfigError } from './funnel.errors';

const SECRET = 'funnel-test-secret-key-at-least-32-chars';
const BIRTH_KEY = '1990-11-05-am-h3-nu';

function hasherWith(secretKey: string | undefined): FunnelKeyHasher {
  const config = {
    get: (key: string): string | undefined => (key === 'crypto.secretKey' ? secretKey : undefined),
  };
  return new FunnelKeyHasher(config as unknown as ConfigService);
}

describe('FunnelKeyHasher', () => {
  it('gives the same hash for the same chart under the same secret', () => {
    expect(hasherWith(SECRET).hash(BIRTH_KEY)).toBe(hasherWith(SECRET).hash(BIRTH_KEY));
  });

  it('produces 64 lowercase hex characters', () => {
    expect(hasherWith(SECRET).hash(BIRTH_KEY)).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is keyed, so a plain sha256 dictionary cannot reverse it', () => {
    const unkeyed = createHash('sha256').update(BIRTH_KEY).digest('hex');
    expect(hasherWith(SECRET).hash(BIRTH_KEY)).not.toBe(unkeyed);
  });

  it('changes when the server secret changes', () => {
    expect(hasherWith(SECRET).hash(BIRTH_KEY)).not.toBe(
      hasherWith(`${SECRET}-rotated`).hash(BIRTH_KEY),
    );
  });

  it('never contains the raw birth key', () => {
    expect(hasherWith(SECRET).hash(BIRTH_KEY)).not.toContain(BIRTH_KEY);
  });

  it('refuses to start without a server secret', () => {
    expect(() => hasherWith(undefined)).toThrow(FunnelConfigError);
  });
});
