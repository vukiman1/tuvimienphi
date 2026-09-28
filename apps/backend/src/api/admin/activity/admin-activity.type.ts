import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ActivityEntry {
  @Field(() => ID)
  id: string;

  @Field()
  occurredAt: string;

  @Field()
  event: string;

  @Field(() => ID, { nullable: true })
  userId: string | null;

  @Field(() => String, { nullable: true })
  actorEmail: string | null;

  @Field(() => String, { nullable: true })
  actorName: string | null;

  @Field(() => String, { nullable: true })
  ipAddress: string | null;
}

@ObjectType()
export class ActivityPage {
  @Field(() => [ActivityEntry])
  entries: ActivityEntry[];

  @Field(() => Int)
  total: number;
}
