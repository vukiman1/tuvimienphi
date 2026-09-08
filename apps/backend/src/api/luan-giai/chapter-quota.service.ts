import { Injectable } from '@nestjs/common';
import { RedisService } from '@org/backend-redis';
import { DAILY_CHAPTER_QUOTA, QUOTA_WINDOW_SECONDS } from './luan-giai.constants';

/**
 * Đọc rồi tăng trong một lệnh: hai request cùng lúc của một người không được cùng thấy còn suất
 * cuối. Trả -1 khi đã hết để lần bị từ chối không ăn mất một suất.
 */
const CONSUME = `
local used = tonumber(redis.call('GET', KEYS[1]) or '0')
if used >= tonumber(ARGV[2]) then return -1 end
local n = redis.call('INCR', KEYS[1])
if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return n
`;

@Injectable()
export class ChapterQuotaService {
  constructor(private readonly redis: RedisService) {}

  async consume(userId: string): Promise<boolean> {
    const used = await this.redis.eval<number>(
      CONSUME,
      1,
      `luan-giai:quota:${userId}`,
      QUOTA_WINDOW_SECONDS,
      DAILY_CHAPTER_QUOTA,
    );
    return used !== -1;
  }
}
