import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VanHanEntity } from './entities/van-han.entity';
import { type VanHanContent, type ZodiacSign, vanHanUrl } from './van-han.constants';

@Injectable()
export class VanHanService {
  constructor(@InjectRepository(VanHanEntity) private readonly repo: Repository<VanHanEntity>) {}

  async save(zodiac: ZodiacSign, content: VanHanContent): Promise<void> {
    await this.repo.upsert(
      {
        zodiac: zodiac.name,
        zodiacOrder: zodiac.order,
        year: content.year,
        title: content.title,
        bornYears: [...content.bornYears],
        luuNien: content.luuNien,
        luanGiai: [...content.luanGiai],
        tungTuoi: [...content.tungTuoi],
        sourceUrl: vanHanUrl(zodiac.order, zodiac.slug),
      },
      ['zodiacOrder', 'year'],
    );
  }

  findByYear(year: number): Promise<VanHanEntity[]> {
    return this.repo.find({ where: { year }, order: { zodiacOrder: 'ASC' } });
  }
}
