import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, In, type EntityManager } from 'typeorm';
import { ActivityLogService } from '../activity/activity-log.service';
import { ChapterCreditsService } from '../credits/chapter-credits.service';
import { CreditsEvent } from '../credits/credits-event';
import { findPaymentCode } from '../credits/payment-code';
import { UserEntity } from '../user/entities/user.entity';
import { PaymentEntity } from './entities/payment.entity';
import { PaymentInsertResultError } from './payment.errors';
import { PaymentStatus, UnmatchedReason } from './payment-status.enum';
import type {
  AssignPaymentCommand,
  ListPaymentsQuery,
  PaymentPageResult,
  PaymentSummary,
} from './payment-summary';
import { parseSepayTransactionDate } from './sepay/sepay-transaction-date';
import type { SepayTransaction } from './sepay/sepay-webhook.schema';

const INCOMING_TRANSFER_TYPE = 'in';
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const ALREADY_CREDITED_MESSAGE = 'Giao dịch này đã được cộng rồi.';
const ASSIGN_USER_NOT_FOUND_MESSAGE = 'Không tìm thấy người dùng với email này.';

interface CreditedPayment {
  readonly paymentId: string;
  readonly userId: string;
  readonly amountVnd: number;
  readonly credits: number;
}

interface PaymentOutcome {
  readonly status: PaymentStatus;
  readonly userId: string | null;
  readonly credits: number;
  readonly unmatchedReason: UnmatchedReason | null;
}

@Injectable()
export class PaymentService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly chapterCredits: ChapterCreditsService,
    private readonly activityLog: ActivityLogService,
  ) {}

  async recordSepayTransaction(transaction: SepayTransaction): Promise<void> {
    if (transaction.transferType !== INCOMING_TRANSFER_TYPE) return;

    const credited = await this.dataSource.transaction((manager) =>
      this.storeAndCredit(manager, transaction),
    );
    if (!credited) return;

    this.activityLog.record(CreditsEvent.PURCHASED, {
      userId: credited.userId,
      metadata: {
        paymentId: credited.paymentId,
        amountVnd: credited.amountVnd,
        credits: credited.credits,
      },
    });
  }

  async list(query: ListPaymentsQuery): Promise<PaymentPageResult> {
    const take = query.limit ?? DEFAULT_PAGE_SIZE;
    const skip = ((query.page ?? DEFAULT_PAGE) - 1) * take;
    const where = query.status ? { status: query.status } : {};

    const [payments, total] = await this.dataSource.getRepository(PaymentEntity).findAndCount({
      where,
      order: { transactionAt: 'DESC', id: 'DESC' },
      skip,
      take,
    });
    const emails = await this.emailsById(payments);

    return {
      total,
      payments: payments.map((payment) =>
        this.toSummary(payment, payment.userId ? (emails.get(payment.userId) ?? null) : null),
      ),
    };
  }

  async assign(command: AssignPaymentCommand, adminEmail: string): Promise<PaymentSummary> {
    const { payment, userId, userEmail } = await this.dataSource.transaction((manager) =>
      this.assignWithinTransaction(manager, command),
    );

    this.activityLog.record(CreditsEvent.PURCHASED, {
      userId,
      actorEmail: adminEmail,
      metadata: {
        paymentId: payment.id,
        amountVnd: payment.amountVnd,
        credits: command.credits,
        isManualAssignment: true,
      },
    });
    return this.toSummary(payment, userEmail);
  }

  private async assignWithinTransaction(
    manager: EntityManager,
    { paymentId, userEmail, credits }: AssignPaymentCommand,
  ): Promise<{ payment: PaymentEntity; userId: string; userEmail: string }> {
    const email = userEmail.trim().toLowerCase();
    const user = await manager.findOne(UserEntity, {
      where: { email },
      select: { id: true },
    });
    if (!user) throw new NotFoundException(ASSIGN_USER_NOT_FOUND_MESSAGE);

    const result = await manager
      .createQueryBuilder()
      .update(PaymentEntity)
      .set({ status: PaymentStatus.Credited, userId: user.id, creditsGranted: credits })
      .where('id = :paymentId AND status = :unmatched', {
        paymentId,
        unmatched: PaymentStatus.Unmatched,
      })
      .execute();
    if (!result.affected) throw new BadRequestException(ALREADY_CREDITED_MESSAGE);

    await this.chapterCredits.grant(user.id, credits, manager);
    const payment = await manager.findOneOrFail(PaymentEntity, { where: { id: paymentId } });
    return { payment, userId: user.id, userEmail: email };
  }

  private async emailsById(payments: readonly PaymentEntity[]): Promise<Map<string, string>> {
    const userIds = payments.flatMap((payment) => (payment.userId ? [payment.userId] : []));
    if (userIds.length === 0) return new Map();

    const users = await this.dataSource.getRepository(UserEntity).find({
      where: { id: In(userIds) },
      select: { id: true, email: true },
    });
    return new Map(users.map((user) => [user.id, user.email]));
  }

  private toSummary(payment: PaymentEntity, userEmail: string | null): PaymentSummary {
    return {
      id: payment.id,
      amountVnd: payment.amountVnd,
      content: payment.content,
      referenceCode: payment.referenceCode,
      status: payment.status,
      unmatchedReason: payment.unmatchedReason,
      creditsGranted: payment.creditsGranted,
      suggestedCredits: this.creditsFor(payment.amountVnd),
      userEmail,
      transactionAt: payment.transactionAt.toISOString(),
    };
  }

  private async storeAndCredit(
    manager: EntityManager,
    transaction: SepayTransaction,
  ): Promise<CreditedPayment | null> {
    const outcome = await this.resolveOutcome(manager, transaction);
    const paymentId = await this.insertPayment(manager, transaction, outcome);
    if (!paymentId) return null;
    if (outcome.status !== PaymentStatus.Credited || !outcome.userId) return null;

    await this.chapterCredits.grant(outcome.userId, outcome.credits, manager);
    return {
      paymentId,
      userId: outcome.userId,
      amountVnd: transaction.transferAmount,
      credits: outcome.credits,
    };
  }

  private async resolveOutcome(
    manager: EntityManager,
    transaction: SepayTransaction,
  ): Promise<PaymentOutcome> {
    const paymentCode = findPaymentCode(transaction.content);
    if (!paymentCode) return this.unmatched(null, UnmatchedReason.NoCode);

    const user = await manager.findOne(UserEntity, {
      where: { paymentCode },
      select: { id: true },
    });
    if (!user) return this.unmatched(null, UnmatchedReason.UnknownCode);

    const credits = this.creditsFor(transaction.transferAmount);
    if (credits <= 0) return this.unmatched(user.id, UnmatchedReason.AmountTooLow);

    return {
      status: PaymentStatus.Credited,
      userId: user.id,
      credits,
      unmatchedReason: null,
    };
  }

  private unmatched(userId: string | null, reason: UnmatchedReason): PaymentOutcome {
    return { status: PaymentStatus.Unmatched, userId, credits: 0, unmatchedReason: reason };
  }

  private creditsFor(amountVnd: number): number {
    const priceVnd = this.configService.getOrThrow<number>('payment.priceVnd');
    const creditsPerPayment = this.configService.getOrThrow<number>('payment.creditsPerPayment');
    return Math.floor(amountVnd / priceVnd) * creditsPerPayment;
  }

  private async insertPayment(
    manager: EntityManager,
    transaction: SepayTransaction,
    outcome: PaymentOutcome,
  ): Promise<string | null> {
    const result = await manager
      .createQueryBuilder()
      .insert()
      .into(PaymentEntity)
      .values({
        sepayTransactionId: String(transaction.id),
        userId: outcome.userId,
        amountVnd: transaction.transferAmount,
        content: transaction.content,
        referenceCode: transaction.referenceCode,
        status: outcome.status,
        creditsGranted: outcome.credits,
        unmatchedReason: outcome.unmatchedReason,
        transactionAt: parseSepayTransactionDate(transaction.transactionDate),
      })
      .orIgnore()
      .returning('id')
      .execute();

    const rows: unknown = result.raw;
    if (!Array.isArray(rows)) throw new PaymentInsertResultError(transaction.id);
    if (rows.length === 0) return null;
    const insertedId = (rows[0] as { id?: unknown }).id;
    if (typeof insertedId !== 'string') throw new PaymentInsertResultError(transaction.id);
    return insertedId;
  }
}
