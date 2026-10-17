import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CreateGiftCodeInput } from './create-gift-code.input';

const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });

const VALID_INPUT = { credits: 10, maxRedemptions: 50 };

function validate(value: unknown): Promise<CreateGiftCodeInput> {
  return pipe.transform(value, { type: 'body', metatype: CreateGiftCodeInput });
}

describe('CreateGiftCodeInput', () => {
  it('accepts an input without a code', async () => {
    await expect(validate(VALID_INPUT)).resolves.toMatchObject(VALID_INPUT);
  });

  it('normalizes a padded lowercase code', async () => {
    await expect(validate({ ...VALID_INPUT, code: ' summer25 ' })).resolves.toMatchObject({
      code: 'SUMMER25',
    });
  });

  it('treats a blank code as no code', async () => {
    const input = await validate({ ...VALID_INPUT, code: '   ' });

    expect(input.code).toBeUndefined();
  });

  it('rejects a code that is too short', async () => {
    await expect(validate({ ...VALID_INPUT, code: 'ab' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects a code with a dash', async () => {
    await expect(validate({ ...VALID_INPUT, code: 'SUMMER-25' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects zero credits', async () => {
    await expect(validate({ ...VALID_INPUT, credits: 0 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects credits above the limit', async () => {
    await expect(validate({ ...VALID_INPUT, credits: 1001 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects zero max redemptions', async () => {
    await expect(validate({ ...VALID_INPUT, maxRedemptions: 0 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects an expiry that is not an ISO date', async () => {
    await expect(validate({ ...VALID_INPUT, expiresAt: 'tomorrow' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('accepts an ISO expiry', async () => {
    await expect(
      validate({ ...VALID_INPUT, expiresAt: '2026-12-31T10:00:00.000Z' }),
    ).resolves.toMatchObject({ expiresAt: '2026-12-31T10:00:00.000Z' });
  });
});
