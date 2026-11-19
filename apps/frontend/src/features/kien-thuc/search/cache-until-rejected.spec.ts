import { cacheUntilRejected } from './cache-until-rejected';

describe('cacheUntilRejected', () => {
  it('calls the underlying loader once while it succeeds', async () => {
    const load = jest.fn(() => Promise.resolve('index'));
    const cached = cacheUntilRejected(load);

    await expect(cached()).resolves.toBe('index');
    await expect(cached()).resolves.toBe('index');

    expect(load).toHaveBeenCalledTimes(1);
  });

  it('calls the underlying loader again after it rejects', async () => {
    const load = jest
      .fn<Promise<string>, []>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce('index');
    const cached = cacheUntilRejected(load);

    await expect(cached()).rejects.toThrow('offline');
    await expect(cached()).resolves.toBe('index');

    expect(load).toHaveBeenCalledTimes(2);
  });
});
