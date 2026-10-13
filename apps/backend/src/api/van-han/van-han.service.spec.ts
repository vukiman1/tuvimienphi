import { BadRequestException } from '@nestjs/common';
import { VAN_HAN_ASPECTS } from '@org/shared-contracts';
import { Repository } from 'typeorm';
import { VanHanPublishedYearEntity } from './entities/van-han-published-year.entity';
import { VanHanEntity } from './entities/van-han.entity';
import { birthYearOptions, zodiacOrders } from './van-han-zodiac';
import { VanHanService, type VanHanEntryInput } from './van-han.service';

const NGO = 7;

interface SlotKey {
  year?: number;
  zodiacOrder?: number;
}

class FakeEntries {
  readonly rows: VanHanEntity[] = [];

  async find(options: { where?: SlotKey } = {}): Promise<VanHanEntity[]> {
    return this.rows
      .filter((row) => matches(row, options.where ?? {}))
      .sort((a, b) => a.zodiacOrder - b.zodiacOrder);
  }

  async findOneBy(where: SlotKey): Promise<VanHanEntity | null> {
    return this.rows.find((row) => matches(row, where)) ?? null;
  }

  async findOneByOrFail(where: SlotKey): Promise<VanHanEntity> {
    const row = await this.findOneBy(where);
    if (!row) {
      throw new Error('no such entry');
    }
    return row;
  }

  async upsert(row: VanHanEntity): Promise<void> {
    const existing = this.rows.find((candidate) => matches(candidate, row));
    if (existing) {
      Object.assign(existing, row);
      return;
    }
    this.rows.push({ ...row, id: `entry-${this.rows.length + 1}` } as VanHanEntity);
  }
}

class FakePublishedYears {
  readonly rows: VanHanPublishedYearEntity[] = [];

  async find(options: { take?: number } = {}): Promise<VanHanPublishedYearEntity[]> {
    const newestFirst = [...this.rows].sort((a, b) => b.year - a.year);
    return options.take ? newestFirst.slice(0, options.take) : newestFirst;
  }

  async findOneBy({ year }: { year: number }): Promise<VanHanPublishedYearEntity | null> {
    return this.rows.find((row) => row.year === year) ?? null;
  }

  async insert(row: VanHanPublishedYearEntity): Promise<void> {
    this.rows.push(row);
  }

  async delete({ year }: { year: number }): Promise<void> {
    const index = this.rows.findIndex((row) => row.year === year);
    if (index >= 0) {
      this.rows.splice(index, 1);
    }
  }
}

function matches(row: SlotKey, where: SlotKey): boolean {
  return (
    (where.year === undefined || row.year === where.year) &&
    (where.zodiacOrder === undefined || row.zodiacOrder === where.zodiacOrder)
  );
}

function setup() {
  const entries = new FakeEntries();
  const publishedYears = new FakePublishedYears();
  const service = new VanHanService(
    entries as unknown as Repository<VanHanEntity>,
    publishedYears as unknown as Repository<VanHanPublishedYearEntity>,
  );
  return { service, entries, publishedYears };
}

function completeInput(year: number, zodiacOrder: number): VanHanEntryInput {
  const [oldest, , newest] = birthYearOptions(zodiacOrder, year).slice(-3);
  return {
    year,
    zodiacOrder,
    luuNien: 'Năm nay vận trình nhiều chuyển biến.',
    luanGiai: VAN_HAN_ASPECTS.map((aspect) => ({ aspect, rating: 3, body: 'Giữ ổn định.' })),
    tungTuoi: [newest, oldest].map(({ birthYear }) => ({
      birthYear,
      male: 'Nam nên thận trọng.',
      female: 'Nữ gặp quý nhân.',
    })),
  };
}

async function writeWholeYear(service: VanHanService, year: number): Promise<void> {
  for (const zodiacOrder of zodiacOrders()) {
    await service.saveEntry(completeInput(year, zodiacOrder));
  }
}

describe('VanHanService.saveEntry', () => {
  it('fills in what follows from the zodiac and the birth years, so nobody types it', async () => {
    const { service } = setup();

    const saved = await service.saveEntry({
      ...completeInput(2026, NGO),
      tungTuoi: [
        { birthYear: 1966, male: ' Nam 61 tuổi gặp Kế Đô. ', female: 'Nữ gặp Thái Dương.' },
      ],
    });

    expect(saved.zodiac).toBe('Ngọ');
    expect(saved.title).toBe('Vận hạn tuổi Ngọ năm Bính Ngọ 2026');
    expect(saved.bornYears).toEqual([1966]);
    expect(saved.tungTuoi).toEqual([
      {
        birthYear: 1966,
        canChi: 'Bính Ngọ',
        menh: 'Thiên Hà Thủy',
        male: 'Nam 61 tuổi gặp Kế Đô.',
        female: 'Nữ gặp Thái Dương.',
      },
    ]);
  });

  it('stores birth years oldest first and aspects in the order the site lays them out', async () => {
    const { service } = setup();
    const input = completeInput(2026, NGO);

    const saved = await service.saveEntry({ ...input, luanGiai: [...input.luanGiai].reverse() });

    expect(saved.bornYears).toEqual([...saved.bornYears].sort((a, b) => a - b));
    expect(saved.luanGiai.map((aspect) => aspect.aspect)).toEqual([...VAN_HAN_ASPECTS]);
  });

  it('writes over the same zodiac and year instead of keeping two versions', async () => {
    const { service, entries } = setup();

    await service.saveEntry(completeInput(2026, NGO));
    const saved = await service.saveEntry({ ...completeInput(2026, NGO), luuNien: 'Bản mới.' });

    expect(entries.rows).toHaveLength(1);
    expect(saved.luuNien).toBe('Bản mới.');
  });

  it('keeps work in progress while the year is still a draft', async () => {
    const { service } = setup();

    const saved = await service.saveEntry({ ...completeInput(2027, NGO), luanGiai: [] });

    expect(saved.luanGiai).toEqual([]);
  });

  it('refuses to leave a hole in a year visitors are already reading', async () => {
    const { service } = setup();
    await writeWholeYear(service, 2026);
    await service.publishYear(2026);

    await expect(
      service.saveEntry({ ...completeInput(2026, NGO), luuNien: '' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('still takes a complete rewrite of a published year', async () => {
    const { service } = setup();
    await writeWholeYear(service, 2026);
    await service.publishYear(2026);

    const saved = await service.saveEntry({ ...completeInput(2026, NGO), luuNien: 'Bản đã sửa.' });

    expect(saved.luuNien).toBe('Bản đã sửa.');
  });

  it('refuses a birth year that belongs to another zodiac', async () => {
    const { service } = setup();
    const input = completeInput(2026, NGO);

    await expect(
      service.saveEntry({ ...input, tungTuoi: [{ ...input.tungTuoi[0], birthYear: 1967 }] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuses a birth year later than the year being read', async () => {
    const { service } = setup();
    const input = completeInput(2026, NGO);

    await expect(
      service.saveEntry({ ...input, tungTuoi: [{ ...input.tungTuoi[0], birthYear: 2038 }] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuses an aspect spelled differently from the ones the site has a theme for', async () => {
    const { service } = setup();
    const input = completeInput(2026, NGO);

    await expect(
      service.saveEntry({
        ...input,
        luanGiai: [{ aspect: 'Sức Khỏe', rating: 3, body: 'Giữ ổn định.' }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuses the same aspect or the same birth year written twice', async () => {
    const { service } = setup();
    const input = completeInput(2026, NGO);

    await expect(
      service.saveEntry({ ...input, luanGiai: [input.luanGiai[0], input.luanGiai[0]] }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.saveEntry({ ...input, tungTuoi: [input.tungTuoi[0], input.tungTuoi[0]] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('VanHanService.publishYear', () => {
  it('refuses while a zodiac has not been written', async () => {
    const { service } = setup();
    for (const zodiacOrder of zodiacOrders().slice(0, 11)) {
      await service.saveEntry(completeInput(2027, zodiacOrder));
    }

    await expect(service.publishYear(2027)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuses while a zodiac is only half written', async () => {
    const { service } = setup();
    await writeWholeYear(service, 2027);
    await service.saveEntry({ ...completeInput(2027, NGO), tungTuoi: [] });

    await expect(service.publishYear(2027)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('publishes once all twelve are complete', async () => {
    const { service } = setup();
    await writeWholeYear(service, 2027);

    const year = await service.publishYear(2027);

    expect(year.publishedAt).toBeInstanceOf(Date);
    expect(year.entries).toHaveLength(12);
  });

  it('keeps the first publication time when published again', async () => {
    const { service, publishedYears } = setup();
    await writeWholeYear(service, 2027);
    const first = await service.publishYear(2027);

    const second = await service.publishYear(2027);

    expect(publishedYears.rows).toHaveLength(1);
    expect(second.publishedAt).toBe(first.publishedAt);
  });
});

describe('VanHanService, as the public site sees it', () => {
  it('has nothing to show before any year is published', async () => {
    const { service } = setup();
    await writeWholeYear(service, 2026);

    expect(await service.findCurrent()).toBeNull();
    expect(await service.findPublishedByYear(2026)).toEqual([]);
  });

  it('shows the newest published year and ignores a newer draft', async () => {
    const { service } = setup();
    await writeWholeYear(service, 2026);
    await service.publishYear(2026);
    await service.saveEntry(completeInput(2027, NGO));

    const current = await service.findCurrent();

    expect(current?.year).toBe(2026);
    expect(current?.entries).toHaveLength(12);
    expect(await service.findPublishedByYear(2027)).toEqual([]);
  });

  it('moves to the new year the moment it is published', async () => {
    const { service } = setup();
    await writeWholeYear(service, 2026);
    await service.publishYear(2026);
    await writeWholeYear(service, 2027);

    await service.publishYear(2027);

    expect((await service.findCurrent())?.year).toBe(2027);
  });

  it('falls back to the previous year when the newest is withdrawn', async () => {
    const { service } = setup();
    await writeWholeYear(service, 2026);
    await service.publishYear(2026);
    await writeWholeYear(service, 2027);
    await service.publishYear(2027);

    const withdrawn = await service.unpublishYear(2027);

    expect(withdrawn.publishedAt).toBeNull();
    expect(withdrawn.entries).toHaveLength(12);
    expect((await service.findCurrent())?.year).toBe(2026);
  });
});

describe('VanHanService.listYears', () => {
  it('lists every year that has content, newest first, with how far along it is', async () => {
    const { service } = setup();
    await writeWholeYear(service, 2026);
    await service.publishYear(2026);
    await service.saveEntry(completeInput(2027, NGO));

    const years = await service.listYears();

    expect(years.map(({ year, entryCount }) => ({ year, entryCount }))).toEqual([
      { year: 2027, entryCount: 1 },
      { year: 2026, entryCount: 12 },
    ]);
    expect(years[0].publishedAt).toBeNull();
    expect(years[1].publishedAt).toBeInstanceOf(Date);
  });
});
