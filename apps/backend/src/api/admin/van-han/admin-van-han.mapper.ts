import { VanHanEntity } from '../../van-han/entities/van-han.entity';
import { missingParts } from '../../van-han/van-han-completeness';
import {
  birthYearOptions,
  yearCanChi,
  zodiacName,
  zodiacOrders,
} from '../../van-han/van-han-zodiac';
import type { VanHanYear, VanHanYearSummary } from '../../van-han/van-han.service';
import type {
  AdminVanHanEditor,
  AdminVanHanEntry,
  AdminVanHanSlot,
  AdminVanHanYear,
  AdminVanHanYearSummary,
} from './admin-van-han.type';

export function toAdminYearSummary(summary: VanHanYearSummary): AdminVanHanYearSummary {
  return {
    year: summary.year,
    publishedAt: toIsoString(summary.publishedAt),
    entryCount: summary.entryCount,
  };
}

export function toAdminYear({ year, publishedAt, entries }: VanHanYear): AdminVanHanYear {
  return {
    year,
    canChi: yearCanChi(year),
    publishedAt: toIsoString(publishedAt),
    slots: zodiacOrders().map((zodiacOrder) =>
      toAdminSlot(year, zodiacOrder, entryOf(entries, zodiacOrder)),
    ),
  };
}

export function toAdminEditor(
  { year, publishedAt, entries }: VanHanYear,
  zodiacOrder: number,
  previousEntry: VanHanEntity | null,
): AdminVanHanEditor {
  return {
    year,
    canChi: yearCanChi(year),
    publishedAt: toIsoString(publishedAt),
    slot: toAdminSlot(year, zodiacOrder, entryOf(entries, zodiacOrder)),
    previousEntry: previousEntry ? toAdminEntry(previousEntry) : null,
    birthYearOptions: birthYearOptions(zodiacOrder, year),
  };
}

export function toAdminSlot(
  year: number,
  zodiacOrder: number,
  entry: VanHanEntity | null,
): AdminVanHanSlot {
  return {
    year,
    zodiacOrder,
    zodiac: zodiacName(zodiacOrder),
    entry: entry ? toAdminEntry(entry) : null,
    missing: missingParts(entry),
  };
}

function toAdminEntry(entry: VanHanEntity): AdminVanHanEntry {
  return {
    id: entry.id,
    title: entry.title,
    bornYears: entry.bornYears,
    luuNien: entry.luuNien,
    luanGiai: entry.luanGiai.map((aspect) => ({ ...aspect })),
    tungTuoi: entry.tungTuoi.map((age) => ({ ...age })),
    sourceUrl: entry.sourceUrl,
    updatedAt: entry.updatedAt.toISOString(),
  };
}

function entryOf(entries: readonly VanHanEntity[], zodiacOrder: number): VanHanEntity | null {
  return entries.find((entry) => entry.zodiacOrder === zodiacOrder) ?? null;
}

function toIsoString(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}
