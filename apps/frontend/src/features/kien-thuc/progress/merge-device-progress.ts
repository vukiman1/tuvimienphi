import { LEARNING_PROGRESS_MAX_SLUGS_PER_REQUEST } from '@org/shared-contracts';
import { learningProgressService } from '@/services/learning-progress-service';
import { clearLocalProgress, readLocalProgress } from './local-progress-store';

function chunkSlugs(slugs: readonly string[], size: number): readonly string[][] {
  const chunks: string[][] = [];
  for (let index = 0; index < slugs.length; index += size) {
    chunks.push(slugs.slice(index, index + size));
  }
  return chunks;
}

function sameSet(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  if (a.size !== b.size) {
    return false;
  }
  for (const value of a) {
    if (!b.has(value)) {
      return false;
    }
  }
  return true;
}

export async function mergeDeviceProgress(): Promise<ReadonlySet<string>> {
  const snapshot = readLocalProgress();
  const sorted = [...snapshot].sort();

  for (const batch of chunkSlugs(sorted, LEARNING_PROGRESS_MAX_SLUGS_PER_REQUEST)) {
    await learningProgressService.save(batch);
  }

  const account = await learningProgressService.list();

  if (sameSet(readLocalProgress(), snapshot)) {
    clearLocalProgress();
  }

  return new Set(account.slugs);
}
