import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { AdPopupEntity } from './entities/ad-popup.entity';
import { AdRedirectEntity } from './entities/ad-redirect.entity';
import { BlogPostEntity } from './entities/blog-post.entity';
import { VanHanEntryEntity } from './entities/van-han-entry.entity';
import { AdminOverviewResolver } from './resolvers/admin-overview.resolver';
import { AdminUsersResolver } from './resolvers/admin-users.resolver';
import { AdsResolver } from './resolvers/ads.resolver';
import { BlogResolver } from './resolvers/blog.resolver';
import { VanHanEntryResolver } from './resolvers/van-han-entry.resolver';
import { AdminOverviewService } from './services/admin-overview.service';
import { AdminUsersService } from './services/admin-users.service';
import { AdsService } from './services/ads.service';
import { BlogService } from './services/blog.service';
import { VanHanEntryService } from './services/van-han-entry.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlogPostEntity,
      AdRedirectEntity,
      AdPopupEntity,
      VanHanEntryEntity,
      UserEntity,
    ]),
  ],
  providers: [
    AdminOverviewService,
    AdminUsersService,
    BlogService,
    AdsService,
    VanHanEntryService,
    AdminOverviewResolver,
    AdminUsersResolver,
    BlogResolver,
    AdsResolver,
    VanHanEntryResolver,
  ],
})
export class AdminModule {}
