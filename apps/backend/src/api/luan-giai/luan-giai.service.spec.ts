// @nestjs/bullmq chỉ phát hành bản ESM nên jest không nạp được. Service chỉ mượn decorator
// `InjectQueue` từ đó, và test tiêm queue giả bằng tay nên decorator không cần làm gì.
jest.mock('@nestjs/bullmq', () => ({ InjectQueue: () => () => undefined }));

import {
  CalendarType,
  Gender,
  LuanGiaiChapterStatus,
  type BirthInput,
  type LuanGiaiArticle,
} from '@org/shared-contracts';
import type { Queue } from 'bullmq';
import type { Repository } from 'typeorm';
import type { ChapterQuotaService } from './chapter-quota.service';
import type { LuanGiaiChapterEntity } from './entities/luan-giai-chapter.entity';
import { CHAPTER_THAN_CU, type GenerateChapterJob } from './luan-giai.constants';
import { ChapterQuotaExceededException } from './luan-giai.exceptions';
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
/** Thân cư Phu Thê nhưng chính tinh là Cự Môn — bảng chưa soạn tới. */
const CHUA_SOAN: BirthInput = { ...CO_BANG, day: 20, month: 5, year: 1985, hour: 'Tị' };

const BAI = { title: 'Thân cư Phu Thê' } as LuanGiaiArticle;

function dungService(overrides?: { row?: LuanGiaiChapterEntity | null; conSuat?: boolean }) {
  const repo = {
    findOne: jest.fn().mockResolvedValue(overrides?.row ?? null),
    upsert: jest.fn().mockResolvedValue(undefined),
  };
  const queue = { add: jest.fn().mockResolvedValue(undefined) };
  const quota = { consume: jest.fn().mockResolvedValue(overrides?.conSuat ?? true) };

  return {
    service: new LuanGiaiService(
      repo as unknown as Repository<LuanGiaiChapterEntity>,
      queue as unknown as Queue<GenerateChapterJob>,
      quota as unknown as ChapterQuotaService,
    ),
    repo,
    queue,
    quota,
  };
}

describe('LuanGiaiService.request', () => {
  it('trả bài đã có mà không xếp hàng cũng không trừ suất', async () => {
    const { service, queue, quota } = dungService({
      row: { article: BAI } as LuanGiaiChapterEntity,
    });

    const ket = await service.request('u1', CO_BANG, CHAPTER_THAN_CU);

    expect(ket).toEqual({ status: LuanGiaiChapterStatus.Ready, article: BAI });
    expect(queue.add).not.toHaveBeenCalled();
    expect(quota.consume).not.toHaveBeenCalled();
  });

  it('báo unavailable cho chương chưa có bảng, không đụng tới database', async () => {
    const { service, repo, quota } = dungService();

    const ket = await service.request('u1', CO_BANG, '05');

    expect(ket).toEqual({ status: LuanGiaiChapterStatus.Unavailable });
    expect(repo.findOne).not.toHaveBeenCalled();
    expect(quota.consume).not.toHaveBeenCalled();
  });

  it('báo unavailable khi bảng chưa soạn tới lá số, không trừ suất cho việc chắc chắn không ra bài', async () => {
    const { service, queue, quota } = dungService();

    const ket = await service.request('u1', CHUA_SOAN, CHAPTER_THAN_CU);

    expect(ket).toEqual({ status: LuanGiaiChapterStatus.Unavailable });
    expect(quota.consume).not.toHaveBeenCalled();
    expect(queue.add).not.toHaveBeenCalled();
  });

  it('từ chối khi hết suất trong ngày và không xếp hàng', async () => {
    const { service, queue } = dungService({ conSuat: false });

    await expect(service.request('u1', CO_BANG, CHAPTER_THAN_CU)).rejects.toThrow(
      ChapterQuotaExceededException,
    );
    expect(queue.add).not.toHaveBeenCalled();
  });

  it('xếp hàng với jobId theo lá số để hai người cùng xem chỉ tạo một job', async () => {
    const { service, queue } = dungService();

    const ket = await service.request('u1', CO_BANG, CHAPTER_THAN_CU);

    expect(ket).toEqual({ status: LuanGiaiChapterStatus.Pending });
    const [, data, options] = queue.add.mock.calls[0];
    expect(data.birthKey).toBe('1960-05-26-duong-h11-nam');
    expect(options.jobId).toBe('1960-05-26-duong-h11-nam:01');
  });
});
