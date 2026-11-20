import { CONTENT_SLUG_MAX_LENGTH } from '@org/shared-contracts';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';

@Entity('learning_progress')
export class LearningProgressEntity {
  @PrimaryColumn({
    name: 'user_id',
    type: 'uuid',
    primaryKeyConstraintName: 'PK_learning_progress',
  })
  userId!: string;

  @PrimaryColumn({
    name: 'lesson_slug',
    type: 'varchar',
    length: CONTENT_SLUG_MAX_LENGTH,
    primaryKeyConstraintName: 'PK_learning_progress',
  })
  lessonSlug!: string;

  @Column({ name: 'read_at', type: 'timestamptz', default: () => 'now()' })
  readAt!: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'FK_learning_progress_user_id' })
  user?: UserEntity;
}
