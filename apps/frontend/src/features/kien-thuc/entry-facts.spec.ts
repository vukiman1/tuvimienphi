import { ContentKind } from '@org/shared-contracts';
import { KIEN_THUC_ENTRIES } from '@org/shared-kien-thuc';
import { CUNG_SLUGS } from '../la-so/cung-slug';
import { EntryFactsKind, entryFacts } from './entry-facts';

describe('entryFacts', () => {
  it('gives a star its engine facts', () => {
    const result = entryFacts('sao/thien-co');
    expect(result.kind).toBe(EntryFactsKind.Sao);
    if (result.kind === EntryFactsKind.Sao) {
      expect(result.facts.name).toBe('Thiên Cơ');
    }
  });

  it('gives a cung its partners', () => {
    const result = entryFacts('cung/menh');
    expect(result.kind).toBe(EntryFactsKind.Cung);
    if (result.kind === EntryFactsKind.Cung) {
      expect(result.facts.doiCung).toBe('Thiên Di');
    }
  });

  it('gives a term none', () => {
    expect(entryFacts('thuat-ngu/can')).toEqual({ kind: EntryFactsKind.None });
  });

  it('links cung partners by the board slugs', () => {
    const palaces = KIEN_THUC_ENTRIES.filter((entry) => entry.kind === ContentKind.Cung);
    expect(palaces.length).toBeGreaterThan(0);
    for (const palace of palaces) {
      if (palace.kind === ContentKind.Cung) {
        expect(CUNG_SLUGS[palace.cung]).toBe(palace.slug);
      }
    }
  });
});
