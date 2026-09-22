import { SetMetadata } from '@nestjs/common';
import { MetadataKey } from '@org/backend-constants';
import { Roles } from '@org/backend-enum';

export const RequireRoles = (...roles: Roles[]) => SetMetadata(MetadataKey.ROLE, roles);
