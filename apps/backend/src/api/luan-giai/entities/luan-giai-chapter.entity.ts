import { BaseEntity } from '@org/backend-base';
import type { LuanGiaiArticle } from '@org/shared-contracts';
import { Column, Entity, Unique } from 'typeorm';

@Entity('luan_giai_chapter')
@Unique('UQ_luan_giai_chapter_birth_key_order', ['birthKey', 'chapterOrder'])
export class LuanGiaiChapterEntity extends BaseEntity {
  @Column({ name: 'birth_key', type: 'varchar', length: 40 })
  birthKey!: string;

  @Column({ name: 'chapter_order', type: 'varchar', length: 2 })
  chapterOrder!: string;

  @Column({ name: 'article', type: 'jsonb' })
  article!: LuanGiaiArticle;

  @Column({ name: 'model', type: 'varchar', length: 60 })
  model!: string;

  @Column({ name: 'attempts', type: 'smallint' })
  attempts!: number;
}
