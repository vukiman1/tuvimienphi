import { CHI, ThaiTueRelation } from '@org/shared-tu-vi';
import { checkConGiap } from './check-con-giap';
import { buildConGiapBrief, conGiapFacts, tamTaiKeyword, thaiTueKeyword } from './con-giap.brief';
import type { ConGiapDraft } from './con-giap.schema';

const VIEW_YEAR = 2027;
const CHI_MUI = 7;
const CHI_SUU = 1;
const CHI_DAN = 2;

const paragraphs = (...texts: string[]): readonly string[] => texts;

function briefFor(chi: number): ReturnType<typeof buildConGiapBrief> {
  return buildConGiapBrief(conGiapFacts(chi, VIEW_YEAR));
}

function cleanDraftFor(chi: number): ConGiapDraft {
  const { facts } = briefFor(chi);
  const tamTai =
    facts.tamTai === null
      ? 'Năm nay tuổi này không phạm Tam tai, có thể làm việc lớn như thường.'
      : `Năm nay là ${tamTaiKeyword(facts.tamTai)}, nên đừng khởi sự việc lớn vội vàng.`;
  const thaiTue =
    facts.thaiTue.length === 0
      ? 'Tuổi này không phạm Thái tuế nên cứ giữ nhịp sống bình thường.'
      : `Tuổi này ${facts.thaiTue.map(thaiTueKeyword).join(' và ')}, nên cẩn trọng mọi việc.`;
  const hop = facts.xongDat.hop.map((item) => CHI[item]).join(', ');
  const tranh = facts.xongDat.tranh.map((item) => CHI[item]).join(', ');
  return {
    tongQuan: paragraphs(
      `Tuổi ${CHI[chi]} bước vào năm ${VIEW_YEAR} với nhiều điều cần liệu trước.`,
      'Giữ nhịp làm việc đều và dành thời gian cho gia đình.',
    ),
    tamTai: paragraphs(tamTai, 'Dân gian khuyên giữ mọi việc ở mức vừa phải.'),
    thaiTue: paragraphs(thaiTue, 'Đây chỉ là cách xem của dân gian, không quyết định cả năm.'),
    xongDat: paragraphs(
      `Nhà tuổi ${CHI[chi]} hợp người tuổi ${hop} xông đất.`,
      `Nên tránh người tuổi ${tranh}.`,
    ),
  };
}

describe('checkConGiap', () => {
  it.each([CHI_MUI, CHI_SUU, CHI_DAN])(
    'accepts a draft that states every claim for chi %i',
    (chi) => {
      expect(checkConGiap(cleanDraftFor(chi), briefFor(chi))).toEqual([]);
    },
  );

  it('rejects a chi in the xông đất section that the brief did not list', () => {
    const brief = briefFor(CHI_MUI);
    const draft = {
      ...cleanDraftFor(CHI_MUI),
      xongDat: paragraphs(...cleanDraftFor(CHI_MUI).xongDat, 'Người tuổi Dậu cũng rất hợp.'),
    };
    const violations = checkConGiap(draft, brief);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('Dậu');
  });

  it('rejects an xông đất section that leaves out a listed chi', () => {
    const brief = briefFor(CHI_MUI);
    const draft = {
      ...cleanDraftFor(CHI_MUI),
      xongDat: paragraphs('Nhà này nên chọn người hợp tuổi.', 'Nên tránh người tuổi Tý, Sửu.'),
    };
    const violations = checkConGiap(draft, brief);
    expect(violations.some((message) => message.includes('"Mão"'))).toBe(true);
  });

  it('rejects a Tam tai section that does not say which year of three it is', () => {
    const draft = {
      ...cleanDraftFor(CHI_MUI),
      tamTai: paragraphs('Tuổi này đang trong Tam tai.', 'Nên giữ mọi việc ở mức vừa phải.'),
    };
    const violations = checkConGiap(draft, briefFor(CHI_MUI));
    expect(violations).toEqual([`mục tamTai: thiếu "${tamTaiKeyword(3)}"`]);
  });

  it('rejects a wrong Tam tai year', () => {
    const draft = {
      ...cleanDraftFor(CHI_MUI),
      tamTai: paragraphs(
        `Năm nay là ${tamTaiKeyword(3)}, nhưng cũng được gọi là ${tamTaiKeyword(1)}.`,
        'Nên giữ mọi việc ở mức vừa phải.',
      ),
    };
    const violations = checkConGiap(draft, briefFor(CHI_MUI));
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain(tamTaiKeyword(1));
  });

  it('rejects a Tam tai year for a chi outside Tam tai', () => {
    const draft = {
      ...cleanDraftFor(CHI_SUU),
      tamTai: paragraphs(
        `Không phạm Tam tai, dù ai đó nói là ${tamTaiKeyword(2)}.`,
        'Nên giữ mọi việc ở mức vừa phải.',
      ),
    };
    const violations = checkConGiap(draft, briefFor(CHI_SUU));
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain(tamTaiKeyword(2));
  });

  it('rejects denying Tam tai for a chi inside Tam tai', () => {
    const draft = {
      ...cleanDraftFor(CHI_MUI),
      tamTai: paragraphs(
        `Năm nay là ${tamTaiKeyword(3)}, tuy vậy có người bảo không phạm Tam tai.`,
        'Nên giữ mọi việc ở mức vừa phải.',
      ),
    };
    const violations = checkConGiap(draft, briefFor(CHI_MUI));
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('không phạm Tam tai');
  });

  it('rejects a Thái tuế relation the brief did not compute', () => {
    const draft = {
      ...cleanDraftFor(CHI_MUI),
      thaiTue: paragraphs(...cleanDraftFor(CHI_MUI).thaiTue, 'Tuổi này còn xung Thái tuế nữa.'),
    };
    const violations = checkConGiap(draft, briefFor(CHI_MUI));
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain(thaiTueKeyword(ThaiTueRelation.Xung));
  });

  it('rejects denying Thái tuế for a chi that offends it', () => {
    const draft = {
      ...cleanDraftFor(CHI_MUI),
      thaiTue: paragraphs(
        'Tuổi này trực Thái tuế, dù có người nói không phạm Thái tuế.',
        'Nên cẩn trọng mọi việc.',
      ),
    };
    const violations = checkConGiap(draft, briefFor(CHI_MUI));
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('không phạm Thái tuế');
  });

  it('rejects fear and sales language', () => {
    const draft = {
      ...cleanDraftFor(CHI_MUI),
      tongQuan: paragraphs(
        ...cleanDraftFor(CHI_MUI).tongQuan,
        'Nếu không cẩn thận sẽ gặp đại họa.',
        'Cuối năm phải cúng giải hạn.',
      ),
    };
    const violations = checkConGiap(draft, briefFor(CHI_MUI));
    expect(violations.some((message) => message.includes('đại họa'))).toBe(true);
    expect(violations.some((message) => message.includes('phải cúng'))).toBe(true);
  });

  it('rejects a section outside 2–4 paragraphs', () => {
    const draft = { ...cleanDraftFor(CHI_MUI), tongQuan: paragraphs('Chỉ một đoạn.') };
    const violations = checkConGiap(draft, briefFor(CHI_MUI));
    expect(violations).toHaveLength(2);
    expect(violations.some((message) => message.includes('có 1 đoạn'))).toBe(true);
  });
});
