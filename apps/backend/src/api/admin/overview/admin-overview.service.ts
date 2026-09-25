import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { AuthProvider } from '@org/backend-enum';
import { AuthIdentityEntity } from '../../auth/entities/auth-identity.entity';
import { UserSessionEntity } from '../../auth/entities/user-session.entity';
import { LaSoHistoryEntity } from '../../la-so/entities/la-so-history.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { AdminOverview, DailyCount, LabelledCount, PeriodMetric } from './admin-overview.type';
import { DEFAULT_RANGE_DAYS, MAX_RANGE_DAYS, OverviewArgs } from './dto/overview.args';

const UNKNOWN_DEVICE = 'Không rõ';
const MS_PER_DAY = 86_400_000;

interface DailyRow {
  date: string;
  count: string;
}

interface LabelledRow {
  label: string | null;
  count: string;
}

interface Window {
  start: Date;
  end: Date;
  days: number;
}

@Injectable()
export class AdminOverviewService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(UserSessionEntity)
    private readonly sessionRepo: Repository<UserSessionEntity>,
    @InjectRepository(LaSoHistoryEntity)
    private readonly historyRepo: Repository<LaSoHistoryEntity>,
    @InjectRepository(AuthIdentityEntity)
    private readonly identityRepo: Repository<AuthIdentityEntity>,
  ) {}

  async summarise(args: OverviewArgs): Promise<AdminOverview> {
    const current = resolveWindow(args);
    const previous = precedingWindow(current);

    const [
      totalUsers,
      googleUsers,
      passwordUsers,
      savedCharts,
      activeUsers,
      logins,
      newUsers,
      newCharts,
      devices,
    ] = await Promise.all([
      this.userRepo.count(),
      this.identityRepo.count({ where: { provider: AuthProvider.GOOGLE } }),
      this.userRepo.count({ where: { password: Not(IsNull()) } }),
      this.historyRepo.count(),
      this.metric(
        current,
        previous,
        (w) => this.countActiveUsers(w),
        (w) => this.activeUsersPerDay(w),
      ),
      this.metric(
        current,
        previous,
        (w) => this.countRows(this.sessionRepo, 'created_at', w),
        (w) => this.rowsPerDay(this.sessionRepo, 'created_at', w),
      ),
      this.metric(
        current,
        previous,
        (w) => this.countRows(this.userRepo, 'created_at', w),
        (w) => this.rowsPerDay(this.userRepo, 'created_at', w),
      ),
      this.metric(
        current,
        previous,
        (w) => this.countRows(this.historyRepo, 'created_at', w),
        (w) => this.rowsPerDay(this.historyRepo, 'created_at', w),
      ),
      this.deviceBreakdown(current),
    ]);

    return {
      from: isoDate(current.start),
      to: isoDate(new Date(current.end.getTime() - MS_PER_DAY)),
      totalUsers,
      googleUsers,
      passwordUsers,
      savedCharts,
      activeUsers,
      logins,
      newUsers,
      newCharts,
      devices,
    };
  }

  async activeUsersSeries(args: OverviewArgs): Promise<DailyCount[]> {
    return this.activeUsersPerDay(resolveWindow(args));
  }

  private async metric(
    current: Window,
    previous: Window,
    count: (window: Window) => Promise<number>,
    series: (window: Window) => Promise<DailyCount[]>,
  ): Promise<PeriodMetric> {
    const [value, prior, rows] = await Promise.all([
      count(current),
      count(previous),
      series(current),
    ]);
    return { value, previous: prior, series: rows };
  }

  private async rowsPerDay<T extends object>(
    repo: Repository<T>,
    column: string,
    window: Window,
  ): Promise<DailyCount[]> {
    const rows = await repo
      .createQueryBuilder('row')
      .select(`to_char(row.${column}, 'YYYY-MM-DD')`, 'date')
      .addSelect('COUNT(*)', 'count')
      .where(`row.${column} >= :start AND row.${column} < :end`, {
        start: window.start,
        end: window.end,
      })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany<DailyRow>();

    return fillDays(rows, window);
  }

  private async countActiveUsers({ start, end }: Window): Promise<number> {
    const row = await this.sessionRepo
      .createQueryBuilder('session')
      .select('COUNT(DISTINCT session.user_id)', 'count')
      .where('session.last_seen_at >= :start AND session.last_seen_at < :end', { start, end })
      .getRawOne<{ count: string }>();
    return Number(row?.count ?? 0);
  }

  private async countRows<T extends object>(
    repo: Repository<T>,
    column: string,
    { start, end }: Window,
  ): Promise<number> {
    return repo
      .createQueryBuilder('row')
      .where(`row.${column} >= :start AND row.${column} < :end`, { start, end })
      .getCount();
  }

  private async activeUsersPerDay(window: Window): Promise<DailyCount[]> {
    const rows = await this.sessionRepo
      .createQueryBuilder('session')
      .select("to_char(session.last_seen_at, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(DISTINCT session.user_id)', 'count')
      .where('session.last_seen_at >= :start AND session.last_seen_at < :end', {
        start: window.start,
        end: window.end,
      })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany<DailyRow>();

    return fillDays(rows, window);
  }

  private async deviceBreakdown({ start, end }: Window): Promise<LabelledCount[]> {
    const rows = await this.sessionRepo
      .createQueryBuilder('session')
      .select('session.device_type', 'label')
      .addSelect('COUNT(*)', 'count')
      .where('session.created_at >= :start AND session.created_at < :end', { start, end })
      .groupBy('session.device_type')
      .orderBy('count', 'DESC')
      .getRawMany<LabelledRow>();

    return rows.map(({ label, count }) => ({
      label: label ?? UNKNOWN_DEVICE,
      count: Number(count),
    }));
  }
}

function fillDays(rows: DailyRow[], { start, days }: Window): DailyCount[] {
  const counts = new Map(rows.map(({ date, count }) => [date, Number(count)]));

  return Array.from({ length: days }, (_, offset) => {
    const date = isoDate(new Date(start.getTime() + offset * MS_PER_DAY));
    return { date, count: counts.get(date) ?? 0 };
  });
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseDate(value: string | undefined): Date | null {
  if (!value) {
    return null;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfToday(): Date {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function resolveWindow({ from, to }: OverviewArgs): Window {
  const lastDay = parseDate(to) ?? startOfToday();
  const firstDay =
    parseDate(from) ?? new Date(lastDay.getTime() - (DEFAULT_RANGE_DAYS - 1) * MS_PER_DAY);

  const [start, inclusiveEnd] = firstDay <= lastDay ? [firstDay, lastDay] : [lastDay, firstDay];

  const requestedDays = Math.round((inclusiveEnd.getTime() - start.getTime()) / MS_PER_DAY) + 1;
  const days = Math.min(requestedDays, MAX_RANGE_DAYS);

  return { start, end: new Date(start.getTime() + days * MS_PER_DAY), days };
}

function precedingWindow({ start, days }: Window): Window {
  const end = start;
  return { start: new Date(start.getTime() - days * MS_PER_DAY), end, days };
}
