import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class KpiStat {
  @Field()
  key!: string;

  @Field()
  label!: string;

  @Field(() => Float)
  value!: number;

  @Field(() => Float)
  deltaPct!: number;

  @Field()
  trend!: string;

  @Field(() => [Float])
  spark!: number[];

  @Field()
  format!: string;
}

@ObjectType()
export class TrafficPoint {
  @Field()
  date!: string;

  @Field(() => Int)
  views!: number;

  @Field(() => Int)
  users!: number;
}

@ObjectType()
export class SourceSlice {
  @Field()
  source!: string;

  @Field(() => Int)
  visits!: number;

  @Field()
  element!: string;
}

@ObjectType()
export class GenTypeSlice {
  @Field()
  type!: string;

  @Field(() => Int)
  count!: number;
}

@ObjectType()
export class AdminOverview {
  @Field(() => [KpiStat])
  kpis!: KpiStat[];

  @Field(() => [TrafficPoint])
  traffic!: TrafficPoint[];

  @Field(() => [SourceSlice])
  sources!: SourceSlice[];

  @Field(() => [GenTypeSlice])
  genByType!: GenTypeSlice[];
}
