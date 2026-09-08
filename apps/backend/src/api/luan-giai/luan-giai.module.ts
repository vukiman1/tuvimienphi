import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@org/backend-redis';
import { AiModule } from '../../ai/ai.module';
import { ChapterQuotaService } from './chapter-quota.service';
import { LuanGiaiChapterEntity } from './entities/luan-giai-chapter.entity';
import { LUAN_GIAI_QUEUE } from './luan-giai.constants';
import { LuanGiaiController } from './luan-giai.controller';
import { LuanGiaiService } from './luan-giai.service';
import { ThanCuGenerator } from './than-cu.generator';

/**
 * Cả API lẫn worker đều nạp module này. Chỗ khác nhau duy nhất là `LuanGiaiProcessor` — nó chỉ được
 * đăng ký ở `WorkerModule`, vì hàm serverless của Vercel không sống đủ lâu để tiêu thụ hàng đợi.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([LuanGiaiChapterEntity]),
    BullModule.registerQueue({ name: LUAN_GIAI_QUEUE }),
    RedisModule,
    AiModule,
  ],
  controllers: [LuanGiaiController],
  providers: [LuanGiaiService, ChapterQuotaService, ThanCuGenerator],
  exports: [LuanGiaiService, ThanCuGenerator],
})
export class LuanGiaiModule {}
