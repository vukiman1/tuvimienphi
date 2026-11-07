import 'reflect-metadata';
import { join } from 'node:path';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  CHI,
  conGiapSlug,
  TET_HUB_VIEW_YEAR,
  tuoiNamBirthYears,
  tuoiNamSlug,
} from '@org/shared-tu-vi';
import { AiClient } from '../ai/port/ai.client';
import { generateHubIntro } from './hub-intro';
import { AiCallPacer } from './ai-call-pacer';
import { runTetHubGeneration, type PagePlan } from './run-tet-hub-generation';
import { readTuoiNamArticles } from './tet-hub-reader';
import { parseCliOptions } from './tet-hub-cli-options';
import { TetHubGenModule } from './tet-hub-gen.module';
import { generateConGiapArticle, generateTuoiNamArticle } from './tet-hub-pages';

const OUTPUT_DIRECTORY = `apps/frontend/src/features/tet-hub/content/${TET_HUB_VIEW_YEAR}`;
const PAUSE_BETWEEN_AI_CALLS_MS = 30_000;

const logger = new Logger('GenerateTetHub');

function allPagePlans(ai: AiClient, pacer: AiCallPacer): readonly PagePlan[] {
  const conGiapPlans = CHI.map((_, chi): PagePlan => ({
    slug: conGiapSlug(chi),
    generate: () => generateConGiapArticle(ai, chi, pacer.beforeCall),
  }));
  const tuoiNamPlans = tuoiNamBirthYears().map((birthYear): PagePlan => ({
    slug: tuoiNamSlug(birthYear),
    generate: () => generateTuoiNamArticle(ai, birthYear, pacer.beforeCall),
  }));
  return [...conGiapPlans, ...tuoiNamPlans];
}

async function main(): Promise<void> {
  const options = parseCliOptions(process.argv.slice(2));
  const app = await NestFactory.createApplicationContext(TetHubGenModule);
  try {
    const ai = app.get(AiClient);
    const pacer = new AiCallPacer(PAUSE_BETWEEN_AI_CALLS_MS);
    const directory = join(process.cwd(), OUTPUT_DIRECTORY);
    const { failedSlugs, similarPairs } = await runTetHubGeneration({
      directory,
      plans: allPagePlans(ai, pacer),
      options,
      generateIntro: () => generateHubIntro(ai, pacer.beforeCall),
      loadArticles: () => readTuoiNamArticles(directory),
    });
    if (failedSlugs.length > 0 || similarPairs.length > 0) process.exitCode = 1;
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  logger.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
