import { CAN, CHI, getYearPillar } from '../lich/lunar-calendar.js';
import { tuoiNamBirthYears } from './tuoi-nam-range.js';

const SLUG_PREFIX = 'tuoi';
const SLUG_SEPARATOR = '-';
const COMBINING_MARKS = /[̀-ͯ]/g;
const WHITESPACE = /\s+/g;

function toSlugWord(word: string): string {
  return word.normalize('NFD').replace(COMBINING_MARKS, '').replace(/đ/gi, 'd').toLowerCase();
}

function slugOf(...words: readonly string[]): string {
  return [
    SLUG_PREFIX,
    ...words.map((word) => toSlugWord(word).replace(WHITESPACE, SLUG_SEPARATOR)),
  ].join(SLUG_SEPARATOR);
}

export function tuoiNamSlug(birthYear: number): string {
  const { can, chi } = getYearPillar(birthYear);
  return slugOf(CAN[can], CHI[chi], String(birthYear));
}

export function conGiapSlug(chi: number): string {
  return slugOf(CHI[chi]);
}

export function findTuoiNamBySlug(slug: string): number | undefined {
  return tuoiNamBirthYears().find((birthYear) => tuoiNamSlug(birthYear) === slug);
}

export function findConGiapBySlug(slug: string): number | undefined {
  const chi = CHI.findIndex((_, index) => conGiapSlug(index) === slug);
  return chi === -1 ? undefined : chi;
}
