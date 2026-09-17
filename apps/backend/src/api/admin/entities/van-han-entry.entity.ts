import { BaseEntity } from '@org/backend-base';
import { Column, Entity } from 'typeorm';

@Entity('van_han_entries')
export class VanHanEntryEntity extends BaseEntity {
  @Column({ type: 'int', name: 'year' })
  year!: number;

  @Column({ type: 'int', name: 'age' })
  age!: number;

  @Column({ type: 'varchar', length: 100, name: 'star' })
  star!: string;

  @Column({ type: 'varchar', length: 10, name: 'rating' })
  rating!: string;

  @Column({ type: 'text', name: 'summary' })
  summary!: string;

  @Column({ type: 'boolean', name: 'published', default: true })
  published!: boolean;
}
