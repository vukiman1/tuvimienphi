import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VanHanEntity } from './entities/van-han.entity';
import { VanHanController } from './van-han.controller';
import { VanHanService } from './van-han.service';

@Module({
  imports: [TypeOrmModule.forFeature([VanHanEntity])],
  controllers: [VanHanController],
  providers: [VanHanService],
  exports: [VanHanService],
})
export class VanHanModule {}
