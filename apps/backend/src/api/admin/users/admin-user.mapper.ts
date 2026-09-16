import { Roles } from '@org/backend-enum';
import { UserEntity } from '../../user/entities/user.entity';

export interface AdminUserSummary {
  id: string;
  email: string;
  displayName: string | null;
  avatar: string | null;
  role: Roles;
  isEmailVerified: boolean;
  balance: number;
  createdAt: string;
  genCount: number;
  lastActiveAt: string | null;
}

export interface AdminUserDerivedFields {
  genCount: string | number | null;
  lastActiveAt: Date | string | null;
}

export function toAdminUserSummary(
  user: UserEntity,
  derived: AdminUserDerivedFields,
): AdminUserSummary {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatar: user.avatar ?? null,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    balance: user.balance,
    createdAt: user.createdAt.toISOString(),
    genCount: Number(derived.genCount ?? 0),
    lastActiveAt: toIsoString(derived.lastActiveAt),
  };
}

function toIsoString(value: Date | string | null): string | null {
  if (value === null) {
    return null;
  }
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
