import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { DEFAULT_USERS_FILTERS, type AdminUsersFilters } from '../data/admin-users.query';
import { UsersToolbar } from './users-toolbar';

function renderToolbar(filters: AdminUsersFilters = DEFAULT_USERS_FILTERS) {
  const onChange = vi.fn();
  const onReset = vi.fn();
  render(<UsersToolbar filters={filters} onChange={onChange} onReset={onReset} />);
  return { onChange, onReset };
}

describe('UsersToolbar', () => {
  it('offers every control as an icon, with no input taking up the row', () => {
    renderToolbar();

    expect(screen.getByLabelText('Tìm người dùng')).toBeTruthy();
    expect(screen.getByLabelText('Lọc theo ngày tham gia')).toBeTruthy();
    expect(screen.getByLabelText('Lọc theo số dư')).toBeTruthy();
    expect(screen.getByLabelText('Sắp xếp: Mới tham gia trước')).toBeTruthy();
  });

  it('keeps the search box out of the tab order until it is opened', () => {
    renderToolbar();

    expect(screen.getByPlaceholderText('Email hoặc tên').getAttribute('tabindex')).toBe('-1');
  });

  it('opens the search box when the icon is clicked', () => {
    renderToolbar();

    fireEvent.click(screen.getByLabelText('Tìm người dùng'));

    expect(screen.getByPlaceholderText('Email hoặc tên').getAttribute('tabindex')).toBe('0');
  });

  it('searches for what was typed once the reader presses Enter', () => {
    const { onChange } = renderToolbar();

    fireEvent.click(screen.getByLabelText('Tìm người dùng'));
    const input = screen.getByPlaceholderText('Email hoặc tên');
    fireEvent.change(input, { target: { value: 'kim' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith({ search: 'kim' });
  });

  it('leaves the list alone when the search box is closed without a change', () => {
    const { onChange } = renderToolbar({ ...DEFAULT_USERS_FILTERS, search: 'kim' });

    fireEvent.blur(screen.getByPlaceholderText('Email hoặc tên'));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows the sort the list is currently in', () => {
    renderToolbar({ ...DEFAULT_USERS_FILTERS, sortBy: 'BALANCE', sortDirection: 'ASC' });

    expect(screen.getByLabelText('Sắp xếp: Số dư thấp nhất trước')).toBeTruthy();
  });

  it('lists every way the list can be sorted', async () => {
    renderToolbar();

    fireEvent.click(screen.getByLabelText('Sắp xếp: Mới tham gia trước'));

    expect(await screen.findByText('Email A → Z')).toBeTruthy();
    expect(screen.getByText('Số dư cao nhất trước')).toBeTruthy();
  });

  it('sorts by what the reader picked', async () => {
    const { onChange } = renderToolbar();

    fireEvent.click(screen.getByLabelText('Sắp xếp: Mới tham gia trước'));
    fireEvent.click(await screen.findByText('Email A → Z'));

    expect(onChange).toHaveBeenCalledWith({ sortBy: 'EMAIL', sortDirection: 'ASC' });
  });

  it('hides the clear button while nothing is filtered', () => {
    renderToolbar();

    expect(screen.queryByLabelText('Xoá tất cả bộ lọc')).toBeNull();
  });

  it('offers to clear once a filter is on', () => {
    renderToolbar({ ...DEFAULT_USERS_FILTERS, search: 'kim' });

    expect(screen.getByLabelText('Xoá tất cả bộ lọc')).toBeTruthy();
  });
});
