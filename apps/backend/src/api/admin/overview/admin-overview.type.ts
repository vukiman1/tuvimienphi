import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DailyCount {
  @Field()
  date: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class LabelledCount {
  @Field()
  label: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class PeriodMetric {
  @Field(() => Int)
  value: number;

  @Field(() => Int)
  previous: number;

  @Field(() => [DailyCount])
  series: DailyCount[];
}

@ObjectType()
export class AdminOverview {
  @Field()
  from: string;

  @Field()
  to: string;

  @Field(() => Int)
  totalUsers: number;

  @Field(() => Int)
  googleUsers: number;

  @Field(() => Int)
  passwordUsers: number;

  @Field(() => Int)
  savedCharts: number;

  @Field(() => PeriodMetric)
  activeUsers: PeriodMetric;

  @Field(() => PeriodMetric)
  logins: PeriodMetric;

  @Field(() => PeriodMetric)
  newUsers: PeriodMetric;

  @Field(() => PeriodMetric)
  newCharts: PeriodMetric;

  @Field(() => [LabelledCount])
  devices: LabelledCount[];
}
