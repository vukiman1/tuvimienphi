import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthIdentityEntity } from '../auth/entities/auth-identity.entity';
import { UserSessionEntity } from '../auth/entities/user-session.entity';
import { LaSoHistoryEntity } from '../la-so/entities/la-so-history.entity';
import { UserEntity } from '../user/entities/user.entity';
import { adminGraphqlOptions } from './admin-graphql.config';
import { AdminOverviewResolver } from './overview/admin-overview.resolver';
import { AdminOverviewService } from './overview/admin-overview.service';
import { AdminUsersResolver } from './users/admin-users.resolver';
import { AdminUsersService } from './users/admin-users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserSessionEntity,
      LaSoHistoryEntity,
      AuthIdentityEntity,
    ]),
    GraphQLModule.forRoot(adminGraphqlOptions),
  ],
  providers: [AdminUsersService, AdminUsersResolver, AdminOverviewService, AdminOverviewResolver],
})
export class AdminModule {}
