import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPostEntity } from '../entities/blog-post.entity';
import { CreatePostInput, UpdatePostInput } from '../inputs/blog-post.input';
import { BlogPost } from '../models/blog-post.model';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPostEntity) private readonly repo: Repository<BlogPostEntity>,
  ) {}

  async findAll(): Promise<BlogPost[]> {
    const posts = await this.repo.find({ order: { updatedAt: 'DESC' } });
    return posts.map((post) => this.toModel(post));
  }

  async create(input: CreatePostInput): Promise<BlogPost> {
    const entity = this.repo.create({
      title: input.title,
      slug: input.slug,
      category: input.category,
      author: input.author,
      status: input.status,
      views: input.views ?? 0,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
    });
    const saved = await this.repo.save(entity);
    return this.toModel(saved);
  }

  async update(id: string, input: UpdatePostInput): Promise<BlogPost> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException('Blog post not found');
    }
    if (input.title !== undefined) entity.title = input.title;
    if (input.slug !== undefined) entity.slug = input.slug;
    if (input.category !== undefined) entity.category = input.category;
    if (input.author !== undefined) entity.author = input.author;
    if (input.status !== undefined) entity.status = input.status;
    if (input.views !== undefined) entity.views = input.views;
    if (input.publishedAt !== undefined) {
      entity.publishedAt = input.publishedAt ? new Date(input.publishedAt) : null;
    }
    const saved = await this.repo.save(entity);
    return this.toModel(saved);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  private toModel(post: BlogPostEntity): BlogPost {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      category: post.category,
      author: post.author,
      status: post.status,
      views: post.views,
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
    };
  }
}
