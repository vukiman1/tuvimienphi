import { Roles } from '@org/backend-enum';

export const CONSOLE_ROLES: readonly Roles[] = [Roles.SUPER_ADMIN, Roles.ADMIN];

export function isConsoleRole(role: Roles | undefined): boolean {
  return role !== undefined && CONSOLE_ROLES.includes(role);
}
