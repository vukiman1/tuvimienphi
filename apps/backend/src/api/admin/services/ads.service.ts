import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdPopupEntity } from '../entities/ad-popup.entity';
import { AdRedirectEntity } from '../entities/ad-redirect.entity';
import {
  CreateAdPopupInput,
  CreateAdRedirectInput,
  UpdateAdPopupInput,
  UpdateAdRedirectInput,
} from '../inputs/ads.input';
import { AdPopup, AdRedirect, AdsData } from '../models/ads.model';

@Injectable()
export class AdsService {
  constructor(
    @InjectRepository(AdRedirectEntity)
    private readonly redirectRepo: Repository<AdRedirectEntity>,
    @InjectRepository(AdPopupEntity)
    private readonly popupRepo: Repository<AdPopupEntity>,
  ) {}

  async getAds(): Promise<AdsData> {
    const [redirects, popups] = await Promise.all([
      this.redirectRepo.find({ order: { createdAt: 'DESC' } }),
      this.popupRepo.find({ order: { createdAt: 'DESC' } }),
    ]);
    return {
      redirects: redirects.map((redirect) => this.toRedirect(redirect)),
      popups: popups.map((popup) => this.toPopup(popup)),
    };
  }

  async createRedirect(input: CreateAdRedirectInput): Promise<AdRedirect> {
    const entity = this.redirectRepo.create({
      label: input.label,
      slug: input.slug,
      target: input.target,
      active: input.active ?? true,
    });
    const saved = await this.redirectRepo.save(entity);
    return this.toRedirect(saved);
  }

  async updateRedirect(id: string, input: UpdateAdRedirectInput): Promise<AdRedirect> {
    const entity = await this.findRedirect(id);
    if (input.label !== undefined) entity.label = input.label;
    if (input.slug !== undefined) entity.slug = input.slug;
    if (input.target !== undefined) entity.target = input.target;
    if (input.active !== undefined) entity.active = input.active;
    const saved = await this.redirectRepo.save(entity);
    return this.toRedirect(saved);
  }

  async toggleRedirectActive(id: string): Promise<AdRedirect> {
    const entity = await this.findRedirect(id);
    entity.active = !entity.active;
    const saved = await this.redirectRepo.save(entity);
    return this.toRedirect(saved);
  }

  async removeRedirect(id: string): Promise<boolean> {
    const result = await this.redirectRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async createPopup(input: CreateAdPopupInput): Promise<AdPopup> {
    const entity = this.popupRepo.create({
      name: input.name,
      trigger: input.trigger,
      image: input.image,
      target: input.target,
      active: input.active ?? true,
    });
    const saved = await this.popupRepo.save(entity);
    return this.toPopup(saved);
  }

  async updatePopup(id: string, input: UpdateAdPopupInput): Promise<AdPopup> {
    const entity = await this.findPopup(id);
    if (input.name !== undefined) entity.name = input.name;
    if (input.trigger !== undefined) entity.trigger = input.trigger;
    if (input.image !== undefined) entity.image = input.image;
    if (input.target !== undefined) entity.target = input.target;
    if (input.active !== undefined) entity.active = input.active;
    const saved = await this.popupRepo.save(entity);
    return this.toPopup(saved);
  }

  async togglePopupActive(id: string): Promise<AdPopup> {
    const entity = await this.findPopup(id);
    entity.active = !entity.active;
    const saved = await this.popupRepo.save(entity);
    return this.toPopup(saved);
  }

  async removePopup(id: string): Promise<boolean> {
    const result = await this.popupRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  private async findRedirect(id: string): Promise<AdRedirectEntity> {
    const entity = await this.redirectRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException('Ad redirect not found');
    }
    return entity;
  }

  private async findPopup(id: string): Promise<AdPopupEntity> {
    const entity = await this.popupRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException('Ad popup not found');
    }
    return entity;
  }

  private toRedirect(entity: AdRedirectEntity): AdRedirect {
    return {
      id: entity.id,
      label: entity.label,
      slug: entity.slug,
      target: entity.target,
      clicks: entity.clicks,
      active: entity.active,
      createdAt: entity.createdAt.toISOString(),
    };
  }

  private toPopup(entity: AdPopupEntity): AdPopup {
    return {
      id: entity.id,
      name: entity.name,
      trigger: entity.trigger,
      image: entity.image,
      target: entity.target,
      impressions: entity.impressions,
      clicks: entity.clicks,
      active: entity.active,
    };
  }
}
