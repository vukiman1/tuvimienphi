import { registerEnumType } from '@nestjs/graphql';

export enum AdminUserSortField {
  CREATED_AT = 'CREATED_AT',
  BALANCE = 'BALANCE',
  EMAIL = 'EMAIL',
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(AdminUserSortField, { name: 'AdminUserSortField' });
registerEnumType(SortDirection, { name: 'SortDirection' });

export const SORT_COLUMN = {
  [AdminUserSortField.CREATED_AT]: 'user.createdAt',
  [AdminUserSortField.BALANCE]: 'user.balance',
  [AdminUserSortField.EMAIL]: 'user.email',
} as const satisfies Record<AdminUserSortField, string>;

export const DEFAULT_SORT_FIELD = AdminUserSortField.CREATED_AT;
export const DEFAULT_SORT_DIRECTION = SortDirection.DESC;
