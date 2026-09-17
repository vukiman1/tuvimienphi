import { BaseEntity } from '@org/backend-base';
import { Column, Entity, Unique } from 'typeorm';

@Entity('blog_posts')
@Unique('UQ_blog_posts_slug', ['slug'])
export class BlogPostEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, name: 'title' })
  title!: string;

  @Column({ type: 'varchar', length: 255, name: 'slug' })
  slug!: string;

  @Column({ type: 'varchar', length: 100, name: 'category' })
  category!: string;

  @Column({ type: 'varchar', length: 255, name: 'author' })
  author!: string;

  @Column({ type: 'varchar', length: 20, name: 'status' })
  status!: string;

  @Column({ type: 'int', name: 'views', default: 0 })
  views!: number;

  @Column({ type: 'timestamp', name: 'published_at', nullable: true })
  publishedAt!: Date | null;
}
