import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { SaveAiProviderInput } from './save-ai-provider.input';

const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });

function validate(value: unknown): Promise<SaveAiProviderInput> {
  return pipe.transform(value, { type: 'body', metatype: SaveAiProviderInput });
}

function input(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    provider: 'ANTHROPIC',
    apiKey: 'sk-ant-secret-9Zx1',
    models: ['claude-opus-5-5'],
    ...overrides,
  };
}

describe('SaveAiProviderInput', () => {
  it('accepts a key with its models', async () => {
    await expect(validate(input())).resolves.toMatchObject({ provider: 'ANTHROPIC' });
  });

  it('accepts a change of models that leaves the key alone', async () => {
    await expect(validate(input({ apiKey: null }))).resolves.toBeTruthy();
    await expect(validate({ provider: 'GEMINI', models: [] })).resolves.toBeTruthy();
  });

  it('accepts the model ids the three providers actually use', async () => {
    const models = ['claude-opus-5-5', 'gemini-3.5-flash-lite', 'ft:gpt-x:org/custom', 'o3'];

    await expect(validate(input({ models }))).resolves.toBeTruthy();
  });

  it('rejects a provider that is not one of the three', async () => {
    await expect(validate(input({ provider: 'MISTRAL' }))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects a key pasted with a space or a line break in it', async () => {
    await expect(validate(input({ apiKey: 'sk-ant-secret 9Zx1' }))).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(validate(input({ apiKey: 'sk-ant-secret-9Zx1\n' }))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects a key too short to be one', async () => {
    await expect(validate(input({ apiKey: 'sk-1' }))).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a model id longer than the column chapters record it in', async () => {
    await expect(validate(input({ models: ['m'.repeat(61)] }))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects a model id that is not an id', async () => {
    await expect(validate(input({ models: ['claude opus'] }))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
