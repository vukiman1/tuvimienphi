import { CUNG_NAMES } from '@org/shared-tu-vi';
import { cungRelations } from './cung-facts.js';

describe('cung relations', () => {
  it('pairs Mệnh with Thiên Di and Tài Bạch, Quan Lộc', () => {
    const facts = cungRelations('Mệnh');
    expect(facts.doiCung).toBe('Thiên Di');
    expect([...facts.tamHop].sort()).toEqual(['Quan Lộc', 'Tài Bạch'].sort());
  });

  it('pairs Phu Thê with Quan Lộc and Phúc Đức, Thiên Di', () => {
    const facts = cungRelations('Phu Thê');
    expect(facts.doiCung).toBe('Quan Lộc');
    expect([...facts.tamHop].sort()).toEqual(['Phúc Đức', 'Thiên Di'].sort());
  });

  it('makes đối cung symmetric for all twelve palaces', () => {
    for (const name of CUNG_NAMES) {
      expect(cungRelations(cungRelations(name).doiCung).doiCung).toBe(name);
    }
  });

  it('closes every tam hợp group', () => {
    for (const name of CUNG_NAMES) {
      const [a, b] = cungRelations(name).tamHop;
      expect([...cungRelations(a).tamHop, a].sort()).toEqual(
        [...cungRelations(b).tamHop, b].sort(),
      );
      expect(cungRelations(a).tamHop).toContain(name);
      expect(cungRelations(b).tamHop).toContain(name);
    }
  });
});
