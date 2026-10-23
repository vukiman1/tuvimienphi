import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategyKey } from '@org/backend-constants';
import { User } from '@org/backend-decorators';
import type { LuanGiaiChapterResponse, LuanGiaiChapterStatusMap } from '@org/shared-contracts';
import { BirthInputDto } from '../la-so/dto/birth-input.dto';
import { UserEntity } from '../user/entities/user.entity';
import { LuanGiaiService } from './luan-giai.service';

@Controller('luan-giai')
export class LuanGiaiController {
  constructor(private readonly luanGiai: LuanGiaiService) {}

  @Get(':birthKey')
  status(@Param('birthKey') birthKey: string): Promise<LuanGiaiChapterStatusMap> {
    return this.luanGiai.status(birthKey);
  }

  @Get(':birthKey/:order')
  read(
    @Param('birthKey') birthKey: string,
    @Param('order') order: string,
  ): Promise<LuanGiaiChapterResponse> {
    return this.luanGiai.read(birthKey, order);
  }

  @Post(':order')
  @HttpCode(200)
  @UseGuards(AuthGuard(StrategyKey.JWT.USER))
  request(
    @User() user: UserEntity,
    @Param('order') order: string,
    @Body() body: BirthInputDto,
  ): Promise<LuanGiaiChapterResponse> {
    return this.luanGiai.request(user.id, body, order);
  }
}
