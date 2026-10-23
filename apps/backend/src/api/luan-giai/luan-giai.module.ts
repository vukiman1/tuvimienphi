import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../../ai/ai.module';
import { CreditsModule } from '../credits/credits.module';
import { ChapterGenerator } from './generation/chapter-generator';
import { LuanGiaiChapterEntity } from './entities/luan-giai-chapter.entity';
import { LuanGiaiController } from './luan-giai.controller';
import { LuanGiaiService } from './luan-giai.service';

@Module({
  imports: [TypeOrmModule.forFeature([LuanGiaiChapterEntity]), AiModule, CreditsModule],
  controllers: [LuanGiaiController],
  providers: [LuanGiaiService, ChapterGenerator],
  exports: [LuanGiaiService],
})
export class LuanGiaiModule {}
