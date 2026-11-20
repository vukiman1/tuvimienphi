import { BACKGROUND_REQUEST, httpRequest } from '@/lib/http-request';
import type { LearningProgressResponse } from '@org/shared-contracts';

const LEARNING_PROGRESS_PATH = '/learning/progress';

export const learningProgressService = {
  list(): Promise<LearningProgressResponse> {
    return httpRequest.get<LearningProgressResponse>(LEARNING_PROGRESS_PATH, BACKGROUND_REQUEST);
  },
  save(slugs: readonly string[]): Promise<void> {
    return httpRequest.putNoContent(LEARNING_PROGRESS_PATH, { slugs }, BACKGROUND_REQUEST);
  },
};

export default learningProgressService;
