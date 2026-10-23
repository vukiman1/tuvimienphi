import { UnknownThanCuCungError } from '../../luan-giai.errors';
import { khungThanCu } from './than-cu.khung';

describe('khungThanCu', () => {
  it('khungThanCu ghép tiêu đề theo cung an Thân', () => {
    const khung = khungThanCu('Quan Lộc');

    expect(khung.eyebrow).toBe('Thân cư');
    expect(khung.title).toBe('Thân cư Quan Lộc');
  });

  it('khungThanCu ném lỗi khi cung không an Thân được', () => {
    expect(() => khungThanCu('Tật Ách')).toThrow(UnknownThanCuCungError);
  });
});
