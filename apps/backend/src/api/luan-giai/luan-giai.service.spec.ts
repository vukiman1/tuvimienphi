// Sau khi bảng phủ 100% thì không còn lá số thật nào cho ra null, mà nhánh unavailable vẫn phải
// giữ làm lưới an toàn khi bảng thay đổi — nên mock chỗ dựng brief để chạm tới nó.
jest.mock('@org/shared-tu-vi', () => ({
  ...jest.requireActual('@org/shared-tu-vi'),
  buildThanCuBrief: jest.fn(),
}));

import {
  CalendarType,
  Gender,
  LuanGiaiChapterStatus,
  type BirthInput,
  type LuanGiaiArticle,
} from '@org/shared-contracts';
import { buildThanCuBrief } from '@org/shared-tu-vi';
import type { Repository } from 'typeorm';
import { currentAiCallContext, type AiCallContext } from '../../ai/port/ai-call-context';
import { AllowanceSource } from '../credits/allowance-source.enum';
import type { ChapterAllowanceService } from '../credits/chapter-allowance.service';
import type { LuanGiaiChapterEntity } from './entities/luan-giai-chapter.entity';
import {
  CHAPTER_CONG_DANH,
  CHAPTER_MENH,
  CHAPTER_TAI_BACH,
  CHAPTER_THAN_CU,
  CHAPTER_TINH_DUYEN,
} from './luan-giai.constants';
import {
  ChapterGenerationFailedException,
  ChapterQuotaExceededException,
} from './luan-giai.exceptions';
import type { ChapterGenerator, ChapterResult } from './chapter-generator';
import { CHAPTER_DEFINITIONS } from './chapter-registry';
import { LuanGiaiService } from './luan-giai.service';

/** Thân cư Phu Thê, Liêm Trinh + Tham Lang — tổ hợp đã có trong bảng luận. */
const CO_BANG: BirthInput = {
  day: 26,
  month: 5,
  year: 1960,
  calendar: CalendarType.Solar,
  hour: 'Hợi',
  gender: Gender.Male,
};

const BAI = { title: 'Thân cư Phu Thê' } as LuanGiaiArticle;

const KET: ChapterResult = { article: BAI, model: 'gemini-gia', attempts: 1 };
const dungBrief = buildThanCuBrief as jest.MockedFunction<typeof buildThanCuBrief>;

interface Overrides {
  readonly row?: LuanGiaiChapterEntity | null;
  readonly daCo?: readonly Pick<LuanGiaiChapterEntity, 'chapterOrder'>[];
  readonly conSuat?: boolean;
  readonly sinh?: jest.Mock;
}

function dungService(overrides?: Overrides) {
  const repo = {
    findOne: jest.fn().mockResolvedValue(overrides?.row ?? null),
    find: jest.fn().mockResolvedValue(overrides?.daCo ?? []),
    upsert: jest.fn().mockResolvedValue(undefined),
  };
  const allowance = {
    consume: jest
      .fn()
      .mockResolvedValue(overrides?.conSuat === false ? null : AllowanceSource.Daily),
    refund: jest.fn().mockResolvedValue(undefined),
  };
  const generator = {
    generate: overrides?.sinh ?? jest.fn().mockResolvedValue(KET),
  };

  return {
    service: new LuanGiaiService(
      repo as unknown as Repository<LuanGiaiChapterEntity>,
      allowance as unknown as ChapterAllowanceService,
      generator as unknown as ChapterGenerator,
    ),
    repo,
    allowance,
    generator,
  };
}

describe('LuanGiaiService.request', () => {
  beforeEach(() => {
    dungBrief
      .mockReset()
      .mockReturnValue(
        jest
          .requireActual('@org/shared-tu-vi')
          .buildThanCuBrief(
            jest.requireActual('@org/shared-tu-vi').chartFromBirthInput(CO_BANG).chart,
          ),
      );
  });

  it('trả bài đã có mà không sinh lại cũng không trừ suất', async () => {
    const { service, generator, allowance } = dungService({
      row: { article: BAI } as LuanGiaiChapterEntity,
    });

    const ket = await service.request('u1', CO_BANG, CHAPTER_THAN_CU);

    expect(ket).toEqual({ status: LuanGiaiChapterStatus.Ready, article: BAI });
    expect(generator.generate).not.toHaveBeenCalled();
    expect(allowance.consume).not.toHaveBeenCalled();
  });

  it('sinh chương 02 bằng định nghĩa của chính chương đó', async () => {
    const { service, generator } = dungService();

    const ket = await service.request('u1', CO_BANG, CHAPTER_MENH);

    expect(ket).toEqual({ status: LuanGiaiChapterStatus.Ready, article: BAI });
    expect(generator.generate).toHaveBeenCalledTimes(1);
    expect(generator.generate).toHaveBeenCalledWith(
      CHAPTER_DEFINITIONS.get(CHAPTER_MENH),
      expect.anything(),
      expect.any(Number),
    );
  });

  it('sinh chương 03 bằng định nghĩa của chính chương đó', async () => {
    const { service, generator } = dungService();

    const ket = await service.request('u1', CO_BANG, CHAPTER_CONG_DANH);

    expect(ket).toEqual({ status: LuanGiaiChapterStatus.Ready, article: BAI });
    expect(generator.generate).toHaveBeenCalledTimes(1);
    expect(generator.generate).toHaveBeenCalledWith(
      CHAPTER_DEFINITIONS.get(CHAPTER_CONG_DANH),
      expect.anything(),
      expect.any(Number),
    );
  });

  it('sinh chương 04 bằng định nghĩa của chính chương đó', async () => {
    const { service, generator } = dungService();

    const ket = await service.request('u1', CO_BANG, CHAPTER_TAI_BACH);

    expect(ket).toEqual({ status: LuanGiaiChapterStatus.Ready, article: BAI });
    expect(generator.generate).toHaveBeenCalledTimes(1);
    expect(generator.generate).toHaveBeenCalledWith(
      CHAPTER_DEFINITIONS.get(CHAPTER_TAI_BACH),
      expect.anything(),
      expect.any(Number),
    );
  });

  it('sinh chương 05 bằng định nghĩa của chính chương đó', async () => {
    const { service, generator } = dungService();

    const ket = await service.request('u1', CO_BANG, CHAPTER_TINH_DUYEN);

    expect(ket).toEqual({ status: LuanGiaiChapterStatus.Ready, article: BAI });
    expect(generator.generate).toHaveBeenCalledTimes(1);
    expect(generator.generate).toHaveBeenCalledWith(
      CHAPTER_DEFINITIONS.get(CHAPTER_TINH_DUYEN),
      expect.anything(),
      expect.any(Number),
    );
  });

  it('báo unavailable cho chương chưa có bảng, không đụng tới database', async () => {
    const { service, repo, allowance } = dungService();

    const ket = await service.request('u1', CO_BANG, '06');

    expect(ket).toEqual({ status: LuanGiaiChapterStatus.Unavailable });
    expect(repo.findOne).not.toHaveBeenCalled();
    expect(allowance.consume).not.toHaveBeenCalled();
  });

  it('báo unavailable khi không dựng nổi brief, không trừ suất cho việc chắc chắn không ra bài', async () => {
    dungBrief.mockReturnValue(null);
    const { service, generator, allowance } = dungService();

    const ket = await service.request('u1', CO_BANG, CHAPTER_THAN_CU);

    expect(ket).toEqual({ status: LuanGiaiChapterStatus.Unavailable });
    expect(allowance.consume).not.toHaveBeenCalled();
    expect(generator.generate).not.toHaveBeenCalled();
  });

  it('từ chối khi hết suất trong ngày và không gọi mô hình', async () => {
    const { service, generator } = dungService({ conSuat: false });

    await expect(service.request('u1', CO_BANG, CHAPTER_THAN_CU)).rejects.toThrow(
      ChapterQuotaExceededException,
    );
    expect(generator.generate).not.toHaveBeenCalled();
  });

  it('sinh xong thì lưu lại theo lá số rồi trả bài luôn', async () => {
    const { service, repo } = dungService();

    const ket = await service.request('u1', CO_BANG, CHAPTER_THAN_CU);

    expect(ket).toEqual({ status: LuanGiaiChapterStatus.Ready, article: BAI });
    expect(repo.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ birthKey: '1960-05-26-duong-h11-nam', chapterOrder: '01' }),
      ['birthKey', 'chapterOrder'],
    );
  });

  it('sinh trong ngữ cảnh của người yêu cầu, để từng lượt gọi AI ghi được ai gọi và cho chương nào', async () => {
    let nguCanh: AiCallContext = {};
    const sinh = jest.fn(async () => {
      await Promise.resolve();
      nguCanh = currentAiCallContext();
      return KET;
    });
    const { service } = dungService({ sinh });

    await service.request('user-1', CO_BANG, CHAPTER_THAN_CU);

    expect(nguCanh).toEqual({ userId: 'user-1', label: `luan-giai:${CHAPTER_THAN_CU}` });
    expect(currentAiCallContext()).toEqual({});
  });

  it('hoàn suất khi lượt sinh hỏng vì phía hệ thống', async () => {
    const { service, allowance } = dungService({
      sinh: jest.fn().mockRejectedValue(new Error('UNAVAILABLE')),
    });

    await expect(service.request('u1', CO_BANG, CHAPTER_THAN_CU)).rejects.toThrow(
      ChapterGenerationFailedException,
    );
    expect(allowance.refund).toHaveBeenCalledWith('u1', AllowanceSource.Daily);
  });
});

describe('LuanGiaiService.status', () => {
  it('chương đã có bài thì mở được, chương có bảng mà chưa sinh thì còn khoá', async () => {
    const { service } = dungService({ daCo: [{ chapterOrder: CHAPTER_THAN_CU }] });

    const { chapters } = await service.status('1960-05-26-duong-h11-nam');

    expect(chapters[CHAPTER_THAN_CU]).toBe(LuanGiaiChapterStatus.Ready);
  });

  it('chương chưa có bảng luận thì báo unavailable chứ không phải khoá chờ bấm', async () => {
    const { service } = dungService();

    const { chapters } = await service.status('1960-05-26-duong-h11-nam');

    expect(chapters[CHAPTER_THAN_CU]).toBe(LuanGiaiChapterStatus.Pending);
    expect(chapters['06']).toBe(LuanGiaiChapterStatus.Unavailable);
  });

  it('liệt kê đủ sáu chương để mục lục không bị thiếu ô', async () => {
    const { service } = dungService();

    const { chapters } = await service.status('1960-05-26-duong-h11-nam');

    expect(Object.keys(chapters)).toHaveLength(6);
  });
});
