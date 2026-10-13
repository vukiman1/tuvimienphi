import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { VanHanMissingPart } from '../../van-han/van-han-completeness';

registerEnumType(VanHanMissingPart, { name: 'VanHanMissingPart' });

@ObjectType()
export class AdminVanHanAspect {
  @Field()
  aspect: string;

  @Field(() => Int)
  rating: number;

  @Field()
  body: string;
}

@ObjectType()
export class AdminVanHanAge {
  @Field(() => Int)
  birthYear: number;

  @Field()
  canChi: string;

  @Field()
  menh: string;

  @Field()
  male: string;

  @Field()
  female: string;
}

@ObjectType()
export class AdminVanHanEntry {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => [Int])
  bornYears: number[];

  @Field()
  luuNien: string;

  @Field(() => [AdminVanHanAspect])
  luanGiai: AdminVanHanAspect[];

  @Field(() => [AdminVanHanAge])
  tungTuoi: AdminVanHanAge[];

  @Field()
  sourceUrl: string;

  @Field()
  updatedAt: string;
}

@ObjectType()
export class AdminVanHanSlot {
  @Field(() => Int)
  year: number;

  @Field(() => Int)
  zodiacOrder: number;

  @Field()
  zodiac: string;

  @Field(() => AdminVanHanEntry, { nullable: true })
  entry: AdminVanHanEntry | null;

  @Field(() => [VanHanMissingPart])
  missing: VanHanMissingPart[];
}

@ObjectType()
export class AdminVanHanYear {
  @Field(() => Int)
  year: number;

  @Field()
  canChi: string;

  @Field(() => String, { nullable: true })
  publishedAt: string | null;

  @Field(() => [AdminVanHanSlot])
  slots: AdminVanHanSlot[];
}

@ObjectType()
export class AdminVanHanYearSummary {
  @Field(() => Int)
  year: number;

  @Field(() => String, { nullable: true })
  publishedAt: string | null;

  @Field(() => Int)
  entryCount: number;
}

@ObjectType()
export class AdminVanHanBirthYear {
  @Field(() => Int)
  birthYear: number;

  @Field()
  canChi: string;

  @Field()
  menh: string;

  @Field(() => Int)
  age: number;
}

@ObjectType()
export class AdminVanHanEditor {
  @Field(() => Int)
  year: number;

  @Field()
  canChi: string;

  @Field(() => String, { nullable: true })
  publishedAt: string | null;

  @Field(() => AdminVanHanSlot)
  slot: AdminVanHanSlot;

  @Field(() => AdminVanHanEntry, { nullable: true })
  previousEntry: AdminVanHanEntry | null;

  @Field(() => [AdminVanHanBirthYear])
  birthYearOptions: AdminVanHanBirthYear[];
}
