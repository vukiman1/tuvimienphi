import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VAN_HAN_ASPECTS } from '@org/shared-contracts';
import { Repository } from 'typeorm';
import { VanHanPublishedYearEntity } from './entities/van-han-published-year.entity';
import { VanHanEntity, type VanHanAgeReading, type VanHanAspect } from './entities/van-han.entity';
import { isComplete } from './van-han-completeness';
import {
  ZODIAC_COUNT,
  birthYearFacts,
  yearCanChi,
  zodiacName,
  zodiacOrderOfYear,
  zodiacOrders,
} from './van-han-zodiac';

export interface VanHanAgeInput {
  readonly birthYear: number;
  readonly male: string;
  readonly female: string;
}

export interface VanHanEntryInput {
  readonly year: number;
  readonly zodiacOrder: number;
  readonly luuNien: string;
  readonly luanGiai: readonly VanHanAspect[];
  readonly tungTuoi: readonly VanHanAgeInput[];
  readonly sourceUrl?: string | null;
}

export interface VanHanYear {
  readonly year: number;
  readonly publishedAt: Date | null;
  readonly entries: VanHanEntity[];
}

export interface VanHanYearSummary {
  readonly year: number;
  readonly publishedAt: Date | null;
  readonly entryCount: number;
}

export interface VanHanCurrentYear {
  readonly year: number;
  readonly entries: VanHanEntity[];
}

@Injectable()
export class VanHanService {
  constructor(
    @InjectRepository(VanHanEntity)
    private readonly entries: Repository<VanHanEntity>,
    @InjectRepository(VanHanPublishedYearEntity)
    private readonly publishedYears: Repository<VanHanPublishedYearEntity>,
  ) {}

  async findCurrent(): Promise<VanHanCurrentYear | null> {
    const [latest] = await this.publishedYears.find({ order: { year: 'DESC' }, take: 1 });
    if (!latest) {
      return null;
    }
    return { year: latest.year, entries: await this.findEntries(latest.year) };
  }

  async findPublishedByYear(year: number): Promise<VanHanEntity[]> {
    const published = await this.publishedYears.findOneBy({ year });
    return published ? this.findEntries(year) : [];
  }

  async listYears(): Promise<VanHanYearSummary[]> {
    const [rows, published] = await Promise.all([
      this.entries.find({ select: { year: true } }),
      this.publishedYears.find(),
    ]);
    const publishedAtByYear = new Map(published.map((row) => [row.year, row.publishedAt]));
    const years = new Set([...rows.map((row) => row.year), ...publishedAtByYear.keys()]);

    return [...years]
      .sort((a, b) => b - a)
      .map((year) => ({
        year,
        publishedAt: publishedAtByYear.get(year) ?? null,
        entryCount: rows.filter((row) => row.year === year).length,
      }));
  }

  async findYear(year: number): Promise<VanHanYear> {
    const [published, entries] = await Promise.all([
      this.publishedYears.findOneBy({ year }),
      this.findEntries(year),
    ]);
    return { year, publishedAt: published?.publishedAt ?? null, entries };
  }

  findEntry(year: number, zodiacOrder: number): Promise<VanHanEntity | null> {
    return this.entries.findOneBy({ year, zodiacOrder });
  }

  async saveEntry(input: VanHanEntryInput): Promise<VanHanEntity> {
    const content = toContent(input);
    const published = await this.publishedYears.findOneBy({ year: input.year });
    if (published && !isComplete(content)) {
      throw new BadRequestException(
        `year ${input.year} is published, so an entry cannot be saved with a part left empty`,
      );
    }

    await this.entries.upsert(
      {
        year: input.year,
        zodiacOrder: input.zodiacOrder,
        zodiac: zodiacName(input.zodiacOrder),
        title: titleOf(input),
        bornYears: content.tungTuoi.map((age) => age.birthYear),
        sourceUrl: input.sourceUrl?.trim() ?? '',
        updatedAt: new Date(),
        ...content,
      },
      ['zodiacOrder', 'year'],
    );
    return this.entries.findOneByOrFail({ year: input.year, zodiacOrder: input.zodiacOrder });
  }

  async publishYear(year: number): Promise<VanHanYear> {
    const entries = await this.findEntries(year);
    const incomplete = zodiacOrders().filter(
      (zodiacOrder) =>
        !isComplete(entries.find((entry) => entry.zodiacOrder === zodiacOrder) ?? null),
    );
    if (incomplete.length > 0) {
      throw new BadRequestException(
        `year ${year} cannot be published: ${incomplete.length} of ${ZODIAC_COUNT} zodiac entries are incomplete`,
      );
    }

    const published = await this.publishedYears.findOneBy({ year });
    if (!published) {
      await this.publishedYears.insert({ year, publishedAt: new Date() });
    }
    return this.findYear(year);
  }

  async unpublishYear(year: number): Promise<VanHanYear> {
    await this.publishedYears.delete({ year });
    return this.findYear(year);
  }

  private findEntries(year: number): Promise<VanHanEntity[]> {
    return this.entries.find({ where: { year }, order: { zodiacOrder: 'ASC' } });
  }
}

interface VanHanEntryContent {
  luuNien: string;
  luanGiai: VanHanAspect[];
  tungTuoi: VanHanAgeReading[];
}

function toContent(input: VanHanEntryInput): VanHanEntryContent {
  assertAspects(input.luanGiai);
  assertBirthYears(input);

  return {
    luuNien: input.luuNien.trim(),
    luanGiai: VAN_HAN_ASPECTS.flatMap((label) =>
      input.luanGiai
        .filter((aspect) => aspect.aspect === label)
        .map((aspect) => ({ aspect: label, rating: aspect.rating, body: aspect.body.trim() })),
    ),
    tungTuoi: [...input.tungTuoi]
      .sort((a, b) => a.birthYear - b.birthYear)
      .map(({ birthYear, male, female }) => {
        const { canChi, menh } = birthYearFacts(birthYear, input.year);
        return { birthYear, canChi, menh, male: male.trim(), female: female.trim() };
      }),
  };
}

function assertAspects(aspects: readonly VanHanAspect[]): void {
  const labels = aspects.map((aspect) => aspect.aspect);
  const unknown = labels.find((label) => !isAspectLabel(label));
  if (unknown !== undefined) {
    throw new BadRequestException(`luanGiai has an aspect the site cannot show: "${unknown}"`);
  }
  if (new Set(labels).size !== labels.length) {
    throw new BadRequestException('luanGiai must not repeat an aspect');
  }
}

function assertBirthYears({ year, zodiacOrder, tungTuoi }: VanHanEntryInput): void {
  const birthYears = tungTuoi.map((age) => age.birthYear);
  const stray = birthYears.find(
    (birthYear) => birthYear > year || zodiacOrderOfYear(birthYear) !== zodiacOrder,
  );
  if (stray !== undefined) {
    throw new BadRequestException(
      `tungTuoi birth year ${stray} is not a ${zodiacName(zodiacOrder)} year up to ${year}`,
    );
  }
  if (new Set(birthYears).size !== birthYears.length) {
    throw new BadRequestException('tungTuoi must not repeat a birth year');
  }
}

function isAspectLabel(label: string): boolean {
  return (VAN_HAN_ASPECTS as readonly string[]).includes(label);
}

function titleOf({ year, zodiacOrder }: VanHanEntryInput): string {
  return `Vận hạn tuổi ${zodiacName(zodiacOrder)} năm ${yearCanChi(year)} ${year}`;
}
