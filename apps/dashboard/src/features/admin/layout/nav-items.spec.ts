import { describe, expect, it } from 'vitest';
import { activeNavPath } from './nav-items';

describe('activeNavPath', () => {
  it('lights up the section a page belongs to', () => {
    expect(activeNavPath('/users')).toBe('/users');
    expect(activeNavPath('/')).toBe('/');
  });

  it('keeps the section lit on a page nested inside it', () => {
    expect(activeNavPath('/van-han/2027/7')).toBe('/van-han');
  });

  it('does not mistake a longer name for a nested page', () => {
    expect(activeNavPath('/van-han-archive')).toBeNull();
  });

  it('lights nothing for a page outside the menu', () => {
    expect(activeNavPath('/login')).toBeNull();
  });
});
