import { BaseEntity } from '@org/backend-base';
import { Column, Entity, Unique } from 'typeorm';
import { type VanHanAgeReading, type VanHanAspect } from '../van-han.constants';

@Entity('van_han')
@Unique('UQ_van_han_order_year', ['zodiacOrder', 'year'])
export class VanHanEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 20, name: 'zodiac' })
  zodiac!: string;

  @Column({ type: 'int', name: 'zodiac_order' })
  zodiacOrder!: number;

  @Column({ type: 'int', name: 'year' })
  year!: number;

  @Column({ type: 'varchar', length: 255, name: 'title' })
  title!: string;

  @Column({ type: 'jsonb', name: 'born_years', default: () => "'[]'" })
  bornYears!: number[];

  @Column({ type: 'text', name: 'luu_nien' })
  luuNien!: string;

  @Column({ type: 'jsonb', name: 'luan_giai', default: () => "'[]'" })
  luanGiai!: VanHanAspect[];

  @Column({ type: 'jsonb', name: 'tung_tuoi', default: () => "'[]'" })
  tungTuoi!: VanHanAgeReading[];

  @Column({ type: 'varchar', length: 500, name: 'source_url' })
  sourceUrl!: string;
}
