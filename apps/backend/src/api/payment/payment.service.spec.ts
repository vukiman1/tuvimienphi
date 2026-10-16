import type { ConfigService } from '@nestjs/config';
import type { DataSource, EntityManager } from 'typeorm';
import type { ActivityLogService } from '../activity/activity-log.service';
import type { ChapterCreditsService } from '../credits/chapter-credits.service';
import { CreditsEvent } from '../credits/credits-event';
import { PaymentService } from './payment.service';
import { PaymentStatus, UnmatchedReason } from './payment-status.enum';
import type { SepayTransaction } from './sepay/sepay-webhook.schema';

const USER_ID = 'user-1';
const PAYMENT_ID = 'payment-1';
const PAYMENT_CODE = 'ABCD2345';

const CONFIG: Record<string, number> = {
  'payment.priceVnd': 5000,
  'payment.creditsPerPayment': 5,
};

const TRANSACTION: SepayTransaction = {
  id: 92704,
  transferType: 'in',
  transferAmount: 5000,
  content: `TVMP${PAYMENT_CODE}`,
  referenceCode: 'FT26289',
  transactionDate: '2026-10-16 10:00:00',
};

interface Harness {
  readonly service: PaymentService;
  readonly values: jest.Mock;
  readonly grant: jest.Mock;
  readonly record: jest.Mock;
  readonly findOne: jest.Mock;
  readonly transaction: jest.Mock;
}

const buildHarness = (options: { isDuplicate?: boolean; userId?: string | null } = {}): Harness => {
  const { isDuplicate = false, userId = USER_ID } = options;
  const execute = jest.fn().mockResolvedValue({ raw: isDuplicate ? [] : [{ id: PAYMENT_ID }] });
  const values = jest.fn().mockReturnThis();
  const builder = {
    insert: jest.fn().mockReturnThis(),
    into: jest.fn().mockReturnThis(),
    values,
    orIgnore: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    execute,
  };
  const findOne = jest.fn().mockResolvedValue(userId ? { id: userId } : null);
  const manager = {
    createQueryBuilder: jest.fn().mockReturnValue(builder),
    findOne,
  } as unknown as EntityManager;
  const transaction = jest.fn(async (work: (entityManager: EntityManager) => Promise<unknown>) =>
    work(manager),
  );
  const grant = jest.fn().mockResolvedValue(5);
  const record = jest.fn();
  const read = (key: string): number => CONFIG[key];
  const service = new PaymentService(
    { transaction } as unknown as DataSource,
    { getOrThrow: read } as unknown as ConfigService,
    { grant } as unknown as ChapterCreditsService,
    { record } as unknown as ActivityLogService,
  );
  return { service, values, grant, record, findOne, transaction };
};

describe('PaymentService.recordSepayTransaction', () => {
  it('credits a matched 5k transfer once', async () => {
    const { service, values, grant, record } = buildHarness();
    await service.recordSepayTransaction(TRANSACTION);
    expect(grant).toHaveBeenCalledTimes(1);
    expect(grant).toHaveBeenCalledWith(USER_ID, 5, expect.anything());
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        sepayTransactionId: '92704',
        userId: USER_ID,
        status: PaymentStatus.Credited,
        creditsGranted: 5,
        unmatchedReason: null,
        transactionAt: new Date('2026-10-16T03:00:00.000Z'),
      }),
    );
    expect(record).toHaveBeenCalledWith(CreditsEvent.PURCHASED, {
      userId: USER_ID,
      metadata: { paymentId: PAYMENT_ID, amountVnd: 5000, credits: 5 },
    });
  });

  it('finds the code in content a bank has mangled', async () => {
    const { service, findOne, grant } = buildHarness();
    await service.recordSepayTransaction({
      ...TRANSACTION,
      content: `MBVCB.123.tvmp ${PAYMENT_CODE.slice(0, 4)}-${PAYMENT_CODE.slice(4)}.CT tu 1`,
    });
    expect(findOne).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ where: { paymentCode: PAYMENT_CODE } }),
    );
    expect(grant).toHaveBeenCalledWith(USER_ID, 5, expect.anything());
  });

  it('credits a multiple of the price proportionally', async () => {
    const { service, grant } = buildHarness();
    await service.recordSepayTransaction({ ...TRANSACTION, transferAmount: 12000 });
    expect(grant).toHaveBeenCalledWith(USER_ID, 10, expect.anything());
  });

  it('ignores a transaction id it has already stored', async () => {
    const { service, grant, record } = buildHarness({ isDuplicate: true });
    await service.recordSepayTransaction(TRANSACTION);
    expect(grant).not.toHaveBeenCalled();
    expect(record).not.toHaveBeenCalled();
  });

  it('keeps an underpaid transfer as unmatched', async () => {
    const { service, values, grant, record } = buildHarness();
    await service.recordSepayTransaction({ ...TRANSACTION, transferAmount: 3000 });
    expect(grant).not.toHaveBeenCalled();
    expect(record).not.toHaveBeenCalled();
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        status: PaymentStatus.Unmatched,
        unmatchedReason: UnmatchedReason.AmountTooLow,
        creditsGranted: 0,
      }),
    );
  });

  it('keeps a transfer without a code as unmatched', async () => {
    const { service, values, grant, findOne } = buildHarness();
    await service.recordSepayTransaction({ ...TRANSACTION, content: 'chuyen tien an trua' });
    expect(findOne).not.toHaveBeenCalled();
    expect(grant).not.toHaveBeenCalled();
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: null,
        status: PaymentStatus.Unmatched,
        unmatchedReason: UnmatchedReason.NoCode,
      }),
    );
  });

  it('keeps a transfer with an unknown code as unmatched', async () => {
    const { service, values, grant } = buildHarness({ userId: null });
    await service.recordSepayTransaction(TRANSACTION);
    expect(grant).not.toHaveBeenCalled();
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: null,
        status: PaymentStatus.Unmatched,
        unmatchedReason: UnmatchedReason.UnknownCode,
      }),
    );
  });

  it('skips outgoing transfers', async () => {
    const { service, transaction, grant } = buildHarness();
    await service.recordSepayTransaction({ ...TRANSACTION, transferType: 'out' });
    expect(transaction).not.toHaveBeenCalled();
    expect(grant).not.toHaveBeenCalled();
  });

  it('records no purchase event when the grant fails', async () => {
    const { service, grant, record } = buildHarness();
    grant.mockRejectedValue(new Error('boom'));
    await expect(service.recordSepayTransaction(TRANSACTION)).rejects.toThrow('boom');
    expect(record).not.toHaveBeenCalled();
  });
});
