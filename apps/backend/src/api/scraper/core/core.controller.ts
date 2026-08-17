import { BadRequestException, Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategyKey } from '@org/backend-constants';
import { ProxyService } from './proxy.service';

@UseGuards(AuthGuard(StrategyKey.JWT.USER))
@Controller('scraper')
export class ScraperCoreController {
  constructor(private readonly proxies: ProxyService) {}

  @Post('proxies')
  async addProxies(@Body('proxies') proxies?: unknown) {
    const list = Array.isArray(proxies)
      ? proxies.filter(
          (proxy): proxy is string => typeof proxy === 'string' && proxy.trim().length > 0,
        )
      : [];

    if (list.length === 0) {
      throw new BadRequestException('proxies must be a non-empty array of "host:port" strings');
    }

    const size = await this.proxies.add(...list);
    return { poolSize: size };
  }
}
