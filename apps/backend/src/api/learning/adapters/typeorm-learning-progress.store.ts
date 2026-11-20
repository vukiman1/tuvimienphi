import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { planProgressSave, ProgressSaveKind } from '../learning-progress-plan';
import { LearningProgressStore, ProgressSaveOutcome } from '../port/learning-progress.store';
import { UserEntity } from '../../user/entities/user.entity';
import { LearningProgressEntity } from './learning-progress.entity';

@Injectable()
export class TypeormLearningProgressStore extends LearningProgressStore {
  constructor(private readonly dataSource: DataSource) {
    super();
  }

  async listSlugs(userId: string): Promise<readonly string[]> {
    const rows = await this.dataSource.getRepository(LearningProgressEntity).find({
      where: { userId },
      order: { readAt: 'ASC', lessonSlug: 'ASC' },
    });

    return rows.map((row) => row.lessonSlug);
  }

  saveWithinLimit(
    userId: string,
    slugs: readonly string[],
    maxRows: number,
  ): Promise<ProgressSaveOutcome> {
    return this.dataSource.transaction((manager) =>
      this.saveWithinTransaction(manager, userId, slugs, maxRows),
    );
  }

  private async saveWithinTransaction(
    manager: EntityManager,
    userId: string,
    slugs: readonly string[],
    maxRows: number,
  ): Promise<ProgressSaveOutcome> {
    await manager
      .getRepository(UserEntity)
      .createQueryBuilder('user')
      .setLock('for_no_key_update')
      .where('user.id = :userId', { userId })
      .getOne();

    const stored = await manager.getRepository(LearningProgressEntity).find({ where: { userId } });

    const plan = planProgressSave(new Set(stored.map((row) => row.lessonSlug)), slugs, maxRows);

    if (plan.kind === ProgressSaveKind.OverLimit) {
      return ProgressSaveOutcome.OverLimit;
    }

    if (plan.kind === ProgressSaveKind.Insert) {
      await manager
        .createQueryBuilder()
        .insert()
        .into(LearningProgressEntity)
        .values(plan.slugs.map((slug) => ({ userId, lessonSlug: slug })))
        .orIgnore()
        .execute();
    }

    return ProgressSaveOutcome.Saved;
  }
}
