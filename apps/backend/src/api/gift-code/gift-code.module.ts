import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityModule } from '../activity/activity.module';
import { CreditsModule } from '../credits/credits.module';
import { GiftCodeEntity } from './entities/gift-code.entity';
import { GiftCodeRedemptionEntity } from './entities/gift-code-redemption.entity';
import { GiftCodeController } from './gift-code.controller';
import { GiftCodeService } from './gift-code.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([GiftCodeEntity, GiftCodeRedemptionEntity]),
    CreditsModule,
    ActivityModule,
  ],
  controllers: [GiftCodeController],
  providers: [GiftCodeService],
  exports: [GiftCodeService],
})
export class GiftCodeModule {}
