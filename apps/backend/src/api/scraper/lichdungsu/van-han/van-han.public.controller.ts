import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { VanHanService } from './van-han.service';

@Controller('van-han')
export class VanHanPublicController {
  constructor(private readonly vanHan: VanHanService) {}

  @Get()
  async listByYear(@Query('year') year?: string) {
    const parsed = Number(year);
    if (!Number.isInteger(parsed)) {
      throw new BadRequestException('year must be an integer, e.g. ?year=2026');
    }
    return this.vanHan.findByYear(parsed);
  }
}
