import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsEmail, IsInt, IsUUID, Max, Min } from 'class-validator';

export const MIN_ASSIGNED_CREDITS = 1;
export const MAX_ASSIGNED_CREDITS = 1000;

@InputType()
export class AssignPaymentInput {
  @Field(() => ID)
  @IsUUID()
  paymentId!: string;

  @Field()
  @IsEmail()
  userEmail!: string;

  @Field(() => Int)
  @IsInt()
  @Min(MIN_ASSIGNED_CREDITS)
  @Max(MAX_ASSIGNED_CREDITS)
  credits!: number;
}
