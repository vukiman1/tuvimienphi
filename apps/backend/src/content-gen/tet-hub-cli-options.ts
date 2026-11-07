const ONLY_FLAG_PREFIX = '--only=';
const FORCE_FLAG = '--force';

export interface CliOptions {
  readonly only: string | null;
  readonly isForced: boolean;
}

export class InvalidTetHubArgumentError extends Error {
  constructor(readonly argument: string) {
    super(
      `unknown argument "${argument}"; use --only=<slug> to regenerate one page or --force to regenerate all`,
    );
    this.name = 'InvalidTetHubArgumentError';
  }
}

function slugFromOnlyFlag(argument: string): string | null {
  if (!argument.startsWith(ONLY_FLAG_PREFIX)) return null;
  const slug = argument.slice(ONLY_FLAG_PREFIX.length);
  return slug === '' ? null : slug;
}

export function parseCliOptions(args: readonly string[]): CliOptions {
  let only: string | null = null;
  let isForced = false;
  for (const argument of args) {
    const slug = slugFromOnlyFlag(argument);
    if (slug !== null) only = slug;
    else if (argument === FORCE_FLAG) isForced = true;
    else throw new InvalidTetHubArgumentError(argument);
  }
  return { only, isForced };
}
