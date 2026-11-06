import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('funnel_daily')
export class FunnelDailyEntity {
  @PrimaryColumn({ type: 'date', primaryKeyConstraintName: 'PK_funnel_daily_day' })
  day!: string;

  @Column({ name: 'chart_casts', type: 'integer', default: 0 })
  chartCasts!: number;

  @Column({ name: 'chapter_unlocks', type: 'integer', default: 0 })
  chapterUnlocks!: number;

  @Column({ name: 'paid_chapter_unlocks', type: 'integer', default: 0 })
  paidChapterUnlocks!: number;
}
