import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Roles } from '@org/backend-enum';

registerEnumType(Roles, { name: 'Role' });

@ObjectType()
export class AdminUser {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field(() => String, { nullable: true })
  displayName: string | null;

  @Field(() => String, { nullable: true })
  avatar: string | null;

  @Field(() => Roles)
  role: Roles;

  @Field()
  isEmailVerified: boolean;

  @Field(() => Int)
  balance: number;

  @Field()
  createdAt: string;

  @Field(() => Int)
  genCount: number;

  @Field(() => String, { nullable: true })
  lastActiveAt: string | null;
}

@ObjectType()
export class AdminUserPage {
  @Field(() => [AdminUser])
  users: AdminUser[];

  @Field(() => Int)
  total: number;
}
