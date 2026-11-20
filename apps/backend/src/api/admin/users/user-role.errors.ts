import { Roles } from '@org/backend-enum';

export class RoleNotAssignableError extends Error {
  constructor(role: Roles) {
    super(`Role ${role} cannot be assigned from the console`);
    this.name = 'RoleNotAssignableError';
  }
}

export class OwnRoleChangeError extends Error {
  constructor(userId: string) {
    super(`User ${userId} cannot change their own role`);
    this.name = 'OwnRoleChangeError';
  }
}

export class RoleLockedError extends Error {
  constructor(
    userId: string,
    readonly role: Roles,
  ) {
    super(`Cannot change the role of ${role} user ${userId} from the console`);
    this.name = 'RoleLockedError';
  }
}

export class RoleChangeUserNotFoundError extends Error {
  constructor(userId: string) {
    super(`Cannot change role: user ${userId} not found`);
    this.name = 'RoleChangeUserNotFoundError';
  }
}
