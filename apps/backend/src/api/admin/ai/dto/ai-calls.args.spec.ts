import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AiCallsArgs } from './ai-calls.args';

const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });

function validate(value: unknown): Promise<AiCallsArgs> {
  return pipe.transform(value, { type: 'body', metatype: AiCallsArgs });
}

function args(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    from: '2026-10-01',
    to: '2026-10-08',
    provider: 'OPENAI',
    model: 'gpt-6.1-sol',
    purpose: 'GENERATION',
    ...overrides,
  };
}

describe('AiCallsArgs', () => {
  it('accepts one row of the usage table, with or without a page', async () => {
    await expect(validate(args())).resolves.toBeTruthy();
    await expect(validate(args({ page: 3, limit: 50 }))).resolves.toMatchObject({ page: 3 });
  });

  it('rejects a page size that would dump the whole log', async () => {
    await expect(validate(args({ limit: 5000 }))).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a page before the first', async () => {
    await expect(validate(args({ page: 0 }))).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a purpose and a provider it does not know', async () => {
    await expect(validate(args({ purpose: 'OTHER' }))).rejects.toBeInstanceOf(BadRequestException);
    await expect(validate(args({ provider: 'MISTRAL' }))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
