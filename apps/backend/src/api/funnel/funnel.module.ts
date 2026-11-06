import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@org/backend-redis';
import { FunnelDailyEntity } from './entities/funnel-daily.entity';
import { FunnelDailyStore } from './funnel-daily.store';
import { FunnelKeyHasher } from './funnel-key-hasher';
import { FunnelService } from './funnel.service';

const funnelDailyRepository = TypeOrmModule.forFeature([FunnelDailyEntity]);

@Module({
  imports: [funnelDailyRepository, RedisModule],
  providers: [FunnelKeyHasher, FunnelDailyStore, FunnelService],
  exports: [FunnelService, funnelDailyRepository],
})
export class FunnelModule {}
