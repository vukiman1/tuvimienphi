import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { requestFromContext } from '../../transport/transport-context';
import { UserEntity } from '../user/entities/user.entity';

interface RequestWithUser {
  user?: UserEntity;
}

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserEntity | undefined =>
    (requestFromContext(context) as RequestWithUser | undefined)?.user,
);
