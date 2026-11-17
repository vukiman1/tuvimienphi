import { castNatal, Gender } from '@org/shared-tu-vi';
import type { NatalChart } from '@org/shared-tu-vi';

export const KIEN_THUC_SAMPLE_BIRTH: {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly gender: Gender;
} = {
  year: 1987,
  month: 3,
  day: 22,
  hour: 8,
  gender: Gender.Nam,
};

export function castSampleChart(): NatalChart {
  return castNatal({
    solarDate: new Date(
      KIEN_THUC_SAMPLE_BIRTH.year,
      KIEN_THUC_SAMPLE_BIRTH.month - 1,
      KIEN_THUC_SAMPLE_BIRTH.day,
    ),
    hour: KIEN_THUC_SAMPLE_BIRTH.hour,
    gender: KIEN_THUC_SAMPLE_BIRTH.gender,
  });
}
