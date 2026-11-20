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

export class SuperAdminRoleLockedError extends Error {
  constructor(userId: string) {
    super(`Cannot change the role of super admin ${userId}`);
    this.name = 'SuperAdminRoleLockedError';
  }
}

export class RoleChangeUserNotFoundError extends Error {
  constructor(userId: string) {
    super(`Cannot change role: user ${userId} not found`);
    this.name = 'RoleChangeUserNotFoundError';
  }
}
