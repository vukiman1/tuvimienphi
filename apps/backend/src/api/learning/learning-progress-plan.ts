export enum ProgressSaveKind {
  Insert = 'insert',
  NothingNew = 'nothing-new',
  OverLimit = 'over-limit',
}

export type ProgressSavePlan =
  | { readonly kind: ProgressSaveKind.Insert; readonly slugs: readonly string[] }
  | { readonly kind: ProgressSaveKind.NothingNew }
  | {
      readonly kind: ProgressSaveKind.OverLimit;
      readonly storedCount: number;
      readonly newCount: number;
    };

export function planProgressSave(
  stored: ReadonlySet<string>,
  requested: readonly string[],
  maxRows: number,
): ProgressSavePlan {
  const newSlugs: string[] = [];
  const seen = new Set<string>();
  for (const slug of requested) {
    if (stored.has(slug) || seen.has(slug)) {
      continue;
    }
    seen.add(slug);
    newSlugs.push(slug);
  }

  if (newSlugs.length === 0) {
    return { kind: ProgressSaveKind.NothingNew };
  }

  if (stored.size + newSlugs.length > maxRows) {
    return {
      kind: ProgressSaveKind.OverLimit,
      storedCount: stored.size,
      newCount: newSlugs.length,
    };
  }

  return { kind: ProgressSaveKind.Insert, slugs: newSlugs };
}
