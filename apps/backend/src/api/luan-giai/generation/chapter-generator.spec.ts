jest.mock('../validate/check-paragraphs', () => ({ checkParagraphs: jest.fn() }));

import { Logger } from '@nestjs/common';
import type { LuanGiaiSection } from '@org/shared-contracts';
import {
  buildMucBriefs,
  castNatal,
  GiaDaoMucKey,
  Gender,
  type NatalChart,
} from '@org/shared-tu-vi';
import { AiClient } from '../../../ai/port/ai.client';
import type { AiRequest, AiResult } from '../../../ai/port/ai.types';
import {
  type ChapterContext,
  type ChapterDefinition,
  type MucCanSinh,
  MucKind,
} from './chapter-definition';
import { ChapterGenerator } from './chapter-generator';
import {
  ChapterRejectedError,
  ChapterTimedOutError,
  MalformedChapterError,
  RequiredMucFailedError,
} from '../luan-giai.errors';
import { GIA_DAO_SYSTEM_PROMPT } from '../chapters/tinh-duyen/tinh-duyen.prompt';
import { MAX_ATTEMPTS } from './sinh-voi-kiem';
import { THAN_CU_CHAPTER } from '../chapters/than-cu/than-cu.chapter';
import { TINH_DUYEN_CHAPTER } from '../chapters/tinh-duyen/tinh-duyen.chapter';
import { checkParagraphs } from '../validate/check-paragraphs';

const CO_BANG: NatalChart = castNatal({
  solarDate: new Date(1960, 4, 26),
  hour: 21,
  gender: Gender.Nam,
});

const LA_SO_GIA_DAO: NatalChart = castNatal({
  solarDate: new Date(1953, 0, 25),
  hour: 21,
  gender: Gender.Nam,
});

const BAI = JSON.stringify({ doan1: 'Hai câu. Câu nữa.', doan2: 'Hai câu. Câu nữa.' });
const BAI_MOT_DOAN = JSON.stringify({ doan: 'Một câu. Câu nữa.' });
const BUDGET_MS = 60_000;
const NO_VIEW_YEAR: ChapterContext = { viewYear: null, currentYear: 2026 };
const PROMPT_CHA_ME = GIA_DAO_SYSTEM_PROMPT[GiaDaoMucKey.ChaMe];

const THAN_CU_KHONG_MUC: ChapterDefinition = { ...THAN_CU_CHAPTER, buildMucs: () => [] };
const KHONG_DUNG_NOI_BRIEF: ChapterDefinition = { ...THAN_CU_CHAPTER, buildBrief: () => null };

function ketQua(text: string): AiResult {
  return { text, model: 'gia', inputTokens: 0, outputTokens: 0, failedAttempts: [], latencyMs: 0 };
}

class AiGia extends AiClient {
  readonly requests: AiRequest[] = [];

  constructor(private readonly hangDoi: string[]) {
    super();
  }

  generate(request: AiRequest): Promise<AiResult> {
    this.requests.push(request);
    return Promise.resolve(ketQua(this.hangDoi.shift() ?? ''));
  }
}

class AiTheoSchema extends AiClient {
  readonly requests: AiRequest[] = [];

  generate(request: AiRequest): Promise<AiResult> {
    this.requests.push(request);
    const coHaiDoan = 'doan1' in (request.schema.properties ?? {});
    return Promise.resolve(ketQua(coHaiDoan ? BAI : BAI_MOT_DOAN));
  }

  requestsOf(system: string): AiRequest[] {
    return this.requests.filter((request) => request.system === system);
  }
}

const kiem = checkParagraphs as jest.MockedFunction<typeof checkParagraphs>;
const DAT_HET: string[] = [];
const VI_PHAM = ['đoạn 2: 3 câu, cần đúng 2'];

describe('ChapterGenerator', () => {
  beforeEach(() => {
    kiem.mockReset();
  });

  it('sinh lại kèm danh sách lỗi khi bản đầu không qua bộ kiểm', async () => {
    kiem.mockReturnValueOnce(VI_PHAM).mockReturnValue(DAT_HET);
    const ai = new AiGia([BAI, BAI]);

    const ket = await new ChapterGenerator(ai).generate(
      THAN_CU_KHONG_MUC,
      CO_BANG,
      BUDGET_MS,
      NO_VIEW_YEAR,
    );

    expect(ket?.attempts).toBe(2);
    expect(ai.requests).toHaveLength(2);
    expect(ai.requests[1].messages.at(-1)?.text).toContain('câu, cần đúng 2');
  });

  it('bỏ cuộc sau khi hết lượt và nêu rõ vi phạm còn lại', async () => {
    kiem.mockReturnValue(VI_PHAM);
    const ai = new AiGia([BAI, BAI, BAI, BAI, BAI]);

    await expect(
      new ChapterGenerator(ai).generate(THAN_CU_KHONG_MUC, CO_BANG, BUDGET_MS, NO_VIEW_YEAR),
    ).rejects.toThrow(ChapterRejectedError);
    expect(ai.requests).toHaveLength(5);
  });

  it('trả null mà không gọi mô hình khi không dựng nổi brief', async () => {
    const ai = new AiGia([BAI]);

    await expect(
      new ChapterGenerator(ai).generate(KHONG_DUNG_NOI_BRIEF, CO_BANG, BUDGET_MS, NO_VIEW_YEAR),
    ).resolves.toBeNull();
    expect(ai.requests).toHaveLength(0);
  });

  it('dừng trước khi gọi mô hình nếu ngân sách thời gian không đủ cho một lượt', async () => {
    const ai = new AiGia([BAI]);

    await expect(
      new ChapterGenerator(ai).generate(THAN_CU_KHONG_MUC, CO_BANG, 100, NO_VIEW_YEAR),
    ).rejects.toThrow(ChapterTimedOutError);
    expect(ai.requests).toHaveLength(0);
  });

  it('ném lỗi khi mô hình trả về thứ không phải hai đoạn', async () => {
    const ai = new AiGia(['không phải json']);

    await expect(
      new ChapterGenerator(ai).generate(THAN_CU_KHONG_MUC, CO_BANG, BUDGET_MS, NO_VIEW_YEAR),
    ).rejects.toThrow(MalformedChapterError);
  });
});

describe('ChapterGenerator mục cung khác', () => {
  beforeEach(() => {
    kiem.mockReset().mockReturnValue(DAT_HET);
  });

  it('mục cung khác được viết hai đoạn bằng prompt riêng của nó', async () => {
    const ai = new AiTheoSchema();

    const ket = await new ChapterGenerator(ai).generate(
      TINH_DUYEN_CHAPTER,
      LA_SO_GIA_DAO,
      BUDGET_MS,
      NO_VIEW_YEAR,
    );

    const [yeuCau] = ai.requestsOf(PROMPT_CHA_ME);
    const chaMe = ket?.article.sections?.find((section) => section.slug === GiaDaoMucKey.ChaMe);
    expect(yeuCau.schema.properties).toHaveProperty('doan1');
    expect(chaMe?.paragraphs).toHaveLength(2);
    expect(chaMe?.sourceCung).toMatch(/^Phụ Mẫu · /);
  });

  it('brief gửi cho mô hình ở mục cung khác không kèm trường riêng của mục', async () => {
    const ai = new AiTheoSchema();

    await new ChapterGenerator(ai).generate(
      TINH_DUYEN_CHAPTER,
      LA_SO_GIA_DAO,
      BUDGET_MS,
      NO_VIEW_YEAR,
    );

    const [yeuCau] = ai.requestsOf(PROMPT_CHA_ME);
    const noiDung = JSON.stringify(yeuCau.messages[0]);
    for (const truong of ['"muc"', '"tieuDe"', '"sourceCung"', '"duKien"']) {
      expect(noiDung).not.toContain(truong.replace(/"/g, '\\"'));
    }
  });

  it('bộ kiểm ở mục cung khác vẫn nhận brief đủ trường riêng của mục', async () => {
    await new ChapterGenerator(new AiTheoSchema()).generate(
      TINH_DUYEN_CHAPTER,
      LA_SO_GIA_DAO,
      BUDGET_MS,
      NO_VIEW_YEAR,
    );

    const briefDaKiem = kiem.mock.calls.map(([brief]) => brief);
    expect(briefDaKiem).toContainEqual(
      expect.objectContaining({ cung: 'Phụ Mẫu', muc: GiaDaoMucKey.ChaMe }),
    );
  });

  it('mục cung khác bị chặn đủ MAX_ATTEMPTS lần thì chỉ mất mục đó, bài chính vẫn trả về', async () => {
    kiem.mockImplementation((brief) => (brief.cung === 'Phụ Mẫu' ? ['chặn'] : []));
    const ai = new AiTheoSchema();

    const ket = await new ChapterGenerator(ai).generate(
      TINH_DUYEN_CHAPTER,
      LA_SO_GIA_DAO,
      BUDGET_MS,
      NO_VIEW_YEAR,
    );

    const slugs = ket?.article.sections?.map((section) => section.slug) ?? [];
    expect(ket).not.toBeNull();
    expect(slugs).not.toContain(GiaDaoMucKey.ChaMe);
    expect(ai.requestsOf(PROMPT_CHA_ME)).toHaveLength(MAX_ATTEMPTS);
  });

  it('cảnh báo bỏ mục mở đầu bằng tên chương', async () => {
    kiem.mockImplementation((brief) => (brief.cung === 'Phụ Mẫu' ? ['chặn'] : []));
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

    try {
      await new ChapterGenerator(new AiTheoSchema()).generate(
        TINH_DUYEN_CHAPTER,
        LA_SO_GIA_DAO,
        BUDGET_MS,
        NO_VIEW_YEAR,
      );

      const canhBaoBoMuc = warn.mock.calls
        .map(([thongDiep]) => String(thongDiep))
        .filter((thongDiep) => thongDiep.includes('bỏ mục'));
      expect(canhBaoBoMuc).not.toHaveLength(0);
      for (const thongDiep of canhBaoBoMuc) {
        expect(thongDiep.startsWith(`${TINH_DUYEN_CHAPTER.name}: `)).toBe(true);
      }
    } finally {
      warn.mockRestore();
    }
  });
});

describe('ChapterGenerator mục dựng sẵn và mục bắt buộc', () => {
  const [mucDau, mucSau] = buildMucBriefs(CO_BANG);
  const MUC_DUNG_SAN: LuanGiaiSection = {
    slug: 'dung-san',
    title: 'Dựng sẵn',
    sourceCung: 'Mệnh · Tý',
    paragraphs: ['Đoạn viết sẵn từ bảng.'],
  };
  const PROMPT_RIENG = 'prompt riêng của mục';

  function voiMuc(mucs: readonly MucCanSinh[]): ChapterDefinition {
    return { ...THAN_CU_CHAPTER, buildMucs: () => mucs };
  }

  beforeEach(() => {
    kiem.mockReset().mockReturnValue(DAT_HET);
  });

  it('đặt mục dựng sẵn đúng thứ tự định nghĩa mà không gọi mô hình cho nó', async () => {
    const ai = new AiTheoSchema();
    const chuong = voiMuc([
      { kind: MucKind.PhuTinh, brief: mucDau },
      { kind: MucKind.Rendered, section: MUC_DUNG_SAN },
      { kind: MucKind.PhuTinh, brief: mucSau },
    ]);

    const ket = await new ChapterGenerator(ai).generate(chuong, CO_BANG, BUDGET_MS, NO_VIEW_YEAR);

    expect(ket?.article.sections?.map((section) => section.slug)).toEqual([
      mucDau.muc,
      MUC_DUNG_SAN.slug,
      mucSau.muc,
    ]);
    expect(ket?.article.sections?.[1]).toEqual(MUC_DUNG_SAN);
    expect(ai.requests).toHaveLength(3);
  });

  it('mục bắt buộc bị chặn đủ MAX_ATTEMPTS lần thì cả chương hỏng', async () => {
    kiem.mockImplementation((brief) =>
      'muc' in brief && brief.muc === mucDau.muc ? ['chặn'] : [],
    );
    const chuong = voiMuc([{ kind: MucKind.PhuTinh, brief: mucDau, isRequired: true }]);

    await expect(
      new ChapterGenerator(new AiTheoSchema()).generate(chuong, CO_BANG, BUDGET_MS, NO_VIEW_YEAR),
    ).rejects.toThrow(RequiredMucFailedError);
  });

  it('mục không bắt buộc bị chặn thì chỉ mất mục đó', async () => {
    kiem.mockImplementation((brief) =>
      'muc' in brief && brief.muc === mucDau.muc ? ['chặn'] : [],
    );
    const chuong = voiMuc([{ kind: MucKind.PhuTinh, brief: mucDau }]);

    const ket = await new ChapterGenerator(new AiTheoSchema()).generate(
      chuong,
      CO_BANG,
      BUDGET_MS,
      NO_VIEW_YEAR,
    );

    expect(ket?.article.sections).toBeUndefined();
  });

  it('mục phụ tinh có prompt riêng thì gửi đúng prompt ấy', async () => {
    const ai = new AiTheoSchema();
    const chuong = voiMuc([{ kind: MucKind.PhuTinh, brief: mucDau, systemPrompt: PROMPT_RIENG }]);

    await new ChapterGenerator(ai).generate(chuong, CO_BANG, BUDGET_MS, NO_VIEW_YEAR);

    expect(ai.requestsOf(PROMPT_RIENG)).not.toHaveLength(0);
  });

  it('chuyển ngữ cảnh năm xem tới brief, mục và khung', async () => {
    const nguCanh: ChapterContext = { viewYear: 2027, currentYear: 2026 };
    const buildBrief = jest.fn(THAN_CU_CHAPTER.buildBrief);
    const buildMucs = jest.fn(() => []);
    const khung = jest.fn(THAN_CU_CHAPTER.khung);
    const chuong: ChapterDefinition = { ...THAN_CU_CHAPTER, buildBrief, buildMucs, khung };

    await new ChapterGenerator(new AiTheoSchema()).generate(chuong, CO_BANG, BUDGET_MS, nguCanh);

    expect(buildBrief).toHaveBeenCalledWith(CO_BANG, nguCanh);
    expect(buildMucs).toHaveBeenCalledWith(CO_BANG, nguCanh);
    expect(khung).toHaveBeenCalledWith(expect.anything(), CO_BANG, nguCanh);
  });
});
