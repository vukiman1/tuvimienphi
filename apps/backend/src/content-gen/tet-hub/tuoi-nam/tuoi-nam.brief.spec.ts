import { tuoiNamFacts } from '@org/shared-tu-vi';
import { buildTuoiNamBrief, TuoiNamSection } from './tuoi-nam.brief';

const keywordsOf = (section: TuoiNamSection, year = 1986): string[] =>
  buildTuoiNamBrief(tuoiNamFacts(year, 2027))
    .claims.filter((claim) => claim.section === section)
    .map((claim) => claim.keyword);

describe('buildTuoiNamBrief', () => {
  const facts = tuoiNamFacts(1986, 2027);

  it("puts each gender's sao and hạn in its own section", () => {
    expect(keywordsOf(TuoiNamSection.SaoHanNam)).toEqual([facts.nam.sao, facts.nam.han]);
    expect(keywordsOf(TuoiNamSection.SaoHanNu)).toEqual([facts.nu.sao, facts.nu.han]);
    expect(facts.nam.sao).toBe('Vân Hớn');
    expect(facts.nu.sao).toBe('La Hầu');
  });

  it('puts the mệnh relation in menh and the life stage in tongQuan and loiKhuyen', () => {
    expect(keywordsOf(TuoiNamSection.Menh)).toEqual([facts.menhVoiNam]);
    expect(keywordsOf(TuoiNamSection.TongQuan)).toEqual([facts.giaiDoan]);
    expect(keywordsOf(TuoiNamSection.LoiKhuyen)).toEqual([facts.giaiDoan]);
  });

  it('puts the Kim lâu kind and the Hoang ốc cung in cuoiNha', () => {
    expect(keywordsOf(TuoiNamSection.CuoiNha)).toEqual([`Kim lâu ${facts.kimLau}`, facts.hoangOc]);
  });

  it('states the absence of Kim lâu when the age does not fall in it', () => {
    const free = tuoiNamFacts(1985, 2027);
    expect(free.kimLau).toBeNull();
    expect(keywordsOf(TuoiNamSection.CuoiNha, 1985)[0]).toBe('không phạm Kim lâu');
  });
});
