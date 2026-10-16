import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AdjustChapterCreditsInput } from './adjust-chapter-credits.input';

const USER_ID = '2f4c1a52-6a59-4d7e-9a0e-0d3c5b8f7a11';

const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });

function validate(value: unknown): Promise<AdjustChapterCreditsInput> {
  return pipe.transform(value, { type: 'body', metatype: AdjustChapterCreditsInput });
}

describe('AdjustChapterCreditsInput', () => {
  it('accepts a deduction', async () => {
    await expect(validate({ userId: USER_ID, delta: -5 })).resolves.toMatchObject({ delta: -5 });
  });

  it('rejects an adjustment of zero', async () => {
    await expect(validate({ userId: USER_ID, delta: 0 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects an adjustment above the limit', async () => {
    await expect(validate({ userId: USER_ID, delta: 1001 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects a user id that is not a uuid', async () => {
    await expect(validate({ userId: 'nope', delta: 5 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
