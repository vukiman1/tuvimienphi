import { Injectable } from '@nestjs/common';
import { BrowserService } from '../../core/browser.service';
import {
  CONTENT_READY_SELECTOR,
  type VanHanAgeReading,
  type VanHanContent,
  vanHanUrl,
} from './van-han.constants';

const NAV_TIMEOUT_MS = 30_000;
const CONTENT_TIMEOUT_MS = 30_000;

function titleCase(value: string): string {
  return value.toLowerCase().replace(/(^|\s)(\p{L})/gu, (_, sep, char) => sep + char.toUpperCase());
}

function parseAgeReading(label: string, body: string): VanHanAgeReading {
  const yearMatch = label.match(/Sinh năm\s+(\d{4})/i);
  const menhMatch = label.match(/\(([^)]+)\)/);
  const canChi = label.split(/\s+Sinh\b/)[0].trim();

  const femaleIndex = body.search(/Nữ\s+\d/);
  const male = (femaleIndex >= 0 ? body.slice(0, femaleIndex) : body).trim();
  const female = femaleIndex >= 0 ? body.slice(femaleIndex).trim() : '';

  return {
    birthYear: yearMatch ? Number(yearMatch[1]) : 0,
    canChi: titleCase(canChi),
    menh: titleCase(menhMatch?.[1]?.trim() ?? ''),
    male,
    female,
  };
}

@Injectable()
export class VanHanScraper {
  constructor(private readonly browser: BrowserService) {}

  async scrapeVanHan(
    order: number,
    slug: string,
    chiName: string,
    proxy: string | null,
  ): Promise<VanHanContent> {
    const url = vanHanUrl(order, slug);

    const { header, items, ratings } = await this.browser.withPage(proxy, async (page) => {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
      await page.waitForSelector(CONTENT_READY_SELECTOR, { timeout: CONTENT_TIMEOUT_MS });

      const header = await page.$eval('html', (root) => {
        const norm = (value: string | null | undefined) =>
          (value ?? '').replace(/\s+/g, ' ').trim();

        const title = norm(root.querySelector('h1')?.textContent);
        const yearMatch = title.match(/năm\s+(\d{4})/i);
        const year = yearMatch ? Number(yearMatch[1]) : 0;

        const bornText = norm(root.querySelector('.tuoi_danhsach')?.textContent);
        const bornYears = bornText.match(/\b(?:19|20)\d{2}\b/g)?.map(Number) ?? [];

        const luuNien = norm(root.querySelector('.luu_nien_van_the .content_dtls')?.textContent);

        return { title, year, bornYears, luuNien };
      });

      const items = await page.$$eval('li', (nodes) => {
        const norm = (value: string | null | undefined) =>
          (value ?? '').replace(/\s+/g, ' ').trim();
        return nodes
          .filter((li) => li.querySelector('h3.border-none') && li.querySelector('div.cont'))
          .map((li) => ({
            label: norm(li.querySelector('h3')?.textContent),
            body: norm(li.querySelector('div.cont')?.textContent),
          }));
      });

      const ratings = await page.$$eval('.vote', (nodes) =>
        nodes.map((vote) => vote.querySelectorAll('.fa-star').length),
      );

      return { header, items, ratings };
    });

    const isAspect = (label: string) => label === label.toUpperCase();
    const aspectItems = items.filter((item) => isAspect(item.label));
    const ageItems = items.filter((item) => !isAspect(item.label));

    if (!header.year || aspectItems.length === 0) {
      throw new Error(`Vận hạn content incomplete for ${url} (year=${header.year})`);
    }

    return {
      ...header,
      luanGiai: aspectItems.map((item, index) => ({
        aspect: titleCase(item.label),
        rating: ratings[index] ?? 0,
        body: item.body,
      })),
      tungTuoi: ageItems
        .map((item) => parseAgeReading(item.label, item.body))
        .filter((age) => age.canChi.endsWith(chiName)),
    };
  }
}
