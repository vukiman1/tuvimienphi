import { Roles } from '@org/backend-enum';
import { Repository } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { AdminUserSortField, SortDirection } from './admin-user.sort';
import { AdminUsersService } from './admin-users.service';
import { ListUsersArgs } from './dto/list-users.args';

interface RecordedCondition {
  clause: string;
  params: Record<string, unknown>;
}

type RecordedOrder = readonly [column: string, direction: string];

class FakeQueryBuilder {
  readonly conditions: RecordedCondition[] = [];
  readonly ordering: RecordedOrder[] = [];

  andWhere(clause: string, params: Record<string, unknown> = {}): this {
    this.conditions.push({ clause, params });
    return this;
  }

  select(): this {
    return this;
  }

  addSelect(): this {
    return this;
  }

  orderBy(column: string, direction: string): this {
    this.ordering.push([column, direction]);
    return this;
  }

  addOrderBy(column: string, direction: string): this {
    this.ordering.push([column, direction]);
    return this;
  }

  skip(): this {
    return this;
  }

  take(): this {
    return this;
  }

  async getCount(): Promise<number> {
    return 0;
  }

  async getRawAndEntities(): Promise<{ entities: UserEntity[]; raw: unknown[] }> {
    return { entities: [], raw: [] };
  }
}

function serviceWithRecorder(): {
  service: AdminUsersService;
  builders: FakeQueryBuilder[];
} {
  const builders: FakeQueryBuilder[] = [];
  const repo = {
    createQueryBuilder: () => {
      const builder = new FakeQueryBuilder();
      builders.push(builder);
      return builder;
    },
  } as unknown as Repository<UserEntity>;

  return { service: new AdminUsersService(repo), builders };
}

async function listWith(args: ListUsersArgs): Promise<FakeQueryBuilder> {
  const { service, builders } = serviceWithRecorder();
  await service.list(args);
  return builders[builders.length - 1];
}

describe('AdminUsersService.list', () => {
  it('asks for every user when no filter is given', async () => {
    const builder = await listWith({});

    expect(builder.conditions).toEqual([]);
  });

  it('sorts newest first by default, with a tiebreak so paging cannot repeat a row', async () => {
    const builder = await listWith({});

    expect(builder.ordering).toEqual([
      ['user.createdAt', 'DESC'],
      ['user.id', 'DESC'],
    ]);
  });

  it('sorts by a whitelisted column instead of anything the caller names', async () => {
    const builder = await listWith({
      sortBy: AdminUserSortField.EMAIL,
      sortDirection: SortDirection.ASC,
    });

    expect(builder.ordering[0]).toEqual(['user.email', 'ASC']);
  });

  it('keeps the search term in a bound parameter rather than in the SQL text', async () => {
    const builder = await listWith({ search: "o'brien%" });

    const [condition] = builder.conditions;
    expect(condition.clause).not.toContain("o'brien");
    expect(condition.params).toEqual({ term: "%o'brien%%" });
  });

  it('narrows to the selected roles', async () => {
    const builder = await listWith({ roles: [Roles.ADMIN, Roles.SELLER] });

    expect(builder.conditions).toEqual([
      { clause: 'user.role IN (:...roles)', params: { roles: [Roles.ADMIN, Roles.SELLER] } },
    ]);
  });

  it('finds unverified accounts, not just verified ones', async () => {
    const builder = await listWith({ isEmailVerified: false });

    expect(builder.conditions).toEqual([
      { clause: 'user.is_email_verified = :isEmailVerified', params: { isEmailVerified: false } },
    ]);
  });

  it('covers the whole last day of a joined range', async () => {
    const builder = await listWith({ joinedFrom: '2026-01-01', joinedTo: '2026-01-31' });

    expect(builder.conditions).toEqual([
      {
        clause: 'user.created_at >= :joinedFrom',
        params: { joinedFrom: new Date('2026-01-01T00:00:00.000Z') },
      },
      {
        clause: 'user.created_at < :joinedTo',
        params: { joinedTo: new Date('2026-02-01T00:00:00.000Z') },
      },
    ]);
  });

  it('treats a zero balance floor as a real filter', async () => {
    const builder = await listWith({ balanceMin: 0 });

    expect(builder.conditions).toEqual([
      { clause: 'user.balance >= :balanceMin', params: { balanceMin: 0 } },
    ]);
  });

  it('ignores a filter the client sent as null, the way GraphQL delivers an absent variable', async () => {
    const builder = await listWith({
      search: null,
      roles: null,
      isEmailVerified: null,
      joinedFrom: null,
      joinedTo: null,
      balanceMin: null,
      balanceMax: null,
    });

    expect(builder.conditions).toEqual([]);
  });

  it('still pages and sorts when every filter variable is null', async () => {
    const builder = await listWith({
      page: 1,
      limit: 20,
      search: null,
      isEmailVerified: null,
      balanceMin: null,
      sortBy: null,
      sortDirection: null,
    });

    expect(builder.ordering).toEqual([
      ['user.createdAt', 'DESC'],
      ['user.id', 'DESC'],
    ]);
  });

  it('combines every filter into one query', async () => {
    const builder = await listWith({
      search: 'kim',
      roles: [Roles.USER],
      isEmailVerified: true,
      joinedFrom: '2026-01-01',
      balanceMax: 500,
    });

    expect(builder.conditions).toHaveLength(5);
  });
});
