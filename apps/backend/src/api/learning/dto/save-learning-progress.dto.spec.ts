import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SaveLearningProgressDto } from './save-learning-progress.dto';

async function errorsFor(body: unknown): Promise<string[]> {
  const errors = await validate(plainToInstance(SaveLearningProgressDto, body));
  return errors.map((error) => error.property);
}

describe('SaveLearningProgressDto', () => {
  it('accepts up to 50 kebab-case slugs', async () => {
    const slugs = Array.from({ length: 50 }, (_, index) =>
      index % 2 === 0 ? 'tu-vi-la-gi' : '12-cung-tu-vi',
    );

    await expect(errorsFor({ slugs })).resolves.toEqual([]);
  });

  it('refuses more than 50 slugs', async () => {
    const slugs = Array.from({ length: 51 }, (_, index) => `lesson-${index}`);

    await expect(errorsFor({ slugs })).resolves.toContain('slugs');
  });

  it('refuses an empty list', async () => {
    await expect(errorsFor({ slugs: [] })).resolves.toContain('slugs');
  });

  it('refuses a slug that is not kebab-case or is longer than 80 characters', async () => {
    const cases = ['Tu-Vi', 'tu_vi', 'tu vi', '', 'a'.repeat(81)];

    for (const bad of cases) {
      await expect(errorsFor({ slugs: [bad] })).resolves.toContain('slugs');
    }
  });

  it('refuses items that are not strings', async () => {
    await expect(errorsFor({ slugs: [1] })).resolves.toContain('slugs');
  });

  it('refuses a body whose slugs are not a list', async () => {
    await expect(errorsFor({ slugs: 'tu-vi-la-gi' })).resolves.toContain('slugs');
  });

  it('refuses a property it does not declare', async () => {
    const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });

    await expect(
      pipe.transform(
        { slugs: ['a'], userId: 'x' },
        { type: 'body', metatype: SaveLearningProgressDto },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
