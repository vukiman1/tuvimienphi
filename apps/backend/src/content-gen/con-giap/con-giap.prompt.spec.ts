import { buildConGiapBrief, conGiapFacts, tamTaiKeyword } from './con-giap.brief';
import { buildConGiapMessages } from './con-giap.prompt';

const CHI_MUI = 7;

describe('buildConGiapMessages', () => {
  it('states the Tam tai year in the exact phrase the checker requires', () => {
    const brief = buildConGiapBrief(conGiapFacts(CHI_MUI, 2027));

    const [first] = buildConGiapMessages(brief, []);

    expect(first.text).toContain(`là ${tamTaiKeyword(3)}`);
  });
});
