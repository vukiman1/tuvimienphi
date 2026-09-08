import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@org/backend-database';
import configuration from '@org/backend-config';
import { LuanGiaiModule } from '../api/luan-giai/luan-giai.module';
import { LuanGiaiProcessor } from '../api/luan-giai/luan-giai.processor';
import { bullRootImport, CONFIG_ROOT_OPTIONS } from '../app/bull-root';

/**
 * Tiến trình tiêu thụ hàng đợi. Không express, không static, không throttler — worker không nhận
 * request nào, nạp thêm chỉ tổ kéo phụ thuộc và mở rộng bề mặt lỗi.
 *
 * `LuanGiaiProcessor` chỉ đăng ký ở đây chứ không ở `AppModule`: API chạy trên hàm serverless của
 * Vercel, mà một hàm serverless không sống đủ lâu để giữ worker BullMQ.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ ...CONFIG_ROOT_OPTIONS, load: [configuration] }),
    bullRootImport(),
    DatabaseModule,
    LuanGiaiModule,
  ],
  providers: [LuanGiaiProcessor],
})
export class WorkerModule {}
