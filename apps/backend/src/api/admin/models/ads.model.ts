import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AdRedirect {
  @Field()
  id!: string;

  @Field()
  label!: string;

  @Field()
  slug!: string;

  @Field()
  target!: string;

  @Field(() => Int)
  clicks!: number;

  @Field(() => Boolean)
  active!: boolean;

  @Field()
  createdAt!: string;
}

@ObjectType()
export class AdPopup {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  trigger!: string;

  @Field()
  image!: string;

  @Field()
  target!: string;

  @Field(() => Int)
  impressions!: number;

  @Field(() => Int)
  clicks!: number;

  @Field(() => Boolean)
  active!: boolean;
}

@ObjectType()
export class AdsData {
  @Field(() => [AdRedirect])
  redirects!: AdRedirect[];

  @Field(() => [AdPopup])
  popups!: AdPopup[];
}
