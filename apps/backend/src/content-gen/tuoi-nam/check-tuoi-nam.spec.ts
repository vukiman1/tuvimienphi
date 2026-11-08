import {
  BAT_HAN_LOI,
  HoangOc,
  KimLau,
  ThaiTueRelation,
  tuoiNamFacts,
  type TuoiNamFacts,
} from '@org/shared-tu-vi';
import { tamTaiKeyword, thaiTueKeyword } from '../chi-verdicts';
import { checkTuoiNam } from './check-tuoi-nam';
import { buildTuoiNamBrief } from './tuoi-nam.brief';
import type { TuoiNamDraft } from './tuoi-nam.schema';

const VIEW_YEAR = 2027;
const BIRTH_YEAR_WITHOUT_KIM_LAU = 1985;
const BIRTH_YEAR_IN_TAM_TAI = 1991;

const facts = tuoiNamFacts(1986, VIEW_YEAR);
const brief = buildTuoiNamBrief(facts);

const paragraphs = (...texts: string[]): readonly string[] => texts;

function kimLauSentence(yearFacts: TuoiNamFacts): string {
  return yearFacts.kimLau === null
    ? `Tuổi mụ ${yearFacts.tuoi} không phạm Kim lâu, việc cưới hỏi có thể tính như thường.`
    : `Tuổi mụ ${yearFacts.tuoi} phạm Kim lâu ${yearFacts.kimLau}, nên cân nhắc khi cưới hỏi.`;
}

function cleanDraftFor(yearFacts: TuoiNamFacts): TuoiNamDraft {
  const { birthYear } = yearFacts;
  return {
    tongQuan: paragraphs(
      `Năm ${VIEW_YEAR} là năm của tuổi ${yearFacts.giaiDoan}, nên việc gì cũng nên đi chậm mà chắc.`,
      'Giữ nhịp làm việc đều đặn và dành thời gian cho gia đình.',
    ),
    saoHanNam: paragraphs(
      `Nam mạng gặp sao ${yearFacts.nam.sao}, theo dân gian cần giữ gìn sức khỏe.`,
      `Hạn năm nay là ${yearFacts.nam.han}, nên cẩn thận khi di chuyển xa.`,
    ),
    saoHanNu: paragraphs(
      `Nữ mạng gặp sao ${yearFacts.nu.sao}, nên giữ lời ăn tiếng nói.`,
      `Hạn năm nay là ${yearFacts.nu.han}, nên làm giấy tờ kỹ lưỡng.`,
    ),
    menh: paragraphs(
      `Mệnh ${yearFacts.menh.name} và năm ${yearFacts.menhNam.name} thuộc quan hệ ${yearFacts.menhVoiNam}.`,
      'Quan hệ này chỉ là nét chung, không quyết định cả năm.',
    ),
    cuoiNha: paragraphs(
      kimLauSentence(yearFacts),
      `Về làm nhà, tuổi này rơi vào cung ${yearFacts.hoangOc} theo Hoang ốc.`,
    ),
    loiKhuyen: paragraphs(
      `Ở tuổi ${yearFacts.giaiDoan}, nên đặt mục tiêu vừa sức.`,
      'Dành thời gian nghỉ ngơi và giữ liên lạc với người thân.',
    ),
    faq: [
      {
        question: `Nam ${birthYear} năm ${VIEW_YEAR} sao gì chiếu mệnh?`,
        answer: `Sao ${yearFacts.nam.sao}.`,
      },
      {
        question: `Nữ ${birthYear} năm ${VIEW_YEAR} gặp hạn gì?`,
        answer: `Hạn ${yearFacts.nu.han}.`,
      },
      {
        question: `Tuổi ${birthYear} nên làm gì năm ${VIEW_YEAR}?`,
        answer: 'Giữ nhịp sống ổn định.',
      },
    ],
  };
}

const cleanDraft = cleanDraftFor(facts);

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
    const wrongCung = facts.hoangOc === HoangOc.NhatCat ? HoangOc.NhiNghi : HoangOc.NhatCat;
    const draft = withDraft({
      cuoiNha: paragraphs(...cleanDraft.cuoiNha, `Có người lại nói cung ${wrongCung}.`),
    });
    const violations = checkTuoiNam(draft, brief);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain(wrongCung);
  });

  it('accepts the computed Hoang ốc cung in the overview and the advice', () => {
    const draft = withDraft({
      tongQuan: paragraphs(...cleanDraft.tongQuan, `Năm nay tuổi này vào cung ${facts.hoangOc}.`),
      loiKhuyen: paragraphs(...cleanDraft.loiKhuyen, `Cung ${facts.hoangOc} nhắc việc làm nhà.`),
    });
    expect(checkTuoiNam(draft, brief)).toEqual([]);
  });

  it('rejects a Hoang ốc cung the brief did not compute in the overview', () => {
    const wrongCung = facts.hoangOc === HoangOc.NhatCat ? HoangOc.NhiNghi : HoangOc.NhatCat;
    const draft = withDraft({
      tongQuan: paragraphs(...cleanDraft.tongQuan, `Năm nay tuổi này vào cung ${wrongCung}.`),
    });
    const violations = checkTuoiNam(draft, brief);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain(`mục tongQuan: nhắc "${wrongCung}"`);
  });

  it('rejects the Hoang ốc cung inside a gender subsection', () => {
    const draft = withDraft({
      saoHanNam: paragraphs(...cleanDraft.saoHanNam, `Nam mạng vào cung ${facts.hoangOc}.`),
    });
    const violations = checkTuoiNam(draft, brief);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain(`mục saoHanNam: nhắc "${facts.hoangOc}"`);
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
    const otherKind = facts.kimLau === KimLau.Than ? KimLau.The : KimLau.Than;
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

  describe('Tam tai and Thái tuế', () => {
    const tamTaiFacts = tuoiNamFacts(BIRTH_YEAR_IN_TAM_TAI, VIEW_YEAR);
    const tamTaiBrief = buildTuoiNamBrief(tamTaiFacts);
    const tamTaiDraft = cleanDraftFor(tamTaiFacts);
    const withNote = (base: TuoiNamDraft, note: string): TuoiNamDraft => ({
      ...base,
      cuoiNha: paragraphs(...base.cuoiNha, note),
    });

    it('accepts the Tam tai year and Thái tuế relation the engine computes for the birth year', () => {
      const draft = withNote(
        tamTaiDraft,
        `Năm ${VIEW_YEAR} là ${tamTaiKeyword(3)} và tuổi này ${thaiTueKeyword(ThaiTueRelation.Truc)}.`,
      );
      expect(checkTuoiNam(draft, tamTaiBrief)).toEqual([]);
    });

    it('rejects a Tam tai year the engine does not compute for the birth year', () => {
      const violations = checkTuoiNam(
        withNote(cleanDraft, `Năm ${VIEW_YEAR} là ${tamTaiKeyword(2)} của tuổi này.`),
        brief,
      );
      expect(violations).toHaveLength(1);
      expect(violations[0]).toContain(tamTaiKeyword(2));
    });

    it('rejects a bare Tam tai claim for a birth year outside Tam tai', () => {
      const violations = checkTuoiNam(
        withNote(cleanDraft, `Năm ${VIEW_YEAR} tuổi Bính Dần phạm Tam tai.`),
        brief,
      );
      expect(violations).toHaveLength(1);
      expect(violations[0]).toContain('Tam tai');
    });

    it('accepts a denial and a question about Tam tai for a birth year outside Tam tai', () => {
      const draft: TuoiNamDraft = {
        ...withNote(cleanDraft, `Năm ${VIEW_YEAR} tuổi này không phạm Tam tai.`),
        faq: [
          ...cleanDraft.faq,
          {
            question: `Bính Dần 1986 có phạm Tam tai năm ${VIEW_YEAR} không?`,
            answer: 'Không, tuổi này không phạm Tam tai.',
          },
        ],
      };
      expect(checkTuoiNam(draft, brief)).toEqual([]);
    });

    it('rejects denying Tam tai for a birth year inside it', () => {
      const violations = checkTuoiNam(
        withNote(tamTaiDraft, `Năm ${VIEW_YEAR} tuổi này không phạm Tam tai.`),
        tamTaiBrief,
      );
      expect(violations).toHaveLength(1);
      expect(violations[0]).toContain('không phạm Tam tai');
    });

    it('rejects a Thái tuế relation the engine does not compute for the birth year', () => {
      const violations = checkTuoiNam(
        withNote(cleanDraft, `Tuổi này ${thaiTueKeyword(ThaiTueRelation.Xung)}.`),
        brief,
      );
      expect(violations).toHaveLength(1);
      expect(violations[0]).toContain(thaiTueKeyword(ThaiTueRelation.Xung));
    });

    it('rejects a bare Thái tuế claim for a birth year with no Thái tuế relation', () => {
      const violations = checkTuoiNam(withNote(cleanDraft, 'Tuổi này phạm Thái tuế.'), brief);
      expect(violations).toHaveLength(1);
      expect(violations[0]).toContain('Thái tuế');
    });

    it('accepts a bare Thái tuế claim for a birth year that has a relation', () => {
      const xungFacts = tuoiNamFacts(BIRTH_YEAR_WITHOUT_KIM_LAU, VIEW_YEAR);
      const draft = withNote(
        cleanDraftFor(xungFacts),
        `Tuổi Ất Sửu phạm Thái tuế, cụ thể là ${thaiTueKeyword(ThaiTueRelation.Xung)}.`,
      );
      expect(checkTuoiNam(draft, buildTuoiNamBrief(xungFacts))).toEqual([]);
    });
  });

  describe('facts written in the prose', () => {
    const withMenh = (note: string): TuoiNamDraft => ({
      ...cleanDraft,
      menh: paragraphs(...cleanDraft.menh, note),
    });

    it('rejects a variant spelling of the birth-year nạp âm', () => {
      const violations = checkTuoiNam(withMenh('Có nơi gọi mệnh này là Lư Trung Hỏa.'), brief);
      expect(violations).toHaveLength(1);
      expect(violations[0]).toContain('Lư Trung Hỏa');
      expect(violations[0]).toContain(facts.menh.name);
    });

    it('rejects a nạp âm that is neither the birth year nor the view year', () => {
      const violations = checkTuoiNam(withMenh('Mệnh Đại Hải Thủy cũng vậy.'), brief);
      expect(violations).toHaveLength(1);
      expect(violations[0]).toContain('Đại Hải Thủy');
    });

    it('rejects a tuổi mụ that differs from the engine', () => {
      const wrongTuoi = facts.tuoi - 1;
      const violations = checkTuoiNam(
        withMenh(`Ở tuổi mụ ${wrongTuoi}, tức ${wrongTuoi} tuổi âm, nên giữ sức.`),
        brief,
      );
      expect(violations).toHaveLength(2);
      expect(violations.every((message) => message.includes(String(wrongTuoi)))).toBe(true);
    });

    it('rejects an inverted Hoang ốc verdict', () => {
      const violations = checkTuoiNam(
        {
          ...cleanDraft,
          cuoiNha: paragraphs(
            ...cleanDraft.cuoiNha,
            `Cung ${facts.hoangOc} là cung tốt cho việc làm nhà.`,
          ),
        },
        brief,
      );
      expect(violations).toHaveLength(1);
      expect(violations[0]).toContain(facts.hoangOc);
    });

    it('rejects an inverted mệnh relation', () => {
      const violations = checkTuoiNam(withMenh('Nói cách khác, đây là năm mệnh khắc năm.'), brief);
      expect(violations).toHaveLength(1);
      expect(violations[0]).toContain('mệnh khắc năm');
    });
  });

  describe('Kim lâu for an age without it', () => {
    const freeFacts = tuoiNamFacts(BIRTH_YEAR_WITHOUT_KIM_LAU, VIEW_YEAR);
    const freeBrief = buildTuoiNamBrief(freeFacts);
    const freeDraft = cleanDraftFor(freeFacts);
    const withNote = (note: string): TuoiNamDraft => ({
      ...freeDraft,
      cuoiNha: paragraphs(...freeDraft.cuoiNha, note),
    });

    it('rejects a bare Kim lâu claim', () => {
      const violations = checkTuoiNam(withNote('Có sách nói tuổi này phạm Kim lâu.'), freeBrief);
      expect(violations).toHaveLength(1);
      expect(violations[0]).toContain('Kim lâu');
    });

    it('accepts the generic folk advice about Kim lâu', () => {
      const draft = withNote('Tuổi phạm Kim lâu thường được khuyên dời việc cưới sang năm khác.');
      expect(checkTuoiNam(draft, freeBrief)).toEqual([]);
    });
  });
});
