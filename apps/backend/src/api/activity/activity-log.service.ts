import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { EntityManager, QueryDeepPartialEntity } from 'typeorm';
import { Repository } from 'typeorm';
import { ActivityLogEntity } from './entities/activity-log.entity';

export const MAX_EVENT_LENGTH = 64;
export const MAX_IP_ADDRESS_LENGTH = 255;

export interface ActivityContext {
  readonly userId?: string | null;
  readonly actorEmail?: string | null;
  readonly ipAddress?: string | null;
  readonly userAgent?: string | null;
  readonly metadata?: Record<string, unknown> | null;
  readonly occurredAt?: Date;
}

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger('ActivityLog');

  constructor(
    @InjectRepository(ActivityLogEntity)
    private readonly repo: Repository<ActivityLogEntity>,
  ) {}

  record(event: string, context: ActivityContext = {}): void {
    const payload = this.toPayload(event, context);
    if (!payload) {
      return;
    }

    void this.repo.insert(payload).catch((error: unknown) => {
      this.logger.error({ message: `Could not record ${event}`, error });
    });
  }

  async recordWithin(
    manager: EntityManager,
    event: string,
    context: ActivityContext = {},
  ): Promise<void> {
    const payload = this.toPayload(event, context);
    if (!payload) {
      return;
    }

    await manager.insert(ActivityLogEntity, payload);
  }

  private toPayload(
    event: string,
    context: ActivityContext,
  ): QueryDeepPartialEntity<ActivityLogEntity> | null {
    if (event.length > MAX_EVENT_LENGTH) {
      this.logger.error(
        `Activity event "${event}" is ${event.length} characters, over the ${MAX_EVENT_LENGTH} the column holds`,
      );
      return null;
    }

    const rawIpAddress = context.ipAddress ?? null;
    const isIpAddressTooLong = rawIpAddress !== null && rawIpAddress.length > MAX_IP_ADDRESS_LENGTH;
    if (isIpAddressTooLong) {
      this.logger.error(
        `Activity ipAddress is ${rawIpAddress.length} characters, over the ${MAX_IP_ADDRESS_LENGTH} the column holds`,
      );
    }

    return {
      event,
      occurredAt: context.occurredAt ?? new Date(),
      userId: context.userId ?? null,
      actorEmail: context.actorEmail ?? null,
      ipAddress: isIpAddressTooLong ? null : rawIpAddress,
      userAgent: context.userAgent ?? null,
      metadata: context.metadata ?? null,
    };
  }
}
