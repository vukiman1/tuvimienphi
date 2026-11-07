import { tuoiNamFacts } from '@org/shared-tu-vi';
import { checkTuoiNam } from './check-tuoi-nam';
import { buildTuoiNamBrief } from './tuoi-nam.brief';
import type { TuoiNamDraft } from './tuoi-nam.schema';

const facts = tuoiNamFacts(1986, 2027);
const brief = buildTuoiNamBrief(facts);

const paragraphs = (...texts: string[]): readonly string[] => texts;

const cleanDraft: TuoiNamDraft = {
  tongQuan: paragraphs(
    `Năm 2027 là năm của tuổi ${facts.giaiDoan}, nên việc gì cũng nên đi chậm mà chắc.`,
    'Giữ nhịp làm việc đều đặn và dành thời gian cho gia đình.',
  ),
  saoHanNam: paragraphs(
    `Nam mạng gặp sao ${facts.nam.sao}, theo dân gian cần giữ gìn sức khỏe.`,
    `Hạn năm nay là ${facts.nam.han}, nên cẩn thận khi di chuyển xa.`,
  ),
  saoHanNu: paragraphs(
    `Nữ mạng gặp sao ${facts.nu.sao}, nên giữ lời ăn tiếng nói.`,
    `Hạn năm nay là ${facts.nu.han}, nên làm giấy tờ kỹ lưỡng.`,
  ),
  menh: paragraphs(
    `Mệnh ${facts.menh.name} và năm ${facts.menhNam.name} thuộc quan hệ ${facts.menhVoiNam}.`,
    'Quan hệ này chỉ là nét chung, không quyết định cả năm.',
  ),
  cuoiNha: paragraphs(
    `Tuổi mụ ${facts.tuoi} phạm Kim lâu ${facts.kimLau}, nên cân nhắc khi cưới hỏi.`,
    `Về làm nhà, tuổi này rơi vào cung ${facts.hoangOc} theo Hoang ốc.`,
  ),
  loiKhuyen: paragraphs(
    `Ở tuổi ${facts.giaiDoan}, nên đặt mục tiêu vừa sức.`,
    'Dành thời gian nghỉ ngơi và giữ liên lạc với người thân.',
  ),
  faq: [
    { question: 'Nam 1986 năm 2027 sao gì chiếu mệnh?', answer: `Sao ${facts.nam.sao}.` },
    { question: 'Nữ 1986 năm 2027 gặp hạn gì?', answer: `Hạn ${facts.nu.han}.` },
    { question: 'Tuổi 1986 nên làm gì năm 2027?', answer: 'Giữ nhịp sống ổn định.' },
  ],
};

const withDraft = (patch: Partial<TuoiNamDraft>): TuoiNamDraft => ({ ...cleanDraft, ...patch });

describe('checkTuoiNam', () => {
  it('accepts a draft that states every claim in its section', () => {
    expect(checkTuoiNam(cleanDraft, brief)).toEqual([]);
  });

  it('rejects a star the brief did not compute', () => {
    const draft = withDraft({
      saoHanNam: paragraphs(...cleanDraft.saoHanNam, 'Thêm nữa là sao Kế Đô.'),
    });
    const violations = checkTuoiNam(draft, brief);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('Kế Đô');
  });

  it('rejects the nữ sao inside the nam subsection', () => {
    const draft = withDraft({
      saoHanNam: paragraphs(...cleanDraft.saoHanNam, `Còn sao ${facts.nu.sao} thì sao.`),
    });
    const violations = checkTuoiNam(draft, brief);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('La Hầu');
  });

  it('rejects a missing claim', () => {
    const draft = withDraft({
      cuoiNha: paragraphs(cleanDraft.cuoiNha[0], 'Làm nhà nên chọn ngày tốt.'),
    });
    const violations = checkTuoiNam(draft, brief);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain(facts.hoangOc);
  });

  it('rejects fear and sales language', () => {
    const draft = withDraft({
      loiKhuyen: paragraphs(
        ...cleanDraft.loiKhuyen,
        'Nếu không cẩn thận sẽ gặp đại họa.',
        'Cuối năm phải cúng giải hạn.',
      ),
    });
    const violations = checkTuoiNam(draft, brief);
    expect(violations.some((message) => message.includes('đại họa'))).toBe(true);
    expect(violations.some((message) => message.includes('phải cúng'))).toBe(true);
    expect(violations).toHaveLength(2);
  });

  it('rejects a section outside 2–4 paragraphs', () => {
    const draft = withDraft({ menh: paragraphs(cleanDraft.menh[0]) });
    const violations = checkTuoiNam(draft, brief);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('menh');
  });

  it('rejects fewer than 3 FAQ entries', () => {
    const draft = withDraft({ faq: cleanDraft.faq.slice(0, 2) });
    expect(checkTuoiNam(draft, brief)).toHaveLength(1);
  });
});
