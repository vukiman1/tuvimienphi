import { BAT_HAN, BAT_HAN_TRUYEN_THONG, batHan } from './bat-han.js';
import { BAT_HAN_FIXTURE } from './bat-han.fixture.js';
import { Gender } from '../van-han.js';

const MAX_TUOI_CHECKED = 100;
const GENDERS: readonly Gender[] = [Gender.Nam, Gender.Nu];

describe('batHan', () => {
  it.each(BAT_HAN_FIXTURE)(
    'hạn at tuổi $tuoi for $gender is $han as printed by its sources',
    ({ tuoi, gender, han }) => {
      expect(batHan(tuoi, gender)).toBe(han);
    },
  );

  it.each(GENDERS)('covers all eight hạn in the fixture for %s', (gender) => {
    const covered = new Set(
      BAT_HAN_FIXTURE.filter((entry) => entry.gender === gender).map((entry) => entry.han),
    );
    expect(covered).toEqual(new Set(BAT_HAN));
  });

  it.each(GENDERS)('only returns known hạn for %s from tuổi 1 to 100', (gender) => {
    for (let tuoi = 1; tuoi <= MAX_TUOI_CHECKED; tuoi += 1) {
      expect(BAT_HAN).toContain(batHan(tuoi, gender));
    }
  });
});

describe('BAT_HAN_TRUYEN_THONG', () => {
  it('is two sentences', () => {
    expect(BAT_HAN_TRUYEN_THONG.trim().endsWith('.')).toBe(true);
    expect(BAT_HAN_TRUYEN_THONG.slice(0, -1).split('. ')).toHaveLength(2);
  });
});
