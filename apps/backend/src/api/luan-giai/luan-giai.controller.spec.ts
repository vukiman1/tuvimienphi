import { LuanGiaiChapterStatus, type LuanGiaiChapterStatusMap } from '@org/shared-contracts';
import type { FunnelService } from '../funnel/funnel.service';
import { LuanGiaiController } from './luan-giai.controller';
import type { LuanGiaiService } from './luan-giai.service';

const BIRTH_KEY = '1960-05-26-duong-h11-nam';
const STATUS: LuanGiaiChapterStatusMap = { chapters: { '01': LuanGiaiChapterStatus.Ready } };

describe('LuanGiaiController', () => {
  it('status records a chart cast for the requested key', async () => {
    const luanGiai = { status: jest.fn().mockResolvedValue(STATUS) };
    const funnel = { recordCast: jest.fn().mockResolvedValue(undefined) };
    const controller = new LuanGiaiController(
      luanGiai as unknown as LuanGiaiService,
      funnel as unknown as FunnelService,
    );

    await expect(controller.status(BIRTH_KEY)).resolves.toEqual(STATUS);
    expect(funnel.recordCast).toHaveBeenCalledTimes(1);
    expect(funnel.recordCast).toHaveBeenCalledWith(BIRTH_KEY);
  });
});
