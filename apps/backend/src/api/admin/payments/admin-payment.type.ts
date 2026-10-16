import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { PaymentStatus, UnmatchedReason } from '../../payment/payment-status.enum';

registerEnumType(PaymentStatus, { name: 'PaymentStatus' });
registerEnumType(UnmatchedReason, { name: 'UnmatchedReason' });

@ObjectType()
export class AdminPayment {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  amountVnd: number;

  @Field()
  content: string;

  @Field()
  referenceCode: string;

  @Field(() => PaymentStatus)
  status: PaymentStatus;

  @Field(() => UnmatchedReason, { nullable: true })
  unmatchedReason: UnmatchedReason | null;

  @Field(() => Int)
  creditsGranted: number;

  @Field(() => Int)
  suggestedCredits: number;

  @Field(() => String, { nullable: true })
  userEmail: string | null;

  @Field()
  transactionAt: string;
}

@ObjectType()
export class AdminPaymentPage {
  @Field(() => [AdminPayment])
  payments: AdminPayment[];

  @Field(() => Int)
  total: number;
}
