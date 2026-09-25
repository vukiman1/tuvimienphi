import type { Role } from '@/gql/graphql';

export const ROLE_LABEL = {
  SUPER_ADMIN: 'Quản trị tối cao',
  ADMIN: 'Quản trị',
  SELLER: 'Người bán',
  USER: 'Người dùng',
} as const satisfies Record<Role, string>;
