import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLogEntity } from '../../activity/entities/activity-log.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { ActivityEntry, ActivityPage } from './admin-activity.type';
import {
  DEFAULT_ACTIVITY_LIMIT,
  DEFAULT_ACTIVITY_PAGE,
  RecentActivityArgs,
} from './dto/recent-activity.args';

interface ActivityRow {
  id: string;
  occurredAt: Date;
  event: string;
  userId: string | null;
  actorEmail: string | null;
  actorName: string | null;
  ipAddress: string | null;
}

@Injectable()
export class AdminActivityService {
  constructor(
    @InjectRepository(ActivityLogEntity)
    private readonly repo: Repository<ActivityLogEntity>,
  ) {}

  async recent(args: RecentActivityArgs): Promise<ActivityPage> {
    const limit = args.limit ?? DEFAULT_ACTIVITY_LIMIT;
    const page = args.page ?? DEFAULT_ACTIVITY_PAGE;

    const total = await this.repo.count();
    const rows = await this.repo
      .createQueryBuilder('activity')
      .leftJoin(UserEntity, 'actor', 'actor.id = activity.user_id')
      .select('activity.id', 'id')
      .addSelect('activity.occurred_at', 'occurredAt')
      .addSelect('activity.event', 'event')
      .addSelect('activity.user_id', 'userId')
      .addSelect('COALESCE(activity.actor_email, actor.email)', 'actorEmail')
      .addSelect('activity.ip_address', 'ipAddress')
      .addSelect('actor.display_name', 'actorName')
      .orderBy('activity.occurred_at', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit)
      .getRawMany<ActivityRow>();

    return { entries: rows.map(toEntry), total };
  }
}

function toEntry(row: ActivityRow): ActivityEntry {
  return {
    id: row.id,
    occurredAt: row.occurredAt.toISOString(),
    event: row.event,
    userId: row.userId,
    actorEmail: row.actorEmail,
    actorName: row.actorName,
    ipAddress: row.ipAddress,
  };
}
