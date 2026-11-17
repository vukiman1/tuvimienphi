import { splitSentences } from '../../check-text';

const SEMICOLON = ';';

export function splitClauses(text: string): readonly string[] {
  return splitSentences(text)
    .flatMap((sentence) => sentence.split(SEMICOLON))
    .map((clause) => clause.trim())
    .filter((clause) => clause !== '');
}
