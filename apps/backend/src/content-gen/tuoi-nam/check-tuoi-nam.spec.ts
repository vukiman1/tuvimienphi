import { BAT_HAN_LOI, HoangOc, KimLau, tuoiNamFacts } from '@org/shared-tu-vi';
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

  it('rejects the nữ sao in a nam FAQ answer', () => {
    const faq = [
      {
        question: 'Nam 1986 năm 2027 sao gì chiếu mệnh?',
        answer: `Nam 1986 gặp sao ${facts.nu.sao}.`,
      },
      ...cleanDraft.faq.slice(1),
    ];
    const violations = checkTuoiNam(withDraft({ faq }), brief);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('La Hầu');
  });

  it('rejects a star the brief did not compute in a FAQ answer', () => {
    const faq = [
      ...cleanDraft.faq.slice(0, 2),
      { question: 'Tuổi 1986 nên làm gì năm 2027?', answer: 'Sao Kế Đô chiếu mệnh.' },
    ];
    const violations = checkTuoiNam(withDraft({ faq }), brief);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('Kế Đô');
  });

  it('rejects a Hoang ốc cung the brief did not compute', () => {
    const wrongCung = Object.values(HoangOc).find((cung) => cung !== facts.hoangOc) as HoangOc;
    const draft = withDraft({
      cuoiNha: paragraphs(...cleanDraft.cuoiNha, `Có người lại nói cung ${wrongCung}.`),
    });
    const violations = checkTuoiNam(draft, brief);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain(wrongCung);
  });

  it('rejects denying a Kim lâu the age falls in', () => {
    const draft = withDraft({
      cuoiNha: paragraphs(`Tuổi này không phạm Kim lâu ${facts.kimLau}.`, cleanDraft.cuoiNha[1]),
    });
    expect(checkTuoiNam(draft, brief).length).toBeGreaterThan(0);
    expect(checkTuoiNam(draft, brief).some((m) => m.includes('Kim lâu'))).toBe(true);
  });

  it('rejects claiming a Kim lâu the age does not fall in', () => {
    const freeFacts = tuoiNamFacts(1985, 2027);
    const freeBrief = buildTuoiNamBrief(freeFacts);
    const draft = withDraft({
      cuoiNha: paragraphs(
        'Tuổi này phạm Kim lâu thân, nên cân nhắc.',
        'Tuổi này không phạm Kim lâu.',
        `Hoang ốc rơi vào cung ${freeFacts.hoangOc}.`,
      ),
      saoHanNam: paragraphs(`Sao ${freeFacts.nam.sao}.`, `Hạn ${freeFacts.nam.han}.`),
      saoHanNu: paragraphs(`Sao ${freeFacts.nu.sao}.`, `Hạn ${freeFacts.nu.han}.`),
      tongQuan: paragraphs(`Tuổi ${freeFacts.giaiDoan}.`, 'Ổn định.'),
      loiKhuyen: paragraphs(`Tuổi ${freeFacts.giaiDoan}.`, 'Nghỉ ngơi.'),
      menh: paragraphs(`Quan hệ ${freeFacts.menhVoiNam}.`, 'Chỉ là nét chung.'),
      faq: cleanDraft.faq.map((entry) => ({ ...entry, answer: 'Giữ nhịp sống ổn định.' })),
    });
    const violations = checkTuoiNam(draft, freeBrief);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('Kim lâu');
  });

  it('catches a star spelled with old-style tone marks in the wrong gender section', () => {
    const draft = withDraft({
      saoHanNam: paragraphs(...cleanDraft.saoHanNam, 'Còn sao Thuỷ Diệu nữa.'),
    });
    const violations = checkTuoiNam(draft, brief);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('Thủy Diệu');
  });

  it('resolves a spelling alias to the canonical name before the swap check', () => {
    const draft = withDraft({
      saoHanNam: paragraphs(...cleanDraft.saoHanNam, 'Còn sao La Hầu và Vân Hán.'),
    });
    expect(checkTuoiNam(draft, brief).some((m) => m.includes('La Hầu'))).toBe(true);
    const aliasDraft = withDraft({
      saoHanNu: paragraphs(...cleanDraft.saoHanNu, 'Nam mạng thì có Vân Hán.'),
    });
    const violations = checkTuoiNam(aliasDraft, brief);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('Vân Hớn');
  });

  it('rejects a different Kim lâu kind than the brief computed', () => {
    const otherKind = Object.values(KimLau).find((kind) => kind !== facts.kimLau) as KimLau;
    const draft = withDraft({
      cuoiNha: paragraphs(...cleanDraft.cuoiNha, `Có sách nói là Kim lâu ${otherKind}.`),
    });
    const violations = checkTuoiNam(draft, brief);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain(`Kim lâu ${otherKind}`);
  });

  it('keeps every folk hạn meaning clear of fear and sales language', () => {
    for (const line of Object.values(BAT_HAN_LOI)) {
      const draft = withDraft({ loiKhuyen: paragraphs(...cleanDraft.loiKhuyen, line) });
      expect(
        checkTuoiNam(draft, brief).filter((message) => message.includes('cụm bị cấm')),
      ).toEqual([]);
    }
  });
});
