import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { ConGiapArticle, TuoiNamArticle } from '@org/shared-contracts';
import {
  CHI,
  conGiapSlug,
  TET_HUB_VIEW_YEAR,
  tuoiNamBirthYears,
  tuoiNamSlug,
} from '@org/shared-tu-vi';
import { AiClient } from '../ai/port/ai.client';
import { generateHubIntro } from './hub-intro';
import { TetHubGenModule } from './tet-hub-gen.module';
import { generateConGiapArticle, generateTuoiNamArticle } from './tet-hub-pages';
import { writeTetHubIntro, writeTetHubManifest, writeTetHubPage } from './tet-hub-writer';

const OUTPUT_DIRECTORY = 'apps/frontend/src/features/tet-hub/content/2027';
const INTRO_FILE = 'hub.json';
const PAUSE_BETWEEN_AI_CALLS_MS = 30_000;
const ONLY_FLAG_PREFIX = '--only=';
const FORCE_FLAG = '--force';

const logger = new Logger('GenerateTetHub');

class UnknownTetHubPageError extends Error {
  constructor(readonly slug: string) {
    super(`no Tết hub page has the slug "${slug}"`);
    this.name = 'UnknownTetHubPageError';
  }
}

interface CliOptions {
  readonly only: string | null;
  readonly isForced: boolean;
}

interface PagePlan {
  readonly slug: string;
  readonly generate: (ai: AiClient) => Promise<TuoiNamArticle | ConGiapArticle>;
}

function parseCliOptions(args: readonly string[]): CliOptions {
  const only = args.find((arg) => arg.startsWith(ONLY_FLAG_PREFIX));
  return {
    only: only === undefined ? null : only.slice(ONLY_FLAG_PREFIX.length),
    isForced: args.includes(FORCE_FLAG),
  };
}

function allPagePlans(): readonly PagePlan[] {
  const conGiapPlans = CHI.map((_, chi): PagePlan => ({
    slug: conGiapSlug(chi),
    generate: (ai) => generateConGiapArticle(ai, chi),
  }));
  const tuoiNamPlans = tuoiNamBirthYears().map((birthYear): PagePlan => ({
    slug: tuoiNamSlug(birthYear),
    generate: (ai) => generateTuoiNamArticle(ai, birthYear),
  }));
  return [...conGiapPlans, ...tuoiNamPlans];
}

function pageExists(directory: string, slug: string): boolean {
  return existsSync(join(directory, `${slug}.json`));
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

async function run(ai: AiClient, options: CliOptions): Promise<readonly string[]> {
  const directory = join(process.cwd(), OUTPUT_DIRECTORY);
  const plans = selectPlans(allPagePlans(), options, directory);
  const needsIntro = options.only === null && !existsSync(join(directory, INTRO_FILE));
  const failedSlugs: string[] = [];
  let hasCalledAi = false;

  const pauseBetweenCalls = async (): Promise<void> => {
    if (hasCalledAi) await sleep(PAUSE_BETWEEN_AI_CALLS_MS);
    hasCalledAi = true;
  };

  if (needsIntro) {
    await pauseBetweenCalls();
    await writeTetHubIntro(directory, await generateHubIntro(ai));
    logger.log(`wrote ${INTRO_FILE}`);
  }

  for (const [index, plan] of plans.entries()) {
    await pauseBetweenCalls();
    try {
      await writeTetHubPage(directory, await plan.generate(ai));
      logger.log(`wrote ${plan.slug} (${index + 1}/${plans.length})`);
    } catch (error) {
      failedSlugs.push(plan.slug);
      logger.error(
        `failed ${plan.slug}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  await writeManifestFromDisk(directory);
  return failedSlugs;
}

async function main(): Promise<void> {
  const options = parseCliOptions(process.argv.slice(2));
  const app = await NestFactory.createApplicationContext(TetHubGenModule);
  try {
    const failedSlugs = await run(app.get(AiClient), options);
    if (failedSlugs.length > 0) {
      logger.error(`${failedSlugs.length} page(s) failed: ${failedSlugs.join(', ')}`);
      process.exitCode = 1;
    }
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  logger.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
