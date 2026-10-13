import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('van_han_published_year')
export class VanHanPublishedYearEntity {
  @PrimaryColumn({ type: 'int', name: 'year' })
  year!: number;

  @Column({ type: 'timestamptz', name: 'published_at', default: () => 'now()' })
  publishedAt!: Date;
}
