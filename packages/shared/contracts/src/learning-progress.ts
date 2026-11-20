export const LEARNING_PROGRESS_MAX_SLUGS_PER_REQUEST = 50;

export interface LearningProgressResponse {
  readonly slugs: readonly string[];
}

export interface SaveLearningProgressPayload {
  readonly slugs: readonly string[];
}
