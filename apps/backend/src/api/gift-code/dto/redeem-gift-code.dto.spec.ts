import { GIFT_CODE_MAX_LENGTH } from '@org/shared-contracts';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RedeemGiftCodeDto } from './redeem-gift-code.dto';

const errorsFor = (code: unknown) => validate(plainToInstance(RedeemGiftCodeDto, { code }));

describe('RedeemGiftCodeDto', () => {
  it('accepts a code up to the max length', async () => {
    expect(await errorsFor('A'.repeat(GIFT_CODE_MAX_LENGTH))).toHaveLength(0);
  });

  it('rejects an empty code', async () => {
    expect(await errorsFor('')).not.toHaveLength(0);
  });

  it('rejects a code longer than the max length', async () => {
    expect(await errorsFor('A'.repeat(GIFT_CODE_MAX_LENGTH + 1))).not.toHaveLength(0);
  });

  it('rejects a non-string code', async () => {
    expect(await errorsFor(123)).not.toHaveLength(0);
  });
});
