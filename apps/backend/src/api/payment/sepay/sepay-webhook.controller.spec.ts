import { BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import type { PaymentService } from '../payment.service';
import { SepayWebhookController } from './sepay-webhook.controller';

const VALID_PAYLOAD = {
  id: 92704,
  transferType: 'in',
  transferAmount: 5000,
  content: 'TVMPABCD2345',
  referenceCode: 'FT26289',
  transactionDate: '2026-10-16 10:00:00',
};

const buildResponse = (): { res: Response; json: jest.Mock; status: jest.Mock } => {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  return { res: { status } as unknown as Response, json, status };
};

const buildController = (): {
  controller: SepayWebhookController;
  recordSepayTransaction: jest.Mock;
} => {
  const recordSepayTransaction = jest.fn().mockResolvedValue(undefined);
  const paymentService = { recordSepayTransaction } as unknown as PaymentService;
  return { controller: new SepayWebhookController(paymentService), recordSepayTransaction };
};

describe('SepayWebhookController', () => {
  it('replies with exactly the success body SePay expects', async () => {
    const { controller } = buildController();
    const { res, json, status } = buildResponse();

    await controller.receive(VALID_PAYLOAD, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ success: true });
  });

  it('rejects a malformed payload without replying success', async () => {
    const { controller, recordSepayTransaction } = buildController();
    const { res, json } = buildResponse();

    await expect(controller.receive({ id: 'x' }, res)).rejects.toThrow(BadRequestException);

    expect(recordSepayTransaction).not.toHaveBeenCalled();
    expect(json).not.toHaveBeenCalled();
  });
});
