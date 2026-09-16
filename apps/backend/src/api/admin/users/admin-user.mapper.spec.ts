import { Roles } from '@org/backend-enum';
import { UserEntity } from '../../user/entities/user.entity';
import { toAdminUserSummary } from './admin-user.mapper';

const CREATED_AT = new Date('2026-02-01T03:04:05.000Z');

function userRow(): UserEntity {
  return {
    id: 'user-1',
    email: 'a@b.c',
    displayName: 'Kim An',
    avatar: null,
    role: Roles.USER,
    isEmailVerified: true,
    balance: 120,
    createdAt: CREATED_AT,
  } as unknown as UserEntity;
}

describe('toAdminUserSummary', () => {
  it('turns the chart count into a number, since Postgres returns counts as text', () => {
    const summary = toAdminUserSummary(userRow(), { genCount: '42', lastActiveAt: null });

    expect(summary.genCount).toBe(42);
  });

  it('reports a user who never opened a session as never active', () => {
    const summary = toAdminUserSummary(userRow(), { genCount: '0', lastActiveAt: null });

    expect(summary.lastActiveAt).toBeNull();
  });

  it('hands timestamps to the client as ISO strings', () => {
    const lastActiveAt = new Date('2026-09-15T10:20:30.000Z');

    const summary = toAdminUserSummary(userRow(), { genCount: '1', lastActiveAt });

    expect(summary.createdAt).toBe(CREATED_AT.toISOString());
    expect(summary.lastActiveAt).toBe(lastActiveAt.toISOString());
  });

  it('never leaks the password hash, even though the row carries one', () => {
    const withPassword = { ...userRow(), password: '$argon2id$v=19$secret' } as UserEntity;

    const summary = toAdminUserSummary(withPassword, { genCount: '0', lastActiveAt: null });

    expect(Object.values(summary)).not.toContain('$argon2id$v=19$secret');
    expect('password' in summary).toBe(false);
  });
});
