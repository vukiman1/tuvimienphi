import { RedisService } from '@org/backend-redis';
import { Injectable } from '@nestjs/common';

const POOL_KEY = 'proxies:pool';
const COOLDOWN_KEY = 'proxies:cooldown';
const COOLDOWN_MS = 300_000;

const RECLAIM_AND_NEXT = `
local now = tonumber(ARGV[1])
local ready = redis.call('ZRANGEBYSCORE', KEYS[2], '-inf', now)
for i = 1, #ready do
  redis.call('ZREM', KEYS[2], ready[i])
  redis.call('RPUSH', KEYS[1], ready[i])
end
return redis.call('RPOPLPUSH', KEYS[1], KEYS[1])
`;

const MARK_BAD = `
redis.call('LREM', KEYS[1], 0, ARGV[1])
redis.call('ZADD', KEYS[2], ARGV[2], ARGV[1])
`;

@Injectable()
export class ProxyService {
  constructor(private readonly redis: RedisService) {}

  add(...proxies: string[]): Promise<number> {
    return this.redis.eval<number>(
      `for i=1,#ARGV do redis.call('RPUSH', KEYS[1], ARGV[i]) end; return redis.call('LLEN', KEYS[1])`,
      1,
      POOL_KEY,
      ...proxies,
    );
  }

  next(): Promise<string | null> {
    return this.redis.eval<string | null>(RECLAIM_AND_NEXT, 2, POOL_KEY, COOLDOWN_KEY, Date.now());
  }

  async markBad(proxy: string): Promise<void> {
    await this.redis.eval(MARK_BAD, 2, POOL_KEY, COOLDOWN_KEY, proxy, Date.now() + COOLDOWN_MS);
  }
}
