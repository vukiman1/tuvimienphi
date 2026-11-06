jest.mock('@org/shared-tu-vi', () => ({
  ...jest.requireActual('@org/shared-tu-vi'),
  buildThanCuBrief: jest.fn(),
}));

import {
  birthKey,
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
import type { FunnelService } from '../funnel/funnel.service';
import type { LuanGiaiChapterEntity } from './entities/luan-giai-chapter.entity';
import {
  CHAPTER_CONG_DANH,
  CHAPTER_MENH,
  CHAPTER_TAI_BACH,
  CHAPTER_THAN_CU,
  CHAPTER_TINH_DUYEN,
  CHAPTER_VAN_HAN,
} from './luan-giai.constants';
import { RequiredMucFailedError } from './luan-giai.errors';
import {
  ChapterGenerationFailedException,
  ChapterQuotaExceededException,
  InvalidViewYearException,
  ViewYearRequiredException,
} from './luan-giai.exceptions';
import type { ChapterGenerator, ChapterResult } from './generation/chapter-generator';
import { CHAPTER_DEFINITIONS } from './generation/chapter-registry';
import { LuanGiaiService } from './luan-giai.service';

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
  readonly daCo?: readonly Pick<LuanGiaiChapterEntity, 'chapterOrder' | 'viewYear'>[];
  readonly conSuat?: boolean;
  readonly nguon?: AllowanceSource;
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
      .mockResolvedValue(
        overrides?.conSuat === false ? null : (overrides?.nguon ?? AllowanceSource.Daily),
      ),
    refund: jest.fn().mockResolvedValue(undefined),
  };
  const generator = {
    generate: overrides?.sinh ?? jest.fn().mockResolvedValue(KET),
  };
  const funnel = { recordUnlock: jest.fn().mockResolvedValue(undefined) };

  return {
    service: new LuanGiaiService(
      repo as unknown as Repository<LuanGiaiChapterEntity>,
      allowance as unknown as ChapterAllowanceService,
      generator as unknown as ChapterGenerator,
      funnel as unknown as FunnelService,
    ),
    repo,
    allowance,
    generator,
    funnel,
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
      { viewYear: null, currentYear: expect.any(Number) },
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
      { viewYear: null, currentYear: expect.any(Number) },
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
      { viewYear: null, currentYear: expect.any(Number) },
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
      { viewYear: null, currentYear: expect.any(Number) },
    );
  });

  it('báo unavailable cho chương chưa có bảng, không đụng tới database', async () => {
    const { service, repo, allowance } = dungService();

    const ket = await service.request('u1', CO_BANG, '99');

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
      expect.objectContaining({
        birthKey: '1960-05-26-duong-h11-nam',
        chapterOrder: '01',
        viewYear: 0,
      }),
      ['birthKey', 'chapterOrder', 'viewYear'],
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

interface Deferred<T> {
  readonly promise: Promise<T>;
  readonly resolve: (value: T) => void;
  readonly reject: (error: Error) => void;
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

describe('LuanGiaiService funnel unlocks', () => {
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

  it('records an unlock with the allowance source after a chapter is saved', async () => {
    const { service, funnel } = dungService({ nguon: AllowanceSource.Credit });

    await service.request('u1', CO_BANG, CHAPTER_THAN_CU);

    expect(funnel.recordUnlock).toHaveBeenCalledTimes(1);
    expect(funnel.recordUnlock).toHaveBeenCalledWith(birthKey(CO_BANG), AllowanceSource.Credit);
  });

  it('does not record an unlock when generation is unavailable', async () => {
    const { service, funnel } = dungService({ sinh: jest.fn().mockResolvedValue(null) });

    await service.request('u1', CO_BANG, CHAPTER_THAN_CU);

    expect(funnel.recordUnlock).not.toHaveBeenCalled();
  });

  it('does not record an unlock when generation fails', async () => {
    const { service, funnel } = dungService({
      sinh: jest.fn().mockRejectedValue(new Error('UNAVAILABLE')),
    });

    await expect(service.request('u1', CO_BANG, CHAPTER_THAN_CU)).rejects.toBeInstanceOf(
      ChapterGenerationFailedException,
    );
    expect(funnel.recordUnlock).not.toHaveBeenCalled();
  });

  it('does not record an unlock when the chapter was already generated', async () => {
    const { service, funnel } = dungService({ row: { article: BAI } as LuanGiaiChapterEntity });

    await service.request('u1', CO_BANG, CHAPTER_THAN_CU);

    expect(funnel.recordUnlock).not.toHaveBeenCalled();
  });
});

describe('LuanGiaiService.request khi một chương đang được sinh dở', () => {
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

  it('request đến sau chờ chung lượt đang sinh, không sinh lại và không trừ thêm suất', async () => {
    const generation = deferred<ChapterResult>();
    const { service, generator, allowance } = dungService({
      sinh: jest.fn().mockReturnValue(generation.promise),
    });

    const truoc = service.request('u1', CO_BANG, CHAPTER_THAN_CU);
    const sau = service.request('u1', CO_BANG, CHAPTER_THAN_CU);
    generation.resolve(KET);

    const ready = { status: LuanGiaiChapterStatus.Ready, article: BAI };
    await expect(truoc).resolves.toEqual(ready);
    await expect(sau).resolves.toEqual(ready);
    expect(generator.generate).toHaveBeenCalledTimes(1);
    expect(allowance.consume).toHaveBeenCalledTimes(1);
  });

  it('lượt đang sinh hỏng thì hoàn suất đúng một lần và báo hỏng cho mọi request đang chờ', async () => {
    const generation = deferred<ChapterResult>();
    const { service, allowance } = dungService({
      sinh: jest.fn().mockReturnValue(generation.promise),
    });

    const truoc = service.request('u1', CO_BANG, CHAPTER_THAN_CU);
    const sau = service.request('u1', CO_BANG, CHAPTER_THAN_CU);
    generation.reject(new Error('UNAVAILABLE'));

    await expect(truoc).rejects.toThrow(ChapterGenerationFailedException);
    await expect(sau).rejects.toThrow(ChapterGenerationFailedException);
    expect(allowance.refund).toHaveBeenCalledTimes(1);
  });

  it('hai chương khác nhau của cùng lá số sinh song song, không chờ nhau', async () => {
    const thanCu = deferred<ChapterResult>();
    const menh = deferred<ChapterResult>();
    const bothStarted = deferred<void>();
    const sinh = jest.fn((chapter: unknown) => {
      if (sinh.mock.calls.length === 2) bothStarted.resolve();
      return chapter === CHAPTER_DEFINITIONS.get(CHAPTER_MENH) ? menh.promise : thanCu.promise;
    });
    const { service } = dungService({ sinh });

    const requests = Promise.all([
      service.request('u1', CO_BANG, CHAPTER_THAN_CU),
      service.request('u1', CO_BANG, CHAPTER_MENH),
    ]);
    await bothStarted.promise;
    thanCu.resolve(KET);
    menh.resolve({ ...KET, article: { title: 'Mệnh' } as LuanGiaiArticle });

    const [thanCuKet, menhKet] = await requests;
    expect(thanCuKet).toEqual({ status: LuanGiaiChapterStatus.Ready, article: BAI });
    expect(menhKet).toEqual({
      status: LuanGiaiChapterStatus.Ready,
      article: { title: 'Mệnh' },
    });
  });

  it('request đến khi chương đang sinh dở thì chờ luôn, không đọc lại database', async () => {
    const generation = deferred<ChapterResult>();
    const { service, repo } = dungService({
      sinh: jest.fn().mockReturnValue(generation.promise),
    });

    const truoc = service.request('u1', CO_BANG, CHAPTER_THAN_CU);
    const sau = service.request('u2', CO_BANG, CHAPTER_THAN_CU);
    generation.resolve(KET);
    await Promise.all([truoc, sau]);

    expect(repo.findOne).toHaveBeenCalledTimes(1);
  });

  it('lượt trước đã xong mà chưa có bài thì request sau sinh lượt mới', async () => {
    const { service, generator } = dungService({
      sinh: jest.fn().mockRejectedValueOnce(new Error('UNAVAILABLE')).mockResolvedValue(KET),
    });

    await expect(service.request('u1', CO_BANG, CHAPTER_THAN_CU)).rejects.toThrow(
      ChapterGenerationFailedException,
    );
    const ket = await service.request('u1', CO_BANG, CHAPTER_THAN_CU);

    expect(ket).toEqual({ status: LuanGiaiChapterStatus.Ready, article: BAI });
    expect(generator.generate).toHaveBeenCalledTimes(2);
  });

  it('người đi trước hết suất thì người đang chờ tự sinh bằng suất của mình', async () => {
    const { service, generator, allowance } = dungService();
    allowance.consume.mockResolvedValueOnce(null).mockResolvedValue(AllowanceSource.Credit);

    const truoc = service.request('het-suat', CO_BANG, CHAPTER_THAN_CU);
    const sau = service.request('con-suat', CO_BANG, CHAPTER_THAN_CU);

    await expect(truoc).rejects.toThrow(ChapterQuotaExceededException);
    await expect(sau).resolves.toEqual({ status: LuanGiaiChapterStatus.Ready, article: BAI });
    expect(allowance.consume).toHaveBeenLastCalledWith('con-suat');
    expect(generator.generate).toHaveBeenCalledTimes(1);
  });
});

describe('LuanGiaiService.status', () => {
  it('chương đã có bài thì mở được, chương có bảng mà chưa sinh thì còn khoá', async () => {
    const { service } = dungService({ daCo: [{ chapterOrder: CHAPTER_THAN_CU, viewYear: 0 }] });

    const { chapters } = await service.status('1960-05-26-duong-h11-nam');

    expect(chapters[CHAPTER_THAN_CU]).toBe(LuanGiaiChapterStatus.Ready);
  });

  it('chương có bảng mà chưa sinh thì còn khoá chờ bấm', async () => {
    const { service } = dungService();

    const { chapters } = await service.status('1960-05-26-duong-h11-nam');

    expect(chapters[CHAPTER_THAN_CU]).toBe(LuanGiaiChapterStatus.Pending);
  });

  it('liệt kê đủ sáu chương để mục lục không bị thiếu ô', async () => {
    const { service } = dungService();

    const { chapters } = await service.status('1960-05-26-duong-h11-nam');

    expect(Object.keys(chapters)).toHaveLength(6);
  });
});

const KEY = '1960-05-26-duong-h11-nam';
const VIEW_YEAR = 2027;

describe('LuanGiaiService theo năm xem', () => {
  it('chương 06 sinh và lưu theo đúng năm xem, với ngữ cảnh năm hiện tại', async () => {
    const { service, generator, repo } = dungService();

    const ket = await service.request('u1', CO_BANG, CHAPTER_VAN_HAN, VIEW_YEAR);

    expect(ket).toEqual({ status: LuanGiaiChapterStatus.Ready, article: BAI });
    expect(generator.generate).toHaveBeenCalledWith(
      CHAPTER_DEFINITIONS.get(CHAPTER_VAN_HAN),
      expect.anything(),
      expect.any(Number),
      { viewYear: VIEW_YEAR, currentYear: new Date().getFullYear() },
    );
    expect(repo.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ chapterOrder: CHAPTER_VAN_HAN, viewYear: VIEW_YEAR }),
      ['birthKey', 'chapterOrder', 'viewYear'],
    );
  });

  it('chương 06 thiếu năm xem thì từ chối trước khi trừ suất', async () => {
    const { service, allowance } = dungService();

    await expect(service.request('u1', CO_BANG, CHAPTER_VAN_HAN)).rejects.toThrow(
      ViewYearRequiredException,
    );
    expect(allowance.consume).not.toHaveBeenCalled();
  });

  it('năm xem ngoài khoảng tra được thì từ chối trước khi chạm database', async () => {
    const { service, repo } = dungService();

    await expect(service.read(KEY, CHAPTER_VAN_HAN, 99_999)).rejects.toThrow(
      InvalidViewYearException,
    );
    expect(repo.findOne).not.toHaveBeenCalled();
  });

  it('năm xem trước năm sinh thì báo unavailable và không trừ suất', async () => {
    const { service, allowance } = dungService();

    const ket = await service.request('u1', CO_BANG, CHAPTER_VAN_HAN, 1950);

    expect(ket).toEqual({ status: LuanGiaiChapterStatus.Unavailable });
    expect(allowance.consume).not.toHaveBeenCalled();
  });

  it('chương không theo năm thì bỏ qua năm xem client gửi, vẫn tìm và lưu ở năm 0', async () => {
    const { service, repo, generator } = dungService();

    await service.request('u1', CO_BANG, CHAPTER_MENH, VIEW_YEAR);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { birthKey: KEY, chapterOrder: CHAPTER_MENH, viewYear: 0 },
    });
    expect(repo.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ chapterOrder: CHAPTER_MENH, viewYear: 0 }),
      ['birthKey', 'chapterOrder', 'viewYear'],
    );
    expect(generator.generate).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.any(Number),
      expect.objectContaining({ viewYear: null }),
    );
  });

  it('hai năm xem khác nhau của chương 06 sinh riêng, cùng một năm thì chờ chung', async () => {
    const generation = deferred<ChapterResult>();
    const { service, generator, allowance } = dungService({
      sinh: jest.fn().mockReturnValue(generation.promise),
    });

    const requests = Promise.all([
      service.request('u1', CO_BANG, CHAPTER_VAN_HAN, 2026),
      service.request('u1', CO_BANG, CHAPTER_VAN_HAN, VIEW_YEAR),
      service.request('u2', CO_BANG, CHAPTER_VAN_HAN, VIEW_YEAR),
    ]);
    generation.resolve(KET);
    await requests;

    expect(generator.generate).toHaveBeenCalledTimes(2);
    expect(allowance.consume).toHaveBeenCalledTimes(2);
  });

  it('mục bắt buộc hỏng thì hoàn suất đúng một lần và không lưu gì', async () => {
    const { service, allowance, repo } = dungService({
      sinh: jest.fn().mockRejectedValue(new RequiredMucFailedError('Điều cần giữ', 'chặn')),
    });

    await expect(service.request('u1', CO_BANG, CHAPTER_VAN_HAN, VIEW_YEAR)).rejects.toThrow(
      ChapterGenerationFailedException,
    );
    expect(allowance.refund).toHaveBeenCalledTimes(1);
    expect(repo.upsert).not.toHaveBeenCalled();
  });

  it('đọc chương 06 theo đúng năm xem', async () => {
    const { service, repo } = dungService({ row: { article: BAI } as LuanGiaiChapterEntity });

    const ket = await service.read(KEY, CHAPTER_VAN_HAN, VIEW_YEAR);

    expect(ket).toEqual({ status: LuanGiaiChapterStatus.Ready, article: BAI });
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { birthKey: KEY, chapterOrder: CHAPTER_VAN_HAN, viewYear: VIEW_YEAR },
    });
  });

  it('chương 06 chỉ mở khi đã có bài cho đúng năm đang xem', async () => {
    const { service } = dungService({
      daCo: [{ chapterOrder: CHAPTER_VAN_HAN, viewYear: 2026 }],
    });

    const nam2026 = await service.status(KEY, 2026);
    const nam2027 = await service.status(KEY, VIEW_YEAR);

    expect(nam2026.chapters[CHAPTER_VAN_HAN]).toBe(LuanGiaiChapterStatus.Ready);
    expect(nam2027.chapters[CHAPTER_VAN_HAN]).toBe(LuanGiaiChapterStatus.Pending);
  });

  it('không gửi năm xem thì chương 06 còn khoá chờ bấm', async () => {
    const { service } = dungService({
      daCo: [{ chapterOrder: CHAPTER_VAN_HAN, viewYear: VIEW_YEAR }],
    });

    const { chapters } = await service.status(KEY);

    expect(chapters[CHAPTER_VAN_HAN]).toBe(LuanGiaiChapterStatus.Pending);
  });

  it('chương không theo năm mở như nhau ở mọi năm xem', async () => {
    const { service } = dungService({ daCo: [{ chapterOrder: CHAPTER_MENH, viewYear: 0 }] });

    const { chapters } = await service.status(KEY, VIEW_YEAR);

    expect(chapters[CHAPTER_MENH]).toBe(LuanGiaiChapterStatus.Ready);
  });
});
