import type { QueryClient } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';
import type { VanHanCurrent } from '@org/shared-contracts';
import type { ZodiacChi } from '@/lib/zodiac-icons';
import { vanHanQueries } from '@/services/van-han-service';
import { parseVanHanYear, zodiacChiFromVanHanSlug } from './van-han-paths';

interface VanHanYearPageParams {
  readonly year: string;
  readonly slug: string;
}

export interface VanHanYearPage {
  readonly chi: ZodiacChi;
  readonly year: number;
  readonly published: VanHanCurrent;
  readonly publishedYears: readonly number[];
}

export async function loadVanHanYearPage(
  queryClient: QueryClient,
  params: VanHanYearPageParams,
): Promise<VanHanYearPage> {
  const year = parseVanHanYear(params.year);
  const chi = zodiacChiFromVanHanSlug(params.slug);
  if (year === undefined || !chi) throw notFound();
  const [published, publishedYears] = await Promise.all([
    queryClient.ensureQueryData(vanHanQueries.publishedYear(year)),
    queryClient.ensureQueryData(vanHanQueries.publishedYears()),
  ]);
  if (!published) throw notFound();
  return { chi, year, published, publishedYears };
}
