import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentStatus, UnmatchedReason } from '../payment-status.enum';

@Entity('payment')
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'sepay_transaction_id', type: 'bigint', unique: true })
  sepayTransactionId!: string;

  @Index('idx_payment_user_id')
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null;

  @Column({ name: 'amount_vnd', type: 'integer' })
  amountVnd!: number;

  @Column({ type: 'text' })
  content!: string;

  @Column({ name: 'reference_code', type: 'varchar', length: 64 })
  referenceCode!: string;

  @Column({ type: 'varchar', length: 12 })
  status!: PaymentStatus;

  @Column({ name: 'credits_granted', type: 'integer', default: 0 })
  creditsGranted!: number;

  @Column({ name: 'unmatched_reason', type: 'varchar', length: 16, nullable: true })
  unmatchedReason!: UnmatchedReason | null;

  @Column({ name: 'transaction_at', type: 'timestamptz' })
  transactionAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
