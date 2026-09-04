import { BaseEntity } from '@org/backend-base';
import { CalendarType, Gender } from '@org/shared-contracts';
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';

/**
 * A chart the user has opened. Only the birth details are kept — the chart itself is derived from
 * them, so storing it would freeze old rows against every later fix to the casting rules.
 */
@Entity('la_so_history')
@Unique('UQ_la_so_history_user_birth_key', ['userId', 'birthKey'])
@Index('idx_la_so_history_user_viewed_at', ['userId', 'viewedAt'])
export class LaSoHistoryEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'birth_key', type: 'varchar', length: 40 })
  birthKey!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 60, nullable: true })
  fullName!: string | null;

  @Column({ name: 'day', type: 'smallint' })
  day!: number;

  @Column({ name: 'month', type: 'smallint' })
  month!: number;

  @Column({ name: 'year', type: 'smallint' })
  year!: number;

  @Column({ name: 'calendar', type: 'varchar', length: 10 })
  calendar!: CalendarType;

  @Column({ name: 'hour_index', type: 'smallint' })
  hourIndex!: number;

  @Column({ name: 'gender', type: 'varchar', length: 5 })
  gender!: Gender;

  @Column({ name: 'viewed_at', type: 'timestamptz' })
  viewedAt!: Date;
}
