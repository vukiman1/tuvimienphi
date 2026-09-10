import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategyKey } from '@org/backend-constants';
import { SaveVanHanDto } from './dto/save-van-han.dto';
import { VanHanService } from './van-han.service';
import { VanHanEntity } from './entities/van-han.entity';

@Controller('van-han')
export class VanHanController {
  constructor(private readonly vanHan: VanHanService) {}

  @Get()
  async listByYear(@Query('year') year?: string): Promise<VanHanEntity[]> {
    const parsed = Number(year);
    if (!Number.isInteger(parsed)) {
      throw new BadRequestException('year must be an integer, e.g. ?year=2026');
    }
    return this.vanHan.findByYear(parsed);
  }

  /** Người soạn nhập một bản vận hạn từ dashboard. Nhập lại cùng con giáp và năm thì ghi đè. */
  @Post()
  @HttpCode(200)
  @UseGuards(AuthGuard(StrategyKey.JWT.USER))
  async save(@Body() body: SaveVanHanDto): Promise<void> {
    await this.vanHan.save(body);
  }
}
