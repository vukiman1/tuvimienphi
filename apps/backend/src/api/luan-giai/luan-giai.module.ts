import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@org/backend-redis';
import { AiModule } from '../../ai/ai.module';
import { ChapterQuotaService } from './chapter-quota.service';
import { LuanGiaiChapterEntity } from './entities/luan-giai-chapter.entity';
import { LuanGiaiController } from './luan-giai.controller';
import { LuanGiaiService } from './luan-giai.service';
import { ThanCuGenerator } from './than-cu.generator';

/**
 * Sinh luận giải chạy ngay trong request, không qua hàng đợi. Đổi sang hàng đợi sau này chỉ là thêm
 * một processor và đổi thân `LuanGiaiService.request` — `ThanCuGenerator` không biết gì về hai bên.
 */
@Module({
  imports: [TypeOrmModule.forFeature([LuanGiaiChapterEntity]), RedisModule, AiModule],
  controllers: [LuanGiaiController],
  providers: [LuanGiaiService, ChapterQuotaService, ThanCuGenerator],
  exports: [LuanGiaiService, ThanCuGenerator],
})
export class LuanGiaiModule {}
