import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategyKey } from '@org/backend-constants';
import { User } from '@org/backend-decorators';
import type { LuanGiaiChapterResponse, LuanGiaiChapterStatusMap } from '@org/shared-contracts';
import { FunnelService } from '../funnel/funnel.service';
import { UserEntity } from '../user/entities/user.entity';
import { LuanGiaiRequestDto } from './dto/luan-giai-request.dto';
import { LuanGiaiService } from './luan-giai.service';

const VIEW_YEAR_QUERY = 'viewYear';

@Controller('luan-giai')
export class LuanGiaiController {
  constructor(
    private readonly luanGiai: LuanGiaiService,
    private readonly funnel: FunnelService,
  ) {}

  @Get(':birthKey')
  status(
    @Param('birthKey') birthKey: string,
    @Query(VIEW_YEAR_QUERY, new ParseIntPipe({ optional: true })) viewYear?: number,
  ): Promise<LuanGiaiChapterStatusMap> {
    void this.funnel.recordCast(birthKey);
    return this.luanGiai.status(birthKey, viewYear);
  }

  @Get(':birthKey/:order')
  read(
    @Param('birthKey') birthKey: string,
    @Param('order') order: string,
    @Query(VIEW_YEAR_QUERY, new ParseIntPipe({ optional: true })) viewYear?: number,
  ): Promise<LuanGiaiChapterResponse> {
    return this.luanGiai.read(birthKey, order, viewYear);
  }

  @Post(':order')
  @HttpCode(200)
  @UseGuards(AuthGuard(StrategyKey.JWT.USER))
  request(
    @User() user: UserEntity,
    @Param('order') order: string,
    @Body() body: LuanGiaiRequestDto,
  ): Promise<LuanGiaiChapterResponse> {
    const { viewYear, ...birth } = body;
    return this.luanGiai.request(user.id, birth, order, viewYear);
  }
}
