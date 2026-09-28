import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityModule } from '../activity/activity.module';
import { LaSoHistoryEntity } from './entities/la-so-history.entity';
import { LaSoHistoryController } from './la-so-history.controller';
import { LaSoHistoryService } from './la-so-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([LaSoHistoryEntity]), ActivityModule],
  controllers: [LaSoHistoryController],
  providers: [LaSoHistoryService],
})
export class LaSoModule {}
