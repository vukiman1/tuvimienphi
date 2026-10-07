import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AiProviderModelsArgs } from './ai-provider.args';
import { TestAiProviderInput } from './test-ai-provider.input';

const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });

function validateTest(value: unknown): Promise<TestAiProviderInput> {
  return pipe.transform(value, { type: 'body', metatype: TestAiProviderInput });
}

function validateModelsArgs(value: unknown): Promise<AiProviderModelsArgs> {
  return pipe.transform(value, { type: 'body', metatype: AiProviderModelsArgs });
}

describe('TestAiProviderInput', () => {
  it('accepts a typed key with the models to try', async () => {
    await expect(
      validateTest({ provider: 'GEMINI', apiKey: 'AIza-typed-key-0001', models: ['gemini-x'] }),
    ).resolves.toMatchObject({ provider: 'GEMINI' });
  });

  it('accepts models alone, to try them with the key already stored', async () => {
    await expect(validateTest({ provider: 'GEMINI', models: ['gemini-x'] })).resolves.toBeTruthy();
  });

  it('rejects a check with no model to call', async () => {
    await expect(validateTest({ provider: 'GEMINI', models: [] })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('holds the key and the model ids to the same rules as saving', async () => {
    await expect(
      validateTest({ provider: 'GEMINI', apiKey: 'has a space', models: ['gemini-x'] }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      validateTest({ provider: 'GEMINI', models: ['not an id'] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('AiProviderModelsArgs', () => {
  it('accepts a provider alone, to list with the stored key', async () => {
    await expect(validateModelsArgs({ provider: 'OPENAI' })).resolves.toMatchObject({
      provider: 'OPENAI',
    });
  });

  it('accepts a typed key to list with before it is saved', async () => {
    await expect(
      validateModelsArgs({ provider: 'OPENAI', apiKey: 'sk-typed-key-0001' }),
    ).resolves.toBeTruthy();
  });

  it('rejects a key that could not be one', async () => {
    await expect(
      validateModelsArgs({ provider: 'OPENAI', apiKey: 'short' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
