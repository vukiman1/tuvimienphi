import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BirthInfo {
  @Field()
  fullName!: string;

  @Field()
  gender!: string;

  @Field()
  birthDate!: string;

  @Field()
  birthHour!: string;

  @Field()
  calendar!: string;
}

@ObjectType()
export class GenRecord {
  @Field()
  id!: string;

  @Field()
  kind!: string;

  @Field()
  createdAt!: string;

  @Field(() => BirthInfo)
  input!: BirthInfo;
}

@ObjectType()
export class AdminUser {
  @Field()
  id!: string;

  @Field()
  displayName!: string;

  @Field()
  email!: string;

  @Field()
  avatarSeed!: string;

  @Field()
  role!: string;

  @Field()
  status!: string;

  @Field(() => Int)
  credits!: number;

  @Field(() => Int)
  genCount!: number;

  @Field()
  createdAt!: string;

  @Field()
  lastActiveAt!: string;

  @Field(() => [GenRecord])
  genHistory!: GenRecord[];
}
