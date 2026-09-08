import { BaseEntity } from '@org/backend-base';
import type { LuanGiaiArticle } from '@org/shared-contracts';
import { Column, Entity, Unique } from 'typeorm';

/**
 * Một chương đã sinh xong. Khoá là `birthKey` chứ không phải người dùng: cùng ngày giờ sinh và giới
 * tính thì cùng một lá số, nên cùng một bài — người thứ hai đọc lại bài đã có, không tốn lượt gọi.
 *
 * Không lưu lá số kèm theo, cùng lý do như `la_so_history`: lá số suy ra được từ ngày sinh, lưu lại
 * là đóng băng dòng cũ trước mọi lần sửa luật an sao sau này.
 */
@Entity('luan_giai_chapter')
@Unique('UQ_luan_giai_chapter_birth_key_order', ['birthKey', 'chapterOrder'])
export class LuanGiaiChapterEntity extends BaseEntity {
  @Column({ name: 'birth_key', type: 'varchar', length: 40 })
  birthKey!: string;

  @Column({ name: 'chapter_order', type: 'varchar', length: 2 })
  chapterOrder!: string;

  @Column({ name: 'article', type: 'jsonb' })
  article!: LuanGiaiArticle;

  /** Model nào viết ra bài; danh sách có fallback nên không đoán trước được. */
  @Column({ name: 'model', type: 'varchar', length: 60 })
  model!: string;

  /** Số lần phải sinh lại mới qua bộ kiểm. Theo dõi con số này là cách sớm nhất thấy prompt xuống cấp. */
  @Column({ name: 'attempts', type: 'smallint' })
  attempts!: number;
}
