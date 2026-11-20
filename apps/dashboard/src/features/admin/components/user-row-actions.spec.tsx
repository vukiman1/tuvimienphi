import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { UserRole } from '@org/shared-contracts';
import type { Role } from '../../../gql/graphql';
import { useAuthStore } from '../../../stores/auth-store';
import type { AdminUserRow } from '../data/admin-users.query';
import {
  LOCKED_ROLE_ROW_REASON,
  OWN_ROW_REASON,
  SUPER_ADMIN_ROW_REASON,
} from './role-change-policy';
import { UserRowActions } from './user-row-actions';

const VIEWER_EMAIL = 'owner@example.com';

function row(email: string, role: Role): AdminUserRow {
  return {
    id: `id-${email}`,
    email,
    displayName: null,
    avatar: null,
    role,
    isEmailVerified: true,
    balance: 0,
    chapterCredits: 0,
    dailyChapterUsed: 0,
    createdAt: '2026-10-01T00:00:00.000Z',
    genCount: 0,
    lastActiveAt: null,
  };
}

function signInAs(role: UserRole): void {
  useAuthStore.setState({ user: { email: VIEWER_EMAIL, role } });
}

function renderActions(user: AdminUserRow): Mock {
  const onChangeRole = vi.fn();
  render(<UserRowActions user={user} onAdjustCredits={vi.fn()} onChangeRole={onChangeRole} />);
  return onChangeRole;
}

function roleButton(): HTMLElement | null {
  return screen.queryByRole('button', { name: 'Quyền' });
}

describe('UserRowActions', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null });
  });

  it('hides the role action from an admin who is not a super admin', () => {
    signInAs('ADMIN');

    renderActions(row('an@example.com', 'USER'));

    expect(roleButton()).toBeNull();
    expect(screen.getByRole('button', { name: 'Chỉnh lượt' })).toBeTruthy();
  });

  it('lets a super admin open the role dialog for another user', () => {
    signInAs('SUPER_ADMIN');
    const user = row('an@example.com', 'USER');

    const onChangeRole = renderActions(user);
    fireEvent.click(roleButton() as HTMLElement);

    expect(onChangeRole).toHaveBeenCalledWith(user);
  });

  it('disables the role action on the super admin’s own row and says why', () => {
    signInAs('SUPER_ADMIN');

    renderActions(row('Owner@Example.com', 'SUPER_ADMIN'));

    expect(roleButton()).toHaveProperty('disabled', true);
    expect(roleButton()?.getAttribute('aria-description')).toBe(OWN_ROW_REASON);
  });

  it('disables the role action on another super admin and says why', () => {
    signInAs('SUPER_ADMIN');

    renderActions(row('other-owner@example.com', 'SUPER_ADMIN'));

    expect(roleButton()).toHaveProperty('disabled', true);
    expect(roleButton()?.getAttribute('aria-description')).toBe(SUPER_ADMIN_ROW_REASON);
  });

  it('disables the role action on a seller, whose role the console does not manage', () => {
    signInAs('SUPER_ADMIN');

    renderActions(row('seller@example.com', 'SELLER'));

    expect(roleButton()).toHaveProperty('disabled', true);
    expect(roleButton()?.getAttribute('aria-description')).toBe(LOCKED_ROLE_ROW_REASON);
  });
});
