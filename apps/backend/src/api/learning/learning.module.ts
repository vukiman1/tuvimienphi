import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningProgressEntity } from './adapters/learning-progress.entity';
import { TypeormLearningProgressStore } from './adapters/typeorm-learning-progress.store';
import { LearningProgressController } from './learning-progress.controller';
import { LearningProgressService } from './learning-progress.service';
import { LearningProgressStore } from './port/learning-progress.store';

@Module({
  imports: [TypeOrmModule.forFeature([LearningProgressEntity])],
  controllers: [LearningProgressController],
  providers: [
    LearningProgressService,
    { provide: LearningProgressStore, useClass: TypeormLearningProgressStore },
  ],
})
export class LearningModule {}
