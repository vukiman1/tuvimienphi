import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityModule } from '../activity/activity.module';
import { CreditsModule } from '../credits/credits.module';
import { PaymentEntity } from './entities/payment.entity';
import { PaymentService } from './payment.service';
import { SepayApiKeyGuard } from './sepay/sepay-api-key.guard';
import { SepayWebhookController } from './sepay/sepay-webhook.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity]), CreditsModule, ActivityModule],
  controllers: [SepayWebhookController],
  providers: [PaymentService, SepayApiKeyGuard],
  exports: [PaymentService],
})
export class PaymentModule {}
