import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { LaSoHistoryEntity } from '../../la-so/entities/la-so-history.entity';
import { UserSessionEntity } from '../../auth/entities/user-session.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { AdminUserSummary, toAdminUserSummary } from './admin-user.mapper';
import { DEFAULT_SORT_DIRECTION, DEFAULT_SORT_FIELD, SORT_COLUMN } from './admin-user.sort';
import { ListUsersArgs } from './dto/list-users.args';

export interface AdminUserListResult {
  users: AdminUserSummary[];
  total: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MS_PER_DAY = 86_400_000;

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
    const sortColumn = SORT_COLUMN[query.sortBy ?? DEFAULT_SORT_FIELD];
    const sortDirection = query.sortDirection ?? DEFAULT_SORT_DIRECTION;

    const total = await this.filtered(query).getCount();
    const { entities, raw } = await this.filtered(query)
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
      .orderBy(sortColumn, sortDirection)
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

  private filtered(query: ListUsersArgs): SelectQueryBuilder<UserEntity> {
    const builder = this.userRepo.createQueryBuilder('user');

    if (query.search) {
      builder.andWhere('(user.email ILIKE :term OR user.display_name ILIKE :term)', {
        term: `%${query.search}%`,
      });
    }
    if (query.roles?.length) {
      builder.andWhere('user.role IN (:...roles)', { roles: query.roles });
    }
    if (isSet(query.isEmailVerified)) {
      builder.andWhere('user.is_email_verified = :isEmailVerified', {
        isEmailVerified: query.isEmailVerified,
      });
    }
    if (query.joinedFrom) {
      builder.andWhere('user.created_at >= :joinedFrom', {
        joinedFrom: startOfDay(query.joinedFrom),
      });
    }
    if (query.joinedTo) {
      builder.andWhere('user.created_at < :joinedTo', {
        joinedTo: startOfNextDay(query.joinedTo),
      });
    }
    if (isSet(query.balanceMin)) {
      builder.andWhere('user.balance >= :balanceMin', { balanceMin: query.balanceMin });
    }
    if (isSet(query.balanceMax)) {
      builder.andWhere('user.balance <= :balanceMax', { balanceMax: query.balanceMax });
    }

    return builder;
  }
}

function isSet<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function startOfDay(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

function startOfNextDay(isoDate: string): Date {
  return new Date(startOfDay(isoDate).getTime() + MS_PER_DAY);
}
