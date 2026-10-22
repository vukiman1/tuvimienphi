import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CREDIT_SETTINGS_ROW_ID } from './credits.constants';
import { CreditSettingsMissingError } from './credits.errors';
import { CreditSettingsEntity } from './entities/credit-settings.entity';

@Injectable()
export class CreditSettingsService {
  constructor(
    @InjectRepository(CreditSettingsEntity)
    private readonly repo: Repository<CreditSettingsEntity>,
  ) {}

  async dailyChapterQuota(): Promise<number> {
    const row = await this.repo.findOneBy({ id: CREDIT_SETTINGS_ROW_ID });
    if (!row) throw new CreditSettingsMissingError();
    return row.dailyChapterQuota;
  }

  async setDailyChapterQuota(dailyChapterQuota: number): Promise<void> {
    const result = await this.repo.update({ id: CREDIT_SETTINGS_ROW_ID }, { dailyChapterQuota });
    if (!result.affected) throw new CreditSettingsMissingError();
  }
}
