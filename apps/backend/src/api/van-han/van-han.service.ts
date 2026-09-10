import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VanHanEntity, type VanHanAgeReading, type VanHanAspect } from './entities/van-han.entity';

/** Một bản vận hạn do người soạn nhập vào, khoá theo cặp con giáp và năm. */
export interface VanHanInput {
  readonly zodiac: string;
  readonly zodiacOrder: number;
  readonly year: number;
  readonly title: string;
  readonly bornYears: readonly number[];
  readonly luuNien: string;
  readonly luanGiai: readonly VanHanAspect[];
  readonly tungTuoi: readonly VanHanAgeReading[];
  readonly sourceUrl?: string;
}

@Injectable()
export class VanHanService {
  constructor(@InjectRepository(VanHanEntity) private readonly repo: Repository<VanHanEntity>) {}

  /** Ghi đè bản của cùng con giáp trong cùng năm, để soạn lại không sinh ra bản trùng. */
  async save(input: VanHanInput): Promise<void> {
    await this.repo.upsert(
      {
        ...input,
        bornYears: [...input.bornYears],
        luanGiai: [...input.luanGiai],
        tungTuoi: [...input.tungTuoi],
        sourceUrl: input.sourceUrl ?? '',
      },
      ['zodiacOrder', 'year'],
    );
  }

  findByYear(year: number): Promise<VanHanEntity[]> {
    return this.repo.find({ where: { year }, order: { zodiacOrder: 'ASC' } });
  }
}
