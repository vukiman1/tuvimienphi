import { describe, expect, it } from 'vitest';
import type { TableProps } from 'antd';
import type { AdminUserRow } from '../data/admin-users.query';
import {
  EMAIL_STATUS_FILTER_KEY,
  EMAIL_STATUS_VALUE,
  ROLE_FILTER_KEY,
  readTableChange,
} from './users-table-adapter';

type TableChangeHandler = NonNullable<TableProps<AdminUserRow>['onChange']>;
type TableChangeArgs = Parameters<TableChangeHandler>;

const NO_FILTERS: TableChangeArgs[1] = {};

function change(
  overrides: {
    pagination?: TableChangeArgs[0];
    filters?: TableChangeArgs[1];
    action?: TableChangeArgs[3]['action'];
  } = {},
) {
  return readTableChange(overrides.pagination ?? { current: 1 }, overrides.filters ?? NO_FILTERS, {
    action: overrides.action ?? 'paginate',
    currentDataSource: [],
  });
}

describe('readTableChange', () => {
  it('follows the reader to the page they clicked', () => {
    expect(change({ pagination: { current: 4 }, action: 'paginate' }).page).toBe(4);
  });

  it('returns to the first page when a filter changes, so the reader sees the new matches', () => {
    expect(change({ pagination: { current: 4 }, action: 'filter' }).page).toBe(1);
  });

  it('keeps only the roles the console actually offers', () => {
    const filters = { [ROLE_FILTER_KEY]: ['ADMIN', 'ROOT', 'SELLER'] };

    expect(change({ filters }).roles).toEqual(['ADMIN', 'SELLER']);
  });

  it('asks for unverified accounts when that is the choice', () => {
    const filters = { [EMAIL_STATUS_FILTER_KEY]: [EMAIL_STATUS_VALUE.UNVERIFIED] };

    expect(change({ filters }).isEmailVerified).toBe(false);
  });

  it('drops the email filter once it is cleared', () => {
    const filters = { [EMAIL_STATUS_FILTER_KEY]: null };

    expect(change({ filters }).isEmailVerified).toBeNull();
  });
});
