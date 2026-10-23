jest.mock('./validate/check-paragraphs', () => ({
  checkParagraphs: jest.fn((_brief: unknown, bai: { readonly doan: readonly string[] }) =>
    bai.doan.some((doan) => doan.includes('LẦN 1')) ? ['lỗi giả'] : [],
  ),
}));

import {
  buildMenhBrief,
  buildMucBriefs,
  buildThanCuBrief,
  castNatal,
  Gender,
  GiaDaoMucKey,
  type NatalChart,
} from '@org/shared-tu-vi';
import { AiClient } from '../../ai/port/ai.client';
import type { AiMessage, AiRequest, AiResult, AiSchema } from '../../ai/port/ai.types';
import { ChapterGenerator, type ChapterResult } from './generation/chapter-generator';
import { CHAPTER_DEFINITIONS } from './generation/chapter-registry';

interface LaSoMau {
  readonly ten: string;
  readonly chart: NatalChart;
}

interface GhiLai {
  readonly system: string;
  readonly messages: readonly AiMessage[];
  readonly schema: AiSchema;
}

const BUDGET_MS = 60_000;
const MUC_THEO_CUNG_GIA_DAO: Readonly<Record<string, GiaDaoMucKey>> = {
  'Tử Tức': GiaDaoMucKey.ConCai,
  'Phụ Mẫu': GiaDaoMucKey.ChaMe,
};
const CHAPTER_ORDERS_DA_CO = ['01', '02', '03', '04', '05'] as const;

const LA_SO_MAU: readonly LaSoMau[] = [
  {
    ten: '1960-05-26 21h Nam',
    chart: castNatal({ solarDate: new Date(1960, 4, 26), hour: 21, gender: Gender.Nam }),
  },
  {
    ten: '1956-03-03 1h Nam',
    chart: castNatal({ solarDate: new Date(1956, 2, 3), hour: 1, gender: Gender.Nam }),
  },
  {
    ten: '1955-06-26 21h Nữ',
    chart: castNatal({ solarDate: new Date(1955, 5, 26), hour: 21, gender: Gender.Nu }),
  },
  {
    ten: '1955-12-09 7h Nữ',
    chart: castNatal({ solarDate: new Date(1955, 11, 9), hour: 7, gender: Gender.Nu }),
  },
];

function tenMuc(briefText: string): string {
  const brief: unknown = JSON.parse(briefText);
  if (typeof brief !== 'object' || brief === null) return 'chinh';
  if ('muc' in brief) return String(brief.muc);
  if ('cung' in brief) return MUC_THEO_CUNG_GIA_DAO[String(brief.cung)] ?? 'chinh';
  return 'chinh';
}

class DuplicateRequestKeyError extends Error {
  constructor(key: string) {
    super(`Hai request cùng khoá ghi lại: ${key}`);
    this.name = 'DuplicateRequestKeyError';
  }
}

class AiGhiLai extends AiClient {
  readonly requests = new Map<string, GhiLai>();

  generate(request: AiRequest): Promise<AiResult> {
    const lan = (request.messages.length + 1) / 2;
    const muc = tenMuc(request.messages[0].text);
    const key = `${muc}#${lan}`;
    if (this.requests.has(key)) throw new DuplicateRequestKeyError(key);
    this.requests.set(key, {
      system: request.system,
      messages: request.messages,
      schema: request.schema,
    });
    const isBaiChinh = 'doan1' in (request.schema.properties ?? {});
    const reply = isBaiChinh
      ? { doan1: `LẦN ${lan} đoạn một. Câu hai.`, doan2: `LẦN ${lan} đoạn hai. Câu hai.` }
      : { doan: `LẦN ${lan} mục. Câu hai.` };
    return Promise.resolve({
      text: JSON.stringify(reply),
      model: 'gia',
      inputTokens: 0,
      outputTokens: 0,
      failedAttempts: [],
      latencyMs: 0,
    });
  }

  sortedRequests(): Record<string, GhiLai> {
    return Object.fromEntries(
      [...this.requests.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
    );
  }
}

function sinhChuong(order: string, chart: NatalChart, ai: AiClient): Promise<ChapterResult | null> {
  const chapter = CHAPTER_DEFINITIONS.get(order);
  if (!chapter) throw new Error(`Chương ${order} chưa có định nghĩa`);
  return new ChapterGenerator(ai).generate(chapter, chart, BUDGET_MS);
}

describe.each(CHAPTER_ORDERS_DA_CO)('chương %s', (order) => {
  describe.each(LA_SO_MAU)('lá số $ten', ({ chart }) => {
    it('ghi lại cả lượt sinh lại', async () => {
      const ai = new AiGhiLai();

      const ket = await sinhChuong(order, chart, ai);

      expect({
        requests: ai.sortedRequests(),
        article: ket?.article,
        attempts: ket?.attempts,
      }).toMatchSnapshot();
    });
  });
});

describe('bộ lá số mẫu', () => {
  it('phủ đủ các nhánh', () => {
    const charts = LA_SO_MAU.map(({ chart }) => chart);
    const cungThanCu = new Set(charts.map((chart) => buildThanCuBrief(chart)?.cung));

    expect(charts.some((chart) => buildMenhBrief(chart)?.laVoChinhDieu === true)).toBe(true);
    expect(charts.some((chart) => buildThanCuBrief(chart)?.laVoChinhDieu === true)).toBe(true);
    expect(cungThanCu.size).toBeGreaterThanOrEqual(3);
    expect(new Set(charts.map((chart) => chart.gender)).size).toBe(2);
    expect(charts.every((chart) => buildMucBriefs(chart).length > 0)).toBe(true);
  });
});
