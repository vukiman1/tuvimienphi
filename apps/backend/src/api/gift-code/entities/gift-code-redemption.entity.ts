import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { GiftCodeEntity } from './gift-code.entity';

@Entity('gift_code_redemption')
export class GiftCodeRedemptionEntity {
  @PrimaryColumn({
    name: 'gift_code_id',
    type: 'uuid',
    primaryKeyConstraintName: 'PK_gift_code_redemption',
  })
  giftCodeId!: string;

  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => GiftCodeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'gift_code_id',
    foreignKeyConstraintName: 'FK_gift_code_redemption_gift_code_id',
  })
  giftCode?: GiftCodeEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'FK_gift_code_redemption_user_id' })
  user?: UserEntity;

  @CreateDateColumn({ name: 'redeemed_at', type: 'timestamptz' })
  redeemedAt!: Date;
}
