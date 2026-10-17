import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { MAX_ASSIGNED_CREDITS, MIN_ASSIGNED_CREDITS } from '@org/shared-contracts';
import { IsEmail, IsInt, IsUUID, Max, Min } from 'class-validator';

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
