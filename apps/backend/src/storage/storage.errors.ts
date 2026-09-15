export class StorageNotConfiguredError extends Error {
  constructor() {
    super('Object storage is not configured: set the R2_* media variables');
    this.name = 'StorageNotConfiguredError';
  }
}

export class ObjectStorageError extends Error {
  constructor(operation: string, key: string, cause: unknown) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    super(`Object storage ${operation} failed for key "${key}": ${reason}`, { cause });
    this.name = 'ObjectStorageError';
  }
}
