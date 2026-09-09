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

  /** Mở trang thì hỏi một lượt: chương nào đã có bài, chương nào còn khoá. */
  @Get(':birthKey')
  status(@Param('birthKey') birthKey: string): Promise<LuanGiaiChapterStatusMap> {
    return this.luanGiai.status(birthKey);
  }

  /** Client hỏi lại đường này khi đang chờ. Mở cho khách: bài đã sinh thì ai xem lá số đó cũng đọc được. */
  @Get(':birthKey/:order')
  read(
    @Param('birthKey') birthKey: string,
    @Param('order') order: string,
  ): Promise<LuanGiaiChapterResponse> {
    return this.luanGiai.read(birthKey, order);
  }

  /** Xin sinh chương. Chỉ đường này tiêu tiền nên chỉ đường này cần đăng nhập và bị trừ suất. */
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
