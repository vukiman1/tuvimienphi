import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { LaSoHistoryEntity } from '../../la-so/entities/la-so-history.entity';
import { UserSessionEntity } from '../../auth/entities/user-session.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { AdminUserSummary, toAdminUserSummary } from './admin-user.mapper';
import { ListUsersArgs } from './dto/list-users.args';

export interface AdminUserListResult {
  users: AdminUserSummary[];
  total: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

const GEN_COUNT_ALIAS = 'genCount';
const LAST_ACTIVE_AT_ALIAS = 'lastActiveAt';
const LISTED_COLUMNS = [
  'user.id',
  'user.email',
  'user.displayName',
  'user.avatar',
  'user.role',
  'user.isEmailVerified',
  'user.balance',
  'user.createdAt',
];

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async list(query: ListUsersArgs): Promise<AdminUserListResult> {
    const take = query.limit ?? DEFAULT_PAGE_SIZE;
    const skip = ((query.page ?? DEFAULT_PAGE) - 1) * take;

    const total = await this.searchable(query.search).getCount();
    const { entities, raw } = await this.searchable(query.search)
      .select(LISTED_COLUMNS)
      .addSelect(
        (sub) =>
          sub
            .select('COUNT(*)')
            .from(LaSoHistoryEntity, 'history')
            .where('history.user_id = user.id'),
        GEN_COUNT_ALIAS,
      )
      .addSelect(
        (sub) =>
          sub
            .select('MAX(session.last_seen_at)')
            .from(UserSessionEntity, 'session')
            .where('session.user_id = user.id'),
        LAST_ACTIVE_AT_ALIAS,
      )
      .orderBy('user.createdAt', 'DESC')
      .addOrderBy('user.id', 'DESC')
      .skip(skip)
      .take(take)
      .getRawAndEntities<Record<string, unknown>>();

    return {
      total,
      users: entities.map((user, index) =>
        toAdminUserSummary(user, {
          genCount: raw[index]?.[GEN_COUNT_ALIAS] as string | null,
          lastActiveAt: raw[index]?.[LAST_ACTIVE_AT_ALIAS] as Date | null,
        }),
      ),
    };
  }

  private searchable(search: string | undefined): SelectQueryBuilder<UserEntity> {
    const queryBuilder = this.userRepo.createQueryBuilder('user');
    if (!search) {
      return queryBuilder;
    }
    return queryBuilder.where('(user.email ILIKE :term OR user.display_name ILIKE :term)', {
      term: `%${search}%`,
    });
  }
}
