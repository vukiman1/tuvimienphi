import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../../ai/ai.module';
import { CreditsModule } from '../credits/credits.module';
import { ChapterGenerator } from './chapter-generator';
import { LuanGiaiChapterEntity } from './entities/luan-giai-chapter.entity';
import { LuanGiaiController } from './luan-giai.controller';
import { LuanGiaiService } from './luan-giai.service';

/**
 * Sinh luận giải chạy ngay trong request, không qua hàng đợi. Đổi sang hàng đợi sau này chỉ là thêm
 * một processor và đổi thân `LuanGiaiService.request` — generator của từng chương không biết gì về
 * hai bên.
 */
@Module({
  imports: [TypeOrmModule.forFeature([LuanGiaiChapterEntity]), AiModule, CreditsModule],
  controllers: [LuanGiaiController],
  providers: [LuanGiaiService, ChapterGenerator],
  exports: [LuanGiaiService],
})
export class LuanGiaiModule {}
