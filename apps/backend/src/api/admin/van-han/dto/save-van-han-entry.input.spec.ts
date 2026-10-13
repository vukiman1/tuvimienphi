import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { VAN_HAN_ASPECTS } from '@org/shared-contracts';
import { SaveVanHanEntryInput } from './save-van-han-entry.input';

const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });

function validate(value: unknown): Promise<SaveVanHanEntryInput> {
  return pipe.transform(value, { type: 'body', metatype: SaveVanHanEntryInput });
}

function withoutPrototype<T extends object>(value: T): T {
  return Object.assign(Object.create(null), value);
}

function entry(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    year: 2026,
    zodiacOrder: 7,
    luuNien: 'Năm nay vận trình nhiều chuyển biến.',
    luanGiai: VAN_HAN_ASPECTS.map((aspect) => ({ aspect, rating: 3, body: 'Giữ ổn định.' })),
    tungTuoi: [{ birthYear: 1966, male: 'Nam gặp Kế Đô.', female: 'Nữ gặp Thái Dương.' }],
    ...overrides,
  };
}

describe('SaveVanHanEntryInput', () => {
  it('accepts a complete entry', async () => {
    const input = await validate(entry());

    expect(input.luanGiai).toHaveLength(4);
    expect(input.tungTuoi[0].birthYear).toBe(1966);
  });

  it('accepts the prototype-less objects GraphQL hands to a resolver', async () => {
    const value = withoutPrototype({
      ...entry(),
      luanGiai: VAN_HAN_ASPECTS.map((aspect) =>
        withoutPrototype({ aspect, rating: 3, body: 'Giữ ổn định.' }),
      ),
      tungTuoi: [
        withoutPrototype({ birthYear: 1966, male: 'Nam gặp Kế Đô.', female: 'Nữ gặp Thái Dương.' }),
      ],
    });

    const input = await validate(value);

    expect(input.luanGiai.map((aspect) => aspect.aspect)).toEqual([...VAN_HAN_ASPECTS]);
    expect(input.tungTuoi).toEqual([
      { birthYear: 1966, male: 'Nam gặp Kế Đô.', female: 'Nữ gặp Thái Dương.' },
    ]);
  });

  it('still checks what is inside a prototype-less nested object', async () => {
    const value = withoutPrototype({
      ...entry(),
      luanGiai: [withoutPrototype({ aspect: VAN_HAN_ASPECTS[0], rating: 6, body: 'Giữ ổn định.' })],
    });

    await expect(validate(value)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts a draft with nothing written yet', async () => {
    await expect(
      validate(entry({ luuNien: '', luanGiai: [], tungTuoi: [] })),
    ).resolves.toBeTruthy();
  });

  it('rejects an aspect the public page has no theme for', async () => {
    const misspelled = [{ aspect: 'Sức Khỏe', rating: 3, body: 'Giữ ổn định.' }];

    await expect(validate(entry({ luanGiai: misspelled }))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects a rating outside the five stars the page can draw', async () => {
    const overrated = [{ aspect: VAN_HAN_ASPECTS[0], rating: 6, body: 'Giữ ổn định.' }];

    await expect(validate(entry({ luanGiai: overrated }))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects the same birth year listed twice', async () => {
    const age = { birthYear: 1966, male: 'Nam gặp Kế Đô.', female: 'Nữ gặp Thái Dương.' };

    await expect(validate(entry({ tungTuoi: [age, age] }))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects a zodiac outside the twelve', async () => {
    await expect(validate(entry({ zodiacOrder: 13 }))).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a field the entry does not have, even inside a nested reading', async () => {
    const age = { birthYear: 1966, male: 'Nam.', female: 'Nữ.', canChi: 'Tự gõ' };

    await expect(validate(entry({ tungTuoi: [age] }))).rejects.toBeInstanceOf(BadRequestException);
    await expect(validate(entry({ title: 'Tự đặt' }))).rejects.toBeInstanceOf(BadRequestException);
  });
});
