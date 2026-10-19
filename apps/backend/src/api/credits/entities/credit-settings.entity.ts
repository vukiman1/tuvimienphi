import { Check, Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { CREDIT_SETTINGS_ROW_ID } from '../credits.constants';

@Entity('credit_settings')
@Check('CHK_credit_settings_single_row', '"id" = 1')
@Check('CHK_credit_settings_daily_chapter_quota_non_negative', '"daily_chapter_quota" >= 0')
export class CreditSettingsEntity {
  @PrimaryColumn({
    type: 'smallint',
    default: CREDIT_SETTINGS_ROW_ID,
    primaryKeyConstraintName: 'PK_credit_settings_id',
  })
  id!: number;

  @Column({ name: 'daily_chapter_quota', type: 'integer' })
  dailyChapterQuota!: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
