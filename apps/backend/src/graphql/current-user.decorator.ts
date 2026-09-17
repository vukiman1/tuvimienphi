import { type ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { UserEntity } from '../api/user/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserEntity | undefined => {
    return GqlExecutionContext.create(context).getContext().req?.user;
  },
);
