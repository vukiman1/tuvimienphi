import { BAT_HAN_LOI, isHoangOcTot, ThaiTueRelation, tuoiNamFacts } from '@org/shared-tu-vi';
import {
  NO_TAM_TAI_KEYWORD,
  NO_THAI_TUE_KEYWORD,
  tamTaiKeyword,
  thaiTueKeyword,
} from '../chi-verdicts';
import { checkTuoiNam } from './check-tuoi-nam';
import { buildTuoiNamBrief } from './tuoi-nam.brief';
import { buildTuoiNamMessages, TUOI_NAM_SYSTEM_PROMPT } from './tuoi-nam.prompt';
import {
  MalformedTuoiNamDraftError,
  parseTuoiNamDraft,
  type TuoiNamDraft,
} from './tuoi-nam.schema';

const brief = buildTuoiNamBrief(tuoiNamFacts(1986, 2027));

const draft: TuoiNamDraft = {
  tongQuan: ['a', 'b'],
  saoHanNam: ['a', 'b'],
  saoHanNu: ['a', 'b'],
  menh: ['a', 'b'],
  cuoiNha: ['a', 'b'],
  loiKhuyen: ['a', 'b'],
  faq: [{ question: 'q', answer: 'a' }],
};

describe('buildTuoiNamMessages', () => {
  it('sends only the brief on the first attempt', () => {
    const messages = buildTuoiNamMessages(brief, []);
    expect(messages).toHaveLength(1);
    expect(messages[0].text).toContain('Vân Hớn');
  });

  it('replays a rejected draft with its violations', () => {
    const messages = buildTuoiNamMessages(brief, [{ paragraph: draft, loi: ['thiếu "Tử"'] }]);
    expect(messages.map((message) => message.role)).toEqual(['user', 'model', 'user']);
    expect(messages[2].text).toContain('thiếu "Tử"');
  });
});

describe('parseTuoiNamDraft', () => {
  it('returns a well-formed draft', () => {
    expect(parseTuoiNamDraft(JSON.stringify(draft))).toEqual(draft);
  });

  it('rejects JSON missing a section', () => {
    const withoutMenh = { ...draft, menh: undefined };
    expect(() => parseTuoiNamDraft(JSON.stringify(withoutMenh))).toThrow(
      MalformedTuoiNamDraftError,
    );
  });
});

describe('buildTuoiNamMessages facts', () => {
  const facts = tuoiNamFacts(1986, 2027);
  const text = buildTuoiNamMessages(brief, [])[0].text;

  it('gives the model the folk meaning of both hạn', () => {
    expect(text).toContain(BAT_HAN_LOI[facts.nam.han]);
    expect(text).toContain(BAT_HAN_LOI[facts.nu.han]);
  });

  it('states the Kim lâu and Hoang ốc verdicts', () => {
    expect(text).toContain(`phạm Kim lâu ${facts.kimLau}`);
    expect(text).toContain(
      `cung ${facts.hoangOc}, là ${isHoangOcTot(facts.hoangOc) ? 'cung tốt' : 'cung xấu'}`,
    );
  });

  it('states that a birth year outside Tam tai and Thái tuế has neither, in the checked phrases', () => {
    expect(text).toContain(NO_TAM_TAI_KEYWORD);
    expect(text).toContain(NO_THAI_TUE_KEYWORD);
  });

  it('states the Tam tai year and Thái tuế relation of a birth year that has them', () => {
    const tamTaiText = buildTuoiNamMessages(buildTuoiNamBrief(tuoiNamFacts(1991, 2027)), [])[0]
      .text;
    expect(tamTaiText).toContain(tamTaiKeyword(3));
    expect(tamTaiText).toContain(thaiTueKeyword(ThaiTueRelation.Truc));
  });
});

describe('wording the model can echo', () => {
  it('never calls the input a brief in the prompt or the rewrite request', () => {
    const violations = checkTuoiNam(draft, brief);
    const messages = buildTuoiNamMessages(brief, [{ paragraph: draft, loi: violations }]);

    expect(violations.length).toBeGreaterThan(0);
    expect(
      [TUOI_NAM_SYSTEM_PROMPT, ...messages.map((message) => message.text)].join('\n'),
    ).not.toMatch(/brief/i);
  });
});
