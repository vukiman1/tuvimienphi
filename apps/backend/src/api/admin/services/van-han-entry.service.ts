import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VanHanEntryEntity } from '../entities/van-han-entry.entity';
import { CreateVanHanEntryInput, UpdateVanHanEntryInput } from '../inputs/van-han-entry.input';
import { VanHanEntry } from '../models/van-han-entry.model';

@Injectable()
export class VanHanEntryService {
  constructor(
    @InjectRepository(VanHanEntryEntity)
    private readonly repo: Repository<VanHanEntryEntity>,
  ) {}

  async findAll(): Promise<VanHanEntry[]> {
    const entries = await this.repo.find({ order: { updatedAt: 'DESC' } });
    return entries.map((entry) => this.toModel(entry));
  }

  async create(input: CreateVanHanEntryInput): Promise<VanHanEntry> {
    const entity = this.repo.create({
      year: input.year,
      age: input.age,
      star: input.star,
      rating: input.rating,
      summary: input.summary,
      published: input.published ?? true,
    });
    const saved = await this.repo.save(entity);
    return this.toModel(saved);
  }

  async update(id: string, input: UpdateVanHanEntryInput): Promise<VanHanEntry> {
    const entity = await this.find(id);
    if (input.year !== undefined) entity.year = input.year;
    if (input.age !== undefined) entity.age = input.age;
    if (input.star !== undefined) entity.star = input.star;
    if (input.rating !== undefined) entity.rating = input.rating;
    if (input.summary !== undefined) entity.summary = input.summary;
    if (input.published !== undefined) entity.published = input.published;
    const saved = await this.repo.save(entity);
    return this.toModel(saved);
  }

  async togglePublished(id: string): Promise<VanHanEntry> {
    const entity = await this.find(id);
    entity.published = !entity.published;
    const saved = await this.repo.save(entity);
    return this.toModel(saved);
  }

  private async find(id: string): Promise<VanHanEntryEntity> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException('Van han entry not found');
    }
    return entity;
  }

  private toModel(entity: VanHanEntryEntity): VanHanEntry {
    return {
      id: entity.id,
      year: entity.year,
      age: entity.age,
      star: entity.star,
      rating: entity.rating,
      summary: entity.summary,
      updatedAt: entity.updatedAt.toISOString(),
      published: entity.published,
    };
  }
}
