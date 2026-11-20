import { ArgsType, Field, ID } from '@nestjs/graphql';
import { Roles } from '@org/backend-enum';
import { IsEnum, IsUUID } from 'class-validator';

@ArgsType()
export class SetUserRoleArgs {
  @Field(() => ID)
  @IsUUID()
  userId!: string;

  @Field(() => Roles)
  @IsEnum(Roles)
  role!: Roles;
}
