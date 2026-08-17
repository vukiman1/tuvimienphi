import { Module } from '@nestjs/common';
import { BrowserService } from './browser.service';
import { ProxyService } from './proxy.service';
import { ScraperCoreController } from './core.controller';

@Module({
  controllers: [ScraperCoreController],
  providers: [BrowserService, ProxyService],
  exports: [BrowserService, ProxyService],
})
export class ScraperCoreModule {}
