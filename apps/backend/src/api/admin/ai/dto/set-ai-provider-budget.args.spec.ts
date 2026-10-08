import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AiUsageArgs } from './ai-usage.args';
import { SetAiProviderBudgetArgs } from './set-ai-provider-budget.args';

const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });

function validateBudget(value: unknown): Promise<SetAiProviderBudgetArgs> {
  return pipe.transform(value, { type: 'body', metatype: SetAiProviderBudgetArgs });
}

function validateUsage(value: unknown): Promise<AiUsageArgs> {
  return pipe.transform(value, { type: 'body', metatype: AiUsageArgs });
}

describe('SetAiProviderBudgetArgs', () => {
  it('accepts a budget in dollars and cents', async () => {
    await expect(
      validateBudget({ provider: 'OPENAI', monthlyBudgetUsd: 12.5 }),
    ).resolves.toMatchObject({ monthlyBudgetUsd: 12.5 });
  });

  it('accepts no budget, to remove the one that was set', async () => {
    await expect(
      validateBudget({ provider: 'OPENAI', monthlyBudgetUsd: null }),
    ).resolves.toBeTruthy();
    await expect(validateBudget({ provider: 'OPENAI' })).resolves.toBeTruthy();
  });

  it('rejects a budget of nothing, a negative one and fractions of a cent', async () => {
    for (const monthlyBudgetUsd of [0, -5, 1.234]) {
      await expect(validateBudget({ provider: 'OPENAI', monthlyBudgetUsd })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    }
  });
});

describe('AiUsageArgs', () => {
  it('accepts two days', async () => {
    await expect(validateUsage({ from: '2026-10-01', to: '2026-10-07' })).resolves.toBeTruthy();
  });

  it('rejects anything that is not a day', async () => {
    await expect(validateUsage({ from: 'yesterday', to: '2026-10-07' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(validateUsage({ from: '2026-10-01' })).rejects.toBeInstanceOf(BadRequestException);
  });
});
