import { tamTaiKeyword } from '../chi-verdicts';
import { buildConGiapBrief, conGiapFacts } from './con-giap.brief';
import { checkConGiap } from './check-con-giap';
import { buildConGiapMessages, CON_GIAP_SYSTEM_PROMPT } from './con-giap.prompt';

const CHI_MUI = 7;

describe('buildConGiapMessages', () => {
  it('states the Tam tai year in the exact phrase the checker requires', () => {
    const brief = buildConGiapBrief(conGiapFacts(CHI_MUI, 2027));

    const [first] = buildConGiapMessages(brief, []);

    expect(first.text).toContain(`là ${tamTaiKeyword(3)}`);
  });
});

describe('wording the model can echo', () => {
  it('never calls the input a brief in the prompt or the rewrite request', () => {
    const brief = buildConGiapBrief(conGiapFacts(CHI_MUI, 2027));
    const draft = {
      tongQuan: ['Một.'],
      tamTai: ['Năm thứ nhất của Tam tai.'],
      thaiTue: ['Xung Thái tuế.'],
      xongDat: ['Tuổi Dậu.'],
    };
    const violations = checkConGiap(draft, brief);
    const messages = buildConGiapMessages(brief, [{ paragraph: draft, loi: violations }]);

    expect(violations.length).toBeGreaterThan(0);
    expect(
      [CON_GIAP_SYSTEM_PROMPT, ...messages.map((message) => message.text)].join('\n'),
    ).not.toMatch(/brief/i);
  });
});
