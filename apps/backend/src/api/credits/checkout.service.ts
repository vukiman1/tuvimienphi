import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type { CreditCheckout } from '@org/shared-contracts';
import { QueryFailedError, Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { PaymentCodeAllocationError } from './credits.errors';
import { generatePaymentCode, transferContentFor } from './payment-code';

const PAYMENT_CODE_ATTEMPTS = 5;
const UNIQUE_VIOLATION = '23505';
const CHECKOUT_CLOSED_MESSAGE = 'Chức năng nạp lượt đang tạm đóng.';

interface DriverError {
  readonly code?: string;
}

const isUniqueViolation = (error: unknown): boolean =>
  error instanceof QueryFailedError && (error.driverError as DriverError).code === UNIQUE_VIOLATION;

@Injectable()
export class CheckoutService {
  constructor(
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    private readonly configService: ConfigService,
  ) {}

  async checkoutFor(userId: string): Promise<CreditCheckout> {
    const bankCode = this.configService.get<string>('payment.bankCode') ?? '';
    const accountNumber = this.configService.get<string>('payment.accountNumber') ?? '';
    if (!bankCode || !accountNumber) {
      throw new ServiceUnavailableException(CHECKOUT_CLOSED_MESSAGE);
    }

    const amountVnd = this.configService.getOrThrow<number>('payment.priceVnd');
    const transferContent = transferContentFor(await this.paymentCodeFor(userId));
    const qrQuery = new URLSearchParams({
      acc: accountNumber,
      bank: bankCode,
      amount: String(amountVnd),
      des: transferContent,
    });

    return {
      qrImageUrl: `${this.configService.getOrThrow<string>('payment.qrImageBaseUrl')}?${qrQuery}`,
      bankCode,
      accountNumber,
      accountName: this.configService.get<string>('payment.accountName') ?? '',
      amountVnd,
      transferContent,
      creditsPerPayment: this.configService.getOrThrow<number>('payment.creditsPerPayment'),
    };
  }

  private async paymentCodeFor(userId: string): Promise<string> {
    const existingCode = await this.readPaymentCode(userId);
    if (existingCode) return existingCode;

    for (let attempt = 0; attempt < PAYMENT_CODE_ATTEMPTS; attempt++) {
      try {
        await this.users
          .createQueryBuilder()
          .update(UserEntity)
          .set({ paymentCode: generatePaymentCode() })
          .where('id = :userId AND payment_code IS NULL', { userId })
          .execute();
      } catch (error) {
        if (isUniqueViolation(error)) continue;
        throw error;
      }
      const assignedCode = await this.readPaymentCode(userId);
      if (assignedCode) return assignedCode;
    }
    throw new PaymentCodeAllocationError(userId);
  }

  private async readPaymentCode(userId: string): Promise<string | null> {
    const user = await this.users.findOne({
      where: { id: userId },
      select: { id: true, paymentCode: true },
    });
    return user?.paymentCode ?? null;
  }
}
