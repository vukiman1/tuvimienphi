import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  birthHourAt,
  birthHourIndex,
  birthKey,
  type BirthInput,
  type LaSoHistoryEntry,
  type SyncLaSoHistoryEntry,
} from '@org/shared-contracts';
import { In, Repository } from 'typeorm';
import { LaSoHistoryEntity } from './entities/la-so-history.entity';

/** Past this, the oldest entries are dropped. Nobody scrolls back further, and the list is fetched
 * whole rather than paginated. */
export const HISTORY_LIMIT = 200;

@Injectable()
export class LaSoHistoryService {
  constructor(
    @InjectRepository(LaSoHistoryEntity)
    private readonly repo: Repository<LaSoHistoryEntity>,
  ) {}

  async list(userId: string): Promise<LaSoHistoryEntry[]> {
    const rows = await this.findRows(userId);
    return rows.map(toEntry);
  }

  async record(userId: string, input: BirthInput): Promise<LaSoHistoryEntry> {
    const row = toRow(userId, input, new Date());
    await this.repo.upsert(row, ['userId', 'birthKey']);
    await this.trim(userId);
    return toEntry(row);
  }

  async sync(userId: string, entries: SyncLaSoHistoryEntry[]): Promise<LaSoHistoryEntry[]> {
    if (entries.length > 0) {
      const now = new Date();
      const rows = entries.map((entry) => toRow(userId, entry, viewedAt(entry.viewedAt, now)));
      await this.repo.upsert(rows, ['userId', 'birthKey']);
      await this.trim(userId);
    }
    return this.list(userId);
  }

  /** Hard delete on purpose: the row carries no history of its own, and a soft-deleted one would
   * keep occupying the unique key, so casting the same chart again would fail. */
  async remove(userId: string, key: string): Promise<void> {
    await this.repo.delete({ userId, birthKey: key });
  }

  private findRows(userId: string): Promise<LaSoHistoryEntity[]> {
    return this.repo.find({ where: { userId }, order: { viewedAt: 'DESC' } });
  }

  private async trim(userId: string): Promise<void> {
    const rows = await this.findRows(userId);
    const excess = rows.slice(HISTORY_LIMIT);
    if (excess.length === 0) {
      return;
    }
    await this.repo.delete({ userId, birthKey: In(excess.map((row) => row.birthKey)) });
  }
}

/** A client clock running ahead would otherwise pin an entry to the top of the list forever. */
function viewedAt(reported: string, now: Date): Date {
  const parsed = new Date(reported);
  return parsed > now ? now : parsed;
}

function toRow(userId: string, input: BirthInput, seenAt: Date): LaSoHistoryEntity {
  return {
    userId,
    birthKey: birthKey(input),
    fullName: input.fullName ?? null,
    day: input.day,
    month: input.month,
    year: input.year,
    calendar: input.calendar,
    hourIndex: birthHourIndex(input.hour),
    gender: input.gender,
    viewedAt: seenAt,
  } as LaSoHistoryEntity;
}

function toEntry(row: LaSoHistoryEntity): LaSoHistoryEntry {
  const hour = birthHourAt(row.hourIndex);
  if (!hour) {
    throw new Error(
      `la_so_history row ${row.birthKey} holds an unknown hour index ${row.hourIndex}`,
    );
  }

  return {
    birthKey: row.birthKey,
    ...(row.fullName ? { fullName: row.fullName } : {}),
    day: row.day,
    month: row.month,
    year: row.year,
    calendar: row.calendar,
    hour: hour.key,
    gender: row.gender,
    viewedAt: row.viewedAt.toISOString(),
  };
}
