import { ContentKind } from '@org/shared-contracts';
import type { PageRef } from '@org/shared-contracts';
import { cungRelations, plannedPage, saoFacts } from '@org/shared-kien-thuc';
import type { CungRelationFacts, SaoFacts } from '@org/shared-kien-thuc';

export enum EntryFactsKind {
  Sao = 'sao',
  Cung = 'cung',
  None = 'none',
}

export type EntryFacts =
  | { readonly kind: EntryFactsKind.Sao; readonly facts: SaoFacts }
  | { readonly kind: EntryFactsKind.Cung; readonly facts: CungRelationFacts }
  | { readonly kind: EntryFactsKind.None };

export function entryFacts(ref: PageRef): EntryFacts {
  const page = plannedPage(ref);
  if (page?.kind === ContentKind.Sao) {
    return { kind: EntryFactsKind.Sao, facts: saoFacts(page.star) };
  }
  if (page?.kind === ContentKind.Cung) {
    return { kind: EntryFactsKind.Cung, facts: cungRelations(page.cung) };
  }
  return { kind: EntryFactsKind.None };
}
