import { Logger } from '@nestjs/common';
import type { ConGiapArticle, TuoiNamArticle } from '@org/shared-contracts';
import {
  CHI,
  conGiapSlug,
  TET_HUB_VIEW_YEAR,
  tuoiNamBirthYears,
  tuoiNamSlug,
} from '@org/shared-tu-vi';
import type { CliOptions } from './tet-hub-cli-options';
import { introExists, pageExists } from './tet-hub-files';
import {
  writeTetHubIntro,
  writeTetHubManifest,
  writeTetHubPage,
  type TetHubIntro,
} from './tet-hub-writer';

const INTRO_FAILURE_LABEL = 'hub-intro';

const logger = new Logger('GenerateTetHub');

export class UnknownTetHubPageError extends Error {
  constructor(readonly slug: string) {
    super(`no Tết hub page has the slug "${slug}"`);
    this.name = 'UnknownTetHubPageError';
  }
}

export interface PagePlan {
  readonly slug: string;
  readonly generate: () => Promise<TuoiNamArticle | ConGiapArticle>;
}

export interface TetHubGenerationRequest {
  readonly directory: string;
  readonly plans: readonly PagePlan[];
  readonly options: CliOptions;
  readonly generateIntro: () => Promise<TetHubIntro>;
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function selectPlans(
  plans: readonly PagePlan[],
  options: CliOptions,
  directory: string,
): readonly PagePlan[] {
  if (options.only !== null) {
    const match = plans.find((plan) => plan.slug === options.only);
    if (match === undefined) throw new UnknownTetHubPageError(options.only);
    return [match];
  }
  return options.isForced ? plans : plans.filter((plan) => !pageExists(directory, plan.slug));
}

async function writeManifestFromDisk(directory: string): Promise<void> {
  await writeTetHubManifest(directory, {
    viewYear: TET_HUB_VIEW_YEAR,
    conGiap: CHI.map((_, chi) => conGiapSlug(chi)).filter((slug) => pageExists(directory, slug)),
    tuoiNam: tuoiNamBirthYears()
      .map(tuoiNamSlug)
      .filter((slug) => pageExists(directory, slug)),
  });
}

async function runStep(label: string, work: () => Promise<void>): Promise<boolean> {
  try {
    await work();
    logger.log(`wrote ${label}`);
    return true;
  } catch (error) {
    logger.error(`failed ${label}: ${describeError(error)}`);
    return false;
  }
}

export async function runTetHubGeneration(
  request: TetHubGenerationRequest,
): Promise<readonly string[]> {
  const { directory, options, generateIntro } = request;
  const plans = selectPlans(request.plans, options, directory);
  const needsIntro = options.only === null && !introExists(directory);
  const failedSlugs: string[] = [];

  if (needsIntro) {
    const didWrite = await runStep(INTRO_FAILURE_LABEL, async () =>
      writeTetHubIntro(directory, await generateIntro()),
    );
    if (!didWrite) failedSlugs.push(INTRO_FAILURE_LABEL);
  }

  for (const plan of plans) {
    const didWrite = await runStep(plan.slug, async () =>
      writeTetHubPage(directory, await plan.generate()),
    );
    if (!didWrite) failedSlugs.push(plan.slug);
  }

  await writeManifestFromDisk(directory);
  return failedSlugs;
}
