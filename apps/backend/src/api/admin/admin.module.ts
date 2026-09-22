import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { adminGraphqlOptions } from './admin-graphql.config';
import { AdminUsersResolver } from './users/admin-users.resolver';
import { AdminUsersService } from './users/admin-users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), GraphQLModule.forRoot(adminGraphqlOptions)],
  providers: [AdminUsersService, AdminUsersResolver],
})
export class AdminModule {}
