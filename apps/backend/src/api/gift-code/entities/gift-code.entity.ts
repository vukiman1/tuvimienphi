import { GIFT_CODE_MAX_LENGTH } from '@org/shared-contracts';
import { Check, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('gift_code')
@Check('CHK_gift_code_credits_positive', '"credits" > 0')
@Check('CHK_gift_code_max_redemptions_positive', '"max_redemptions" > 0')
export class GiftCodeEntity {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_gift_code_id' })
  id!: string;

  @Column({ type: 'varchar', length: GIFT_CODE_MAX_LENGTH, unique: true })
  code!: string;

  @Column({ type: 'integer' })
  credits!: number;

  @Column({ name: 'max_redemptions', type: 'integer' })
  maxRedemptions!: number;

  @Column({ name: 'redeemed_count', type: 'integer', default: 0 })
  redeemedCount!: number;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'created_by_email', type: 'varchar', length: 255 })
  createdByEmail!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
