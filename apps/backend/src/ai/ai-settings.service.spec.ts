import { BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from '@org/backend-crypto';
import { Repository } from 'typeorm';
import { AiProvider } from './ai-provider';
import { AiSettingsService, AiSource } from './ai-settings.service';
import { AiHealthStatus, AiProviderEntity } from './entities/ai-provider.entity';

const SEALED = 'sealed:';

class FakeRepo {
  readonly rows = new Map<AiProvider, AiProviderEntity>();
  reads = 0;

  async find(): Promise<AiProviderEntity[]> {
    return [...this.rows.values()];
  }

  async findOneBy(where: Partial<AiProviderEntity>): Promise<AiProviderEntity | null> {
    this.reads += 1;
    const found = [...this.rows.values()].find((row) => matches(row, where));
    return found ? Object.assign(new AiProviderEntity(), found) : null;
  }

  async save(row: AiProviderEntity): Promise<AiProviderEntity> {
    this.rows.set(row.provider, Object.assign(new AiProviderEntity(), row));
    return row;
  }

  async update(where: Partial<AiProviderEntity>, change: Partial<AiProviderEntity>): Promise<void> {
    for (const row of this.rows.values()) {
      if (matches(row, where)) {
        Object.assign(row, change);
      }
    }
  }
}

function matches(row: AiProviderEntity, where: Partial<AiProviderEntity>): boolean {
  return Object.entries(where).every(
    ([key, value]) => row[key as keyof AiProviderEntity] === value,
  );
}

function setup(env: { geminiApiKey?: string; models?: string[] } = {}, canDecrypt = true) {
  const repo = new FakeRepo();
  const crypto = {
    encryptData: (value: string) => `${SEALED}${value}`,
    decryptData: (value: string) => {
      if (!canDecrypt) {
        throw new Error('bad auth tag');
      }
      return value.slice(SEALED.length);
    },
  } as unknown as CryptoService;
  const config = {
    get: (key: string) => (key === 'ai.geminiApiKey' ? env.geminiApiKey : env.models),
  } as unknown as ConfigService;
  const service = new AiSettingsService(
    repo as unknown as Repository<AiProviderEntity>,
    crypto,
    config,
  );
  return { service, repo };
}

describe('AiSettingsService.save', () => {
  it('stores the key sealed and keeps only a few characters from each end readable', async () => {
    const { service, repo } = setup();

    const saved = await service.save(AiProvider.ANTHROPIC, {
      apiKey: 'sk-ant-api03-secret-middle-9Zx1',
      models: ['claude-opus-5-5'],
    });

    expect(repo.rows.get(AiProvider.ANTHROPIC)?.apiKey).toBe(
      `${SEALED}sk-ant-api03-secret-middle-9Zx1`,
    );
    expect(saved.apiKeyHint).toBe('sk-a…9Zx1');
    expect(saved.models).toEqual(['claude-opus-5-5']);
  });

  it('keeps the stored key when only the models change', async () => {
    const { service } = setup();
    await service.save(AiProvider.OPENAI, { apiKey: 'sk-openai-key-AAAA', models: ['gpt-a'] });

    const saved = await service.save(AiProvider.OPENAI, { models: ['gpt-b', 'gpt-a'] });

    expect(saved.apiKeyHint).toBe('…AAAA');
    expect(saved.models).toEqual(['gpt-b', 'gpt-a']);
    await expect(service.apiKeyOf(AiProvider.OPENAI)).resolves.toBe('sk-openai-key-AAAA');
  });

  it('drops blanks and repeats from the model list without reordering it', async () => {
    const { service } = setup();

    const saved = await service.save(AiProvider.GEMINI, {
      apiKey: 'gemini-key-123456',
      models: [' flash-lite ', 'flash', '', 'flash-lite'],
    });

    expect(saved.models).toEqual(['flash-lite', 'flash']);
  });

  it('forgets the last health result, since it described the previous setup', async () => {
    const { service } = setup();
    await service.save(AiProvider.GEMINI, { apiKey: 'gemini-key-123456', models: ['flash'] });
    await service.recordHealth(AiProvider.GEMINI, {
      status: AiHealthStatus.OK,
      latencyMs: 120,
      model: 'flash',
      error: null,
    });

    const saved = await service.save(AiProvider.GEMINI, { models: ['flash-lite'] });

    expect(saved.healthStatus).toBeNull();
    expect(saved.healthCheckedAt).toBeNull();
  });

  it('refuses to leave the provider the site uses without a model', async () => {
    const { service } = setup();
    await service.save(AiProvider.GEMINI, { apiKey: 'gemini-key-123456', models: ['flash'] });
    await service.setActive(AiProvider.GEMINI);

    await expect(service.save(AiProvider.GEMINI, { models: [] })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});

describe('AiSettingsService.setActive', () => {
  it('refuses a provider that has no key or no model', async () => {
    const { service } = setup();
    await service.save(AiProvider.OPENAI, { apiKey: 'sk-openai-key-AAAA', models: [] });

    await expect(service.setActive(AiProvider.OPENAI)).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.setActive(AiProvider.ANTHROPIC)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('moves the site to the chosen provider and off the previous one', async () => {
    const { service, repo } = setup();
    await service.save(AiProvider.GEMINI, { apiKey: 'gemini-key-123456', models: ['flash'] });
    await service.save(AiProvider.ANTHROPIC, {
      apiKey: 'sk-ant-secret-9Zx1',
      models: ['claude-opus-5-5'],
    });
    await service.setActive(AiProvider.GEMINI);

    await service.setActive(AiProvider.ANTHROPIC);

    expect(repo.rows.get(AiProvider.GEMINI)?.isActive).toBe(false);
    expect(repo.rows.get(AiProvider.ANTHROPIC)?.isActive).toBe(true);
    await expect(service.resolveActive()).resolves.toEqual({
      provider: AiProvider.ANTHROPIC,
      credentials: { apiKey: 'sk-ant-secret-9Zx1', models: ['claude-opus-5-5'] },
      source: AiSource.CONSOLE,
    });
  });
});

describe('AiSettingsService.resolveActive', () => {
  it('has nothing to offer when no provider is chosen and the environment has no key', async () => {
    const { service } = setup();

    await expect(service.resolveActive()).resolves.toBeNull();
    await expect(service.source()).resolves.toBe(AiSource.NONE);
  });

  it('falls back to the environment key while the console has chosen nothing', async () => {
    const { service } = setup({ geminiApiKey: 'env-gemini-key', models: ['flash-lite', 'flash'] });

    await expect(service.resolveActive()).resolves.toEqual({
      provider: AiProvider.GEMINI,
      credentials: { apiKey: 'env-gemini-key', models: ['flash-lite', 'flash'] },
      source: AiSource.ENVIRONMENT,
    });
  });

  it('prefers the console choice over the environment key', async () => {
    const { service } = setup({ geminiApiKey: 'env-gemini-key', models: ['flash'] });
    await service.save(AiProvider.OPENAI, { apiKey: 'sk-openai-key-AAAA', models: ['gpt-a'] });
    await service.setActive(AiProvider.OPENAI);

    await expect(service.source()).resolves.toBe(AiSource.CONSOLE);
  });

  it('returns to the environment key when the console choice is switched off', async () => {
    const { service } = setup({ geminiApiKey: 'env-gemini-key', models: ['flash'] });
    await service.save(AiProvider.OPENAI, { apiKey: 'sk-openai-key-AAAA', models: ['gpt-a'] });
    await service.setActive(AiProvider.OPENAI);

    await service.setActive(null);

    await expect(service.source()).resolves.toBe(AiSource.ENVIRONMENT);
  });

  it('does not read the database for every paragraph a chapter generates', async () => {
    const { service, repo } = setup();
    await service.save(AiProvider.GEMINI, { apiKey: 'gemini-key-123456', models: ['flash'] });
    await service.setActive(AiProvider.GEMINI);
    repo.reads = 0;

    await service.resolveActive();
    await service.resolveActive();
    await service.resolveActive();

    expect(repo.reads).toBe(1);
  });

  it('picks up a changed key at once instead of serving the cached one', async () => {
    const { service } = setup();
    await service.save(AiProvider.GEMINI, { apiKey: 'gemini-key-123456', models: ['flash'] });
    await service.setActive(AiProvider.GEMINI);
    await service.resolveActive();

    await service.save(AiProvider.GEMINI, { apiKey: 'gemini-key-rotated', models: ['flash'] });

    expect((await service.resolveActive())?.credentials.apiKey).toBe('gemini-key-rotated');
  });

  it('treats a key it can no longer decrypt as missing rather than crashing the request', async () => {
    const logged = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const { service, repo } = setup({}, false);
    repo.rows.set(
      AiProvider.GEMINI,
      Object.assign(new AiProviderEntity(), {
        provider: AiProvider.GEMINI,
        apiKey: 'sealed-with-an-old-secret',
        models: ['flash'],
        isActive: true,
      }),
    );

    await expect(service.resolveActive()).resolves.toBeNull();
    await expect(service.apiKeyOf(AiProvider.GEMINI)).rejects.toBeInstanceOf(BadRequestException);
    expect(logged).toHaveBeenCalled();
    logged.mockRestore();
  });
});

describe('AiSettingsService.clearKey', () => {
  it('removes the key and takes the provider out of use', async () => {
    const { service } = setup({ geminiApiKey: 'env-gemini-key', models: ['flash'] });
    await service.save(AiProvider.OPENAI, { apiKey: 'sk-openai-key-AAAA', models: ['gpt-a'] });
    await service.setActive(AiProvider.OPENAI);

    const cleared = await service.clearKey(AiProvider.OPENAI);

    expect(cleared.apiKey).toBeNull();
    expect(cleared.apiKeyHint).toBeNull();
    expect(cleared.isActive).toBe(false);
    await expect(service.source()).resolves.toBe(AiSource.ENVIRONMENT);
  });
});

describe('AiSettingsService.list', () => {
  it('always shows all three providers, configured or not', async () => {
    const { service } = setup();
    await service.save(AiProvider.OPENAI, { apiKey: 'sk-openai-key-AAAA', models: ['gpt-a'] });

    const rows = await service.list();

    expect(rows.map((row) => row.provider)).toEqual([
      AiProvider.GEMINI,
      AiProvider.OPENAI,
      AiProvider.ANTHROPIC,
    ]);
    expect(rows.map((row) => row.apiKey !== null)).toEqual([false, true, false]);
  });
});

describe('AiSettingsService.credentialsOf', () => {
  it('asks for a key and a model before a provider can be called', async () => {
    const { service } = setup();
    await expect(service.credentialsOf(AiProvider.OPENAI)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    await service.save(AiProvider.OPENAI, { apiKey: 'sk-openai-key-AAAA', models: [] });
    await expect(service.credentialsOf(AiProvider.OPENAI)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    await service.save(AiProvider.OPENAI, { models: ['gpt-a'] });
    await expect(service.credentialsOf(AiProvider.OPENAI)).resolves.toEqual({
      apiKey: 'sk-openai-key-AAAA',
      models: ['gpt-a'],
    });
  });
});
