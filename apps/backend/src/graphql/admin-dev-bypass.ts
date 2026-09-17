import { Logger } from '@nestjs/common';
import { Roles } from '@org/backend-enum';

const logger = new Logger('AdminGraphQL');
let warned = false;

export function isAdminDevBypass(): boolean {
  const bypass = process.env.NODE_ENV !== 'production';
  if (bypass && !warned) {
    warned = true;
    logger.warn('Admin GraphQL auth is BYPASSED because NODE_ENV is not "production".');
  }
  return bypass;
}

export const DEV_ADMIN_USER = {
  id: 'dev-admin',
  email: 'dev-admin@local',
  role: Roles.ADMIN,
};
