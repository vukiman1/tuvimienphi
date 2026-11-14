import { act, renderHook } from '@testing-library/react';
import { BoardDensity } from '@/features/la-so/board-density';
import { BOARD_DENSITY_STORAGE_KEY, useBoardDensity } from './use-board-density';

afterEach(() => {
  window.localStorage.clear();
  jest.restoreAllMocks();
});

describe('useBoardDensity', () => {
  it('starts in Gọn', () => {
    const { result } = renderHook(() => useBoardDensity());

    expect(result.current[0]).toBe(BoardDensity.Key);
  });

  it('remembers Đủ sao across renders', () => {
    const first = renderHook(() => useBoardDensity());
    act(() => first.result.current[1](BoardDensity.All));
    first.unmount();

    expect(window.localStorage.getItem(BOARD_DENSITY_STORAGE_KEY)).toBe('du');
    expect(renderHook(() => useBoardDensity()).result.current[0]).toBe(BoardDensity.All);
  });

  it('falls back to Gọn on an unknown stored value', () => {
    window.localStorage.setItem(BOARD_DENSITY_STORAGE_KEY, 'x');

    expect(renderHook(() => useBoardDensity()).result.current[0]).toBe(BoardDensity.Key);
  });

  it('falls back to Gọn when storage throws', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });

    expect(renderHook(() => useBoardDensity()).result.current[0]).toBe(BoardDensity.Key);
  });

  it('still switches when storage refuses the write', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });
    const { result } = renderHook(() => useBoardDensity());

    act(() => result.current[1](BoardDensity.All));

    expect(result.current[0]).toBe(BoardDensity.All);
  });
});
