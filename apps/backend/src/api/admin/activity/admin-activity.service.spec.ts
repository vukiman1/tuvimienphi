import { Repository } from 'typeorm';
import { ActivityLogEntity } from '../../activity/entities/activity-log.entity';
import { AdminActivityService } from './admin-activity.service';
import { DEFAULT_ACTIVITY_LIMIT } from './dto/recent-activity.args';

interface Recorded {
  limit?: number;
  offset?: number;
  order?: readonly [string, string];
  selects: [column: string, alias: string][];
}

function serviceWith(
  rows: Record<string, unknown>[],
  total = 0,
): {
  service: AdminActivityService;
  recorded: Recorded;
} {
  const recorded: Recorded = { selects: [] };
  const builder = {
    leftJoin: () => builder,
    select: () => builder,
    addSelect: (column: string, alias: string) => {
      recorded.selects.push([column, alias]);
      return builder;
    },
    orderBy: (column: string, direction: string) => {
      recorded.order = [column, direction];
      return builder;
    },
    limit: (value: number) => {
      recorded.limit = value;
      return builder;
    },
    offset: (value: number) => {
      recorded.offset = value;
      return builder;
    },
    getRawMany: async () => rows,
  };
  const repo = {
    createQueryBuilder: () => builder,
    count: async () => total,
  } as unknown as Repository<ActivityLogEntity>;

  return { service: new AdminActivityService(repo), recorded };
}

describe('AdminActivityService.recent', () => {
  it('shows the newest activity first', async () => {
    const { service, recorded } = serviceWith([]);

    await service.recent({});

    expect(recorded.order).toEqual(['activity.occurred_at', 'DESC']);
  });

  it('falls back to a sensible page size when the caller names none', async () => {
    const { service, recorded } = serviceWith([]);

    await service.recent({ limit: null });

    expect(recorded.limit).toBe(DEFAULT_ACTIVITY_LIMIT);
  });

  it('honours the size the caller asked for', async () => {
    const { service, recorded } = serviceWith([]);

    await service.recent({ limit: 5 });

    expect(recorded.limit).toBe(5);
  });

  it('still names the actor after their account is gone', async () => {
    const { service } = serviceWith([
      {
        id: 'activity-1',
        occurredAt: new Date('2026-09-28T03:00:00.000Z'),
        event: 'auth.login.succeeded',
        userId: null,
        actorEmail: 'gone@example.com',
        actorName: null,
        ipAddress: null,
      },
    ]);

    const { entries } = await service.recent({});
    const [entry] = entries;

    expect(entry).toEqual({
      id: 'activity-1',
      occurredAt: '2026-09-28T03:00:00.000Z',
      event: 'auth.login.succeeded',
      userId: null,
      actorEmail: 'gone@example.com',
      actorName: null,
      ipAddress: null,
    });
  });

  it('starts at the top of the log when no page is asked for', async () => {
    const { service, recorded } = serviceWith([]);

    await service.recent({});

    expect(recorded.offset).toBe(0);
  });

  it('skips the pages already read to reach the one asked for', async () => {
    const { service, recorded } = serviceWith([]);

    await service.recent({ page: 3, limit: 15 });

    expect(recorded.offset).toBe(30);
  });

  it('treats an explicitly null page as the first page', async () => {
    const { service, recorded } = serviceWith([]);

    await service.recent({ page: null });

    expect(recorded.offset).toBe(0);
  });

  it('reports how many events exist so the reader knows how far back it goes', async () => {
    const { service } = serviceWith([], 142);

    const { total } = await service.recent({});

    expect(total).toBe(142);
  });

  it('sources the actor email from the log first, falling back to the live user record', async () => {
    const { service, recorded } = serviceWith([]);

    await service.recent({});

    const actorEmailSelect = recorded.selects.find(([, alias]) => alias === 'actorEmail');

    expect(actorEmailSelect?.[0]).toBe('COALESCE(activity.actor_email, actor.email)');
  });
});
