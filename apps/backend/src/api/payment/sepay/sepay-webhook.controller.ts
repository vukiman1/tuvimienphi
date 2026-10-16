import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { InvalidSepayPayloadError } from '../payment.errors';
import { PaymentService } from '../payment.service';
import { SepayApiKeyGuard } from './sepay-api-key.guard';
import { parseSepayWebhook, type SepayTransaction } from './sepay-webhook.schema';

interface SepayWebhookAck {
  readonly success: true;
}

@Controller('payments/sepay')
export class SepayWebhookController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @SkipThrottle()
  @UseGuards(SepayApiKeyGuard)
  async receive(@Body() body: unknown): Promise<SepayWebhookAck> {
    await this.paymentService.recordSepayTransaction(this.parse(body));
    return { success: true };
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
