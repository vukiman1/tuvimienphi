import { CHINH_TINH_NAMES, PHU_TINH_NAMES } from '@org/shared-tu-vi';
import { normalize } from '../../check-text';

const NEGATION_WORD = 'không';
const NEGATION_MASK = 'khong';
const WORD_SEPARATOR = ' ';

const NAMES_WITH_NEGATION: readonly string[] = [...CHINH_TINH_NAMES, ...PHU_TINH_NAMES]
  .map(normalize)
  .filter((name) => name.split(WORD_SEPARATOR).includes(NEGATION_WORD));

export function maskNegationInNames(normalizedText: string): string {
  return NAMES_WITH_NEGATION.reduce(
    (text, name) => text.replaceAll(name, name.replace(NEGATION_WORD, NEGATION_MASK)),
    normalizedText,
  );
}
