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
import type { ChapterQuotaService } from './chapter-quota.service';
import type { LuanGiaiChapterEntity } from './entities/luan-giai-chapter.entity';
import { CHAPTER_THAN_CU } from './luan-giai.constants';
import {
  ChapterGenerationFailedException,
  ChapterQuotaExceededException,
} from './luan-giai.exceptions';
import type { ThanCuGenerator, ThanCuResult } from './than-cu.generator';
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

const KET: ThanCuResult = { article: BAI, model: 'gemini-gia', attempts: 1 };
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
  const quota = {
    consume: jest.fn().mockResolvedValue(overrides?.conSuat ?? true),
    refund: jest.fn().mockResolvedValue(undefined),
  };
  const generator = { generate: overrides?.sinh ?? jest.fn().mockResolvedValue(KET) };

  return {
    service: new LuanGiaiService(
      repo as unknown as Repository<LuanGiaiChapterEntity>,
      quota as unknown as ChapterQuotaService,
      generator as unknown as ThanCuGenerator,
    ),
    repo,
    quota,
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
    const { service, generator, quota } = dungService({
      row: { article: BAI } as LuanGiaiChapterEntity,
    });

    const ket = await service.request('u1', CO_BANG, CHAPTER_THAN_CU);

    expect(ket).toEqual({ status: LuanGiaiChapterStatus.Ready, article: BAI });
    expect(generator.generate).not.toHaveBeenCalled();
    expect(quota.consume).not.toHaveBeenCalled();
  });

  it('báo unavailable cho chương chưa có bảng, không đụng tới database', async () => {
    const { service, repo, quota } = dungService();

    const ket = await service.request('u1', CO_BANG, '05');

    expect(ket).toEqual({ status: LuanGiaiChapterStatus.Unavailable });
    expect(repo.findOne).not.toHaveBeenCalled();
    expect(quota.consume).not.toHaveBeenCalled();
  });

  it('báo unavailable khi không dựng nổi brief, không trừ suất cho việc chắc chắn không ra bài', async () => {
    dungBrief.mockReturnValue(null);
    const { service, generator, quota } = dungService();

    const ket = await service.request('u1', CO_BANG, CHAPTER_THAN_CU);

    expect(ket).toEqual({ status: LuanGiaiChapterStatus.Unavailable });
    expect(quota.consume).not.toHaveBeenCalled();
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

  it('hoàn suất khi lượt sinh hỏng vì phía hệ thống', async () => {
    const { service, quota } = dungService({
      sinh: jest.fn().mockRejectedValue(new Error('UNAVAILABLE')),
    });

    await expect(service.request('u1', CO_BANG, CHAPTER_THAN_CU)).rejects.toThrow(
      ChapterGenerationFailedException,
    );
    expect(quota.refund).toHaveBeenCalledWith('u1');
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
    expect(chapters['05']).toBe(LuanGiaiChapterStatus.Unavailable);
  });

  it('liệt kê đủ sáu chương để mục lục không bị thiếu ô', async () => {
    const { service } = dungService();

    const { chapters } = await service.status('1960-05-26-duong-h11-nam');

    expect(Object.keys(chapters)).toHaveLength(6);
  });
});
