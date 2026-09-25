import { describe, expect, it } from 'vitest';
import { DEFAULT_USERS_FILTERS, type AdminUsersFilters } from '../data/admin-users.query';
import { describeActiveFilters } from './users-active-filters';

function filtersWith(overrides: Partial<AdminUsersFilters>): AdminUsersFilters {
  return { ...DEFAULT_USERS_FILTERS, ...overrides };
}

describe('describeActiveFilters', () => {
  it('shows nothing while the list is unfiltered', () => {
    expect(describeActiveFilters(DEFAULT_USERS_FILTERS)).toEqual([]);
  });

  it('does not treat the sort as something to clear', () => {
    const active = describeActiveFilters(filtersWith({ sortBy: 'EMAIL', sortDirection: 'ASC' }));

    expect(active).toEqual([]);
  });

  it('names each selected role separately so one can be dropped', () => {
    const active = describeActiveFilters(filtersWith({ roles: ['ADMIN', 'SELLER'] }));

    expect(active.map((filter) => filter.label)).toEqual([
      'Vai trò: Quản trị',
      'Vai trò: Người bán',
    ]);
  });

  it('keeps the other roles when one role chip is removed', () => {
    const active = describeActiveFilters(filtersWith({ roles: ['ADMIN', 'SELLER'] }));

    expect(active[0].clear).toEqual({ roles: ['SELLER'] });
  });

  it('reads a joined range back in the format the reader typed it', () => {
    const active = describeActiveFilters(
      filtersWith({ joinedFrom: '2026-01-01', joinedTo: '2026-01-31' }),
    );

    expect(active[0].label).toBe('Tham gia 01/01/2026 – 31/01/2026');
  });

  it('says which end of a range is open when only one side is set', () => {
    const active = describeActiveFilters(filtersWith({ balanceMin: 1000 }));

    expect(active[0].label).toBe('Số dư từ 1.000');
  });

  it('clears both ends of a range from one chip', () => {
    const active = describeActiveFilters(filtersWith({ balanceMin: 1000 }));

    expect(active[0].clear).toEqual({ balanceMin: null, balanceMax: null });
  });

  it('tells apart a verified filter from an unverified one', () => {
    const active = describeActiveFilters(filtersWith({ isEmailVerified: false }));

    expect(active[0].label).toBe('Email: chưa xác thực');
  });
});
