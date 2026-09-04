import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategyKey } from '@org/backend-constants';
import { User } from '@org/backend-decorators';
import type {
  DeleteLaSoHistoryResponse,
  LaSoHistoryListResponse,
  RecordLaSoHistoryResponse,
} from '@org/shared-contracts';
import { UserEntity } from '../user/entities/user.entity';
import { BirthInputDto, SyncLaSoHistoryDto } from './dto/birth-input.dto';
import { LaSoHistoryService } from './la-so-history.service';

@Controller('la-so/history')
@UseGuards(AuthGuard(StrategyKey.JWT.USER))
export class LaSoHistoryController {
  constructor(private readonly history: LaSoHistoryService) {}

  @Get()
  async list(@User() user: UserEntity): Promise<LaSoHistoryListResponse> {
    return { entries: await this.history.list(user.id) };
  }

  @Post()
  @HttpCode(200)
  async record(
    @User() user: UserEntity,
    @Body() body: BirthInputDto,
  ): Promise<RecordLaSoHistoryResponse> {
    return { entry: await this.history.record(user.id, body) };
  }

  @Post('sync')
  @HttpCode(200)
  async sync(
    @User() user: UserEntity,
    @Body() body: SyncLaSoHistoryDto,
  ): Promise<LaSoHistoryListResponse> {
    return { entries: await this.history.sync(user.id, body.entries) };
  }

  @Delete(':birthKey')
  async remove(
    @User() user: UserEntity,
    @Param('birthKey') birthKey: string,
  ): Promise<DeleteLaSoHistoryResponse> {
    await this.history.remove(user.id, birthKey);
    return { message: 'Đã xoá lá số khỏi lịch sử.' };
  }
}
