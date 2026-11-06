import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, hkdfSync } from 'crypto';
import { FUNNEL_HKDF_INFO, FUNNEL_KEY_BYTES } from './funnel.constants';
import { FunnelConfigError } from './funnel.errors';

const HASH_ALGORITHM = 'sha256';
const NO_SALT = '';

@Injectable()
export class FunnelKeyHasher {
  private readonly key: Buffer;

  constructor(configService: ConfigService) {
    const secretKey = configService.get<string>('crypto.secretKey');
    if (!secretKey) throw new FunnelConfigError();
    this.key = Buffer.from(
      hkdfSync(HASH_ALGORITHM, secretKey, NO_SALT, FUNNEL_HKDF_INFO, FUNNEL_KEY_BYTES),
    );
  }

  hash(birthKey: string): string {
    return createHmac(HASH_ALGORITHM, this.key).update(birthKey).digest('hex');
  }
}
