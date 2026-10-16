import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { InvalidSepayPayloadError } from '../payment.errors';
import { PaymentService } from '../payment.service';
import { SepayApiKeyGuard } from './sepay-api-key.guard';
import { parseSepayWebhook, type SepayTransaction } from './sepay-webhook.schema';

const SEPAY_SUCCESS_BODY = { success: true } as const;

@Controller('payments/sepay')
export class SepayWebhookController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @SkipThrottle()
  @UseGuards(SepayApiKeyGuard)
  async receive(@Body() body: unknown, @Res() res: Response): Promise<void> {
    await this.paymentService.recordSepayTransaction(this.parse(body));
    res.status(HttpStatus.OK).json(SEPAY_SUCCESS_BODY);
  }

  private parse(body: unknown): SepayTransaction {
    try {
      return parseSepayWebhook(body);
    } catch (error) {
      if (error instanceof InvalidSepayPayloadError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
