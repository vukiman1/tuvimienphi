import { BadRequestException } from '@nestjs/common';
import { MAX_USAGE_RANGE_DAYS } from './dto/ai-usage.args';

const MS_PER_DAY = 86_400_000;

export function assertUsageRange(from: string, to: string): void {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) {
    throw new BadRequestException('from and to must be real dates');
  }
  if (start > end) {
    throw new BadRequestException('from must not be after to');
  }
  if ((end - start) / MS_PER_DAY >= MAX_USAGE_RANGE_DAYS) {
    throw new BadRequestException(`the range must be at most ${MAX_USAGE_RANGE_DAYS} days`);
  }
}
