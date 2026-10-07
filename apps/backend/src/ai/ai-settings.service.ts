import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { CryptoService } from '@org/backend-crypto';
import { Repository } from 'typeorm';
import { AI_PROVIDERS, AiProvider, type AiCredentials } from './ai-provider';
import { AiHealthStatus, AiProviderEntity } from './entities/ai-provider.entity';

export enum AiSource {
  CONSOLE = 'CONSOLE',
  ENVIRONMENT = 'ENVIRONMENT',
  NONE = 'NONE',
}

export interface ActiveAi {
  readonly provider: AiProvider;
  readonly credentials: AiCredentials;
  readonly source: AiSource.CONSOLE | AiSource.ENVIRONMENT;
}

export interface AiProviderChange {
  readonly apiKey?: string | null;
  readonly models: readonly string[];
}

export interface AiHealthOutcome {
  readonly status: AiHealthStatus;
  readonly latencyMs: number;
  readonly model: string | null;
  readonly error: string | null;
}

const ACTIVE_CACHE_MS = 30_000;
const HINT_LENGTH = 4;

@Injectable()
export class AiSettingsService {
  private readonly logger = new Logger(AiSettingsService.name);
  private cached: { readonly value: ActiveAi | null; readonly expiresAt: number } | null = null;

  constructor(
    @InjectRepository(AiProviderEntity)
    private readonly repo: Repository<AiProviderEntity>,
    private readonly crypto: CryptoService,
    private readonly config: ConfigService,
  ) {}

  async list(): Promise<AiProviderEntity[]> {
    const rows = await this.repo.find();
    return AI_PROVIDERS.map(
      (provider) => rows.find((row) => row.provider === provider) ?? blank(provider),
    );
  }

  async source(): Promise<AiSource> {
    const active = await this.resolveActive();
    return active?.source ?? AiSource.NONE;
  }

  async resolveActive(): Promise<ActiveAi | null> {
    const now = Date.now();
    if (this.cached && this.cached.expiresAt > now) {
      return this.cached.value;
    }
    const value = (await this.fromConsole()) ?? this.fromEnvironment();
    this.cached = { value, expiresAt: now + ACTIVE_CACHE_MS };
    return value;
  }

  async apiKeyOf(provider: AiProvider): Promise<string> {
    const row = await this.find(provider);
    if (!row.apiKey) {
      throw new BadRequestException(`${provider} has no API key yet`);
    }
    const apiKey = this.decrypt(row);
    if (!apiKey) {
      throw new BadRequestException(
        `the stored ${provider} key can no longer be read; enter it again`,
      );
    }
    return apiKey;
  }

  async credentialsOf(provider: AiProvider): Promise<AiCredentials> {
    const apiKey = await this.apiKeyOf(provider);
    const { models } = await this.find(provider);
    if (models.length === 0) {
      throw new BadRequestException(`${provider} has no model chosen yet`);
    }
    return { apiKey, models };
  }

  async save(provider: AiProvider, change: AiProviderChange): Promise<AiProviderEntity> {
    const row = await this.find(provider);
    const models = distinct(change.models);
    if (row.isActive && models.length === 0) {
      throw new BadRequestException('the provider the site uses needs at least one model');
    }

    if (change.apiKey) {
      row.apiKey = this.crypto.encryptData(change.apiKey);
      row.apiKeyHint = change.apiKey.slice(-HINT_LENGTH);
    }
    row.models = models;
    return this.store(clearHealth(row));
  }

  async clearKey(provider: AiProvider): Promise<AiProviderEntity> {
    const row = await this.find(provider);
    row.apiKey = null;
    row.apiKeyHint = null;
    row.isActive = false;
    return this.store(clearHealth(row));
  }

  async setActive(provider: AiProvider | null): Promise<void> {
    if (provider) {
      const row = await this.find(provider);
      if (!row.apiKey || row.models.length === 0) {
        throw new BadRequestException(
          `${provider} needs an API key and at least one model before the site can use it`,
        );
      }
    }

    await this.repo.update({ isActive: true }, { isActive: false });
    if (provider) {
      await this.repo.update({ provider }, { isActive: true });
    }
    this.cached = null;
  }

  async recordHealth(provider: AiProvider, outcome: AiHealthOutcome): Promise<AiProviderEntity> {
    const row = await this.find(provider);
    row.healthStatus = outcome.status;
    row.healthCheckedAt = new Date();
    row.healthLatencyMs = outcome.latencyMs;
    row.healthModel = outcome.model;
    row.healthError = outcome.error;
    return this.repo.save(row);
  }

  private async find(provider: AiProvider): Promise<AiProviderEntity> {
    return (await this.repo.findOneBy({ provider })) ?? blank(provider);
  }

  private async store(row: AiProviderEntity): Promise<AiProviderEntity> {
    row.updatedAt = new Date();
    const saved = await this.repo.save(row);
    this.cached = null;
    return saved;
  }

  private async fromConsole(): Promise<ActiveAi | null> {
    const row = await this.repo.findOneBy({ isActive: true });
    if (!row?.apiKey || row.models.length === 0) {
      return null;
    }
    const apiKey = this.decrypt(row);
    if (!apiKey) {
      return null;
    }
    return {
      provider: row.provider,
      credentials: { apiKey, models: row.models },
      source: AiSource.CONSOLE,
    };
  }

  private fromEnvironment(): ActiveAi | null {
    const apiKey = this.config.get<string>('ai.geminiApiKey');
    if (!apiKey) {
      return null;
    }
    return {
      provider: AiProvider.GEMINI,
      credentials: { apiKey, models: this.config.get<string[]>('ai.models') ?? [] },
      source: AiSource.ENVIRONMENT,
    };
  }

  private decrypt(row: AiProviderEntity): string | null {
    if (!row.apiKey) {
      return null;
    }
    try {
      return this.crypto.decryptData(row.apiKey);
    } catch {
      this.logger.error(
        `The stored ${row.provider} key cannot be decrypted; SECRET_KEY may have changed since it was saved`,
      );
      return null;
    }
  }
}

function blank(provider: AiProvider): AiProviderEntity {
  return Object.assign(new AiProviderEntity(), {
    provider,
    apiKey: null,
    apiKeyHint: null,
    models: [],
    isActive: false,
    healthStatus: null,
    healthCheckedAt: null,
    healthLatencyMs: null,
    healthModel: null,
    healthError: null,
    updatedAt: null,
  });
}

function clearHealth(row: AiProviderEntity): AiProviderEntity {
  row.healthStatus = null;
  row.healthCheckedAt = null;
  row.healthLatencyMs = null;
  row.healthModel = null;
  row.healthError = null;
  return row;
}

function distinct(models: readonly string[]): string[] {
  return [...new Set(models.map((model) => model.trim()).filter(Boolean))];
}
