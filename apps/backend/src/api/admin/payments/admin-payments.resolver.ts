import { StrategyKey } from '@org/backend-constants';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CONSOLE_ROLES } from '../../auth/console-roles';
import { RequireRoles } from '../../auth/decorators/require-roles.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PaymentService } from '../../payment/payment.service';
import { UserEntity } from '../../user/entities/user.entity';
import { CurrentAdmin } from '../current-admin.decorator';
import { AdminPayment, AdminPaymentPage } from './admin-payment.type';
import { AssignPaymentInput } from './dto/assign-payment.input';
import { ListPaymentsArgs } from './dto/list-payments.args';

@Resolver(() => AdminPayment)
@UseGuards(GqlAuthGuard(StrategyKey.JWT.ADMIN), RolesGuard)
@RequireRoles(...CONSOLE_ROLES)
export class AdminPaymentsResolver {
  constructor(private readonly payments: PaymentService) {}

  @Query(() => AdminPaymentPage, { name: 'payments' })
  async list(@Args() args: ListPaymentsArgs): Promise<AdminPaymentPage> {
    const { payments, total } = await this.payments.list(args);
    return { payments: [...payments], total };
  }

  @Mutation(() => AdminPayment, { name: 'assignPayment' })
  async assign(
    @Args('input') input: AssignPaymentInput,
    @CurrentAdmin() admin: UserEntity,
  ): Promise<AdminPayment> {
    return this.payments.assign(input, admin.email);
  }
}
