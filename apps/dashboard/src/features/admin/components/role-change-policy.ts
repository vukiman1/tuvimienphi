import type { User } from '@org/shared-contracts';
import type { Role } from '@/gql/graphql';

export const ASSIGNABLE_ROLES = ['USER', 'ADMIN'] as const satisfies readonly Role[];

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export const ASSIGNABLE_ROLE_LABEL = {
  USER: 'Người dùng',
  ADMIN: 'Quản trị viên',
} as const satisfies Record<AssignableRole, string>;

export const OWN_ROW_REASON = 'Không thể tự đổi quyền của chính mình.';
export const SUPER_ADMIN_ROW_REASON = 'Không thể đổi quyền của quản trị viên cấp cao.';
export const LOCKED_ROLE_ROW_REASON = 'Chỉ đổi được quyền của Người dùng hoặc Quản trị viên.';

export type RoleChangeAvailability =
  | { readonly kind: 'hidden' }
  | { readonly kind: 'blocked'; readonly reason: string }
  | { readonly kind: 'allowed' };

interface RoleChangeTarget {
  readonly email: string;
  readonly role: Role;
}

export function roleChangeAvailability(
  target: RoleChangeTarget,
  viewer: User | null,
): RoleChangeAvailability {
  if (viewer?.role !== 'SUPER_ADMIN') {
    return { kind: 'hidden' };
  }
  if (target.email.toLowerCase() === viewer.email.toLowerCase()) {
    return { kind: 'blocked', reason: OWN_ROW_REASON };
  }
  if (target.role === 'SUPER_ADMIN') {
    return { kind: 'blocked', reason: SUPER_ADMIN_ROW_REASON };
  }
  if (!isAssignableRole(target.role)) {
    return { kind: 'blocked', reason: LOCKED_ROLE_ROW_REASON };
  }
  return { kind: 'allowed' };
}

export function isAssignableRole(role: Role): role is AssignableRole {
  return ASSIGNABLE_ROLES.some((assignable) => assignable === role);
}
