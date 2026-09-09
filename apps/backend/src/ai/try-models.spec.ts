import { AiUnavailableError } from './ai.errors';
import { tryModels } from './try-models';

describe('tryModels', () => {
  it('trả kết quả của model đầu tiên nhận lời gọi', async () => {
    const goi = jest.fn().mockResolvedValue('xong');

    await expect(tryModels(['a', 'b'], goi)).resolves.toEqual({ result: 'xong', model: 'a' });
    expect(goi).toHaveBeenCalledTimes(1);
  });

  it('chuyển sang model kế tiếp khi model trước từ chối', async () => {
    const goi = jest
      .fn()
      .mockRejectedValueOnce(new Error('UNAVAILABLE'))
      .mockResolvedValueOnce('xong');

    await expect(tryModels(['a', 'b'], goi)).resolves.toEqual({ result: 'xong', model: 'b' });
  });

  it('ném lỗi kèm lý do của từng model khi không model nào nhận', async () => {
    const goi = jest
      .fn()
      .mockRejectedValueOnce(new Error('RESOURCE_EXHAUSTED'))
      .mockRejectedValueOnce(new Error('UNAVAILABLE'));

    const loi = await tryModels(['a', 'b'], goi).catch((error: unknown) => error);

    expect(loi).toBeInstanceOf(AiUnavailableError);
    expect((loi as AiUnavailableError).attempts).toEqual([
      { model: 'a', reason: 'RESOURCE_EXHAUSTED' },
      { model: 'b', reason: 'UNAVAILABLE' },
    ]);
  });

  it('ném lỗi ngay khi danh sách model rỗng', async () => {
    await expect(tryModels([], jest.fn())).rejects.toThrow(AiUnavailableError);
  });
});
