import { ConflictException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { QueryFailedError, type Repository } from 'typeorm';
import type { UserEntity } from '../user/entities/user.entity';
import { CheckoutService } from './checkout.service';
import { PaymentCodeAllocationError } from './credits.errors';

const USER_ID = 'u1';
const EXISTING_CODE = 'ABCD2345';
const UNIQUE_VIOLATION = '23505';
const EXPECTED_ATTEMPTS = 5;

const PAYMENT_CONFIG: Record<string, string | number> = {
  'payment.bankCode': 'MB',
  'payment.accountNumber': '0123456789',
  'payment.accountName': 'NGUYEN VAN A',
  'payment.qrImageBaseUrl': 'https://vietqr.app/img',
  'payment.priceVnd': 5000,
  'payment.creditsPerPayment': 5,
};

const uniqueViolation = (): QueryFailedError =>
  new QueryFailedError(
    'UPDATE users',
    [],
    Object.assign(new Error('duplicate'), { code: UNIQUE_VIOLATION }),
  );

const buildService = (
  storedCodes: readonly (string | null)[],
  execute: jest.Mock = jest.fn().mockResolvedValue({ affected: 1 }),
  config: Record<string, string | number> = PAYMENT_CONFIG,
): CheckoutService => {
  const findOne = jest.fn();
  storedCodes.forEach((paymentCode) => findOne.mockResolvedValueOnce({ paymentCode }));
  const builder = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute,
  };
  const repo = {
    findOne,
    createQueryBuilder: jest.fn().mockReturnValue(builder),
  } as unknown as Repository<UserEntity>;
  const read = (key: string): string | number => config[key];
  const configService = { get: read, getOrThrow: read } as unknown as ConfigService;
  return new CheckoutService(repo, configService);
};

describe('CheckoutService', () => {
  it('reuses an existing payment code', async () => {
    const execute = jest.fn();
    const service = buildService([EXISTING_CODE], execute);
    const checkout = await service.checkoutFor(USER_ID);
    expect(checkout.transferContent).toBe(`TVMP${EXISTING_CODE}`);
    expect(execute).not.toHaveBeenCalled();
  });

  it('builds the QR url with amount and transfer content', async () => {
    const service = buildService([EXISTING_CODE]);
    const checkout = await service.checkoutFor(USER_ID);
    const url = new URL(checkout.qrImageUrl);
    expect(url.origin + url.pathname).toBe('https://vietqr.app/img');
    expect(url.searchParams.get('acc')).toBe('0123456789');
    expect(url.searchParams.get('bank')).toBe('MB');
    expect(url.searchParams.get('amount')).toBe('5000');
    expect(url.searchParams.get('des')).toBe(`TVMP${EXISTING_CODE}`);
    expect(checkout.creditsPerPayment).toBe(5);
  });

  it('assigns a code lazily and returns the code the database holds', async () => {
    const service = buildService([null, EXISTING_CODE]);
    const checkout = await service.checkoutFor(USER_ID);
    expect(checkout.transferContent).toBe(`TVMP${EXISTING_CODE}`);
  });

  it('retries with a new code after a unique violation', async () => {
    const execute = jest
      .fn()
      .mockRejectedValueOnce(uniqueViolation())
      .mockResolvedValue({ affected: 1 });
    const service = buildService([null, EXISTING_CODE], execute);
    await service.checkoutFor(USER_ID);
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('gives up after repeated unique violations', async () => {
    const execute = jest.fn().mockRejectedValue(uniqueViolation());
    const service = buildService([null], execute);
    await expect(service.checkoutFor(USER_ID)).rejects.toBeInstanceOf(PaymentCodeAllocationError);
    expect(execute).toHaveBeenCalledTimes(EXPECTED_ATTEMPTS);
  });

  it('rethrows errors that are not unique violations', async () => {
    const failure = new Error('connection lost');
    const service = buildService([null], jest.fn().mockRejectedValue(failure));
    await expect(service.checkoutFor(USER_ID)).rejects.toBe(failure);
  });

  it('is closed while the bank account is not configured', async () => {
    const service = buildService([EXISTING_CODE], undefined, {
      ...PAYMENT_CONFIG,
      'payment.accountNumber': '',
    });
    await expect(service.checkoutFor(USER_ID)).rejects.toBeInstanceOf(ConflictException);
  });
});
