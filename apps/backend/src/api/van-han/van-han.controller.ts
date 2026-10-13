import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { VanHanService, type VanHanCurrentYear } from './van-han.service';
import { VanHanEntity } from './entities/van-han.entity';

@Controller('van-han')
export class VanHanController {
  constructor(private readonly vanHan: VanHanService) {}

  @Get('current')
  async current(): Promise<VanHanCurrentYear | null> {
    return this.vanHan.findCurrent();
  }

  @Get()
  async listByYear(@Query('year') year?: string): Promise<VanHanEntity[]> {
    const parsed = Number(year);
    if (!Number.isInteger(parsed)) {
      throw new BadRequestException('year must be an integer, e.g. ?year=2026');
    }
    return this.vanHan.findPublishedByYear(parsed);
  }
}
