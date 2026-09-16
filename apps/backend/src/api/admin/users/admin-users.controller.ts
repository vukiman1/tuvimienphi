import { StrategyKey } from '@org/backend-constants';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { CONSOLE_ROLES } from '../../auth/console-roles';
import { RequireRoles } from '../../auth/decorators/require-roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AdminUserListResult, AdminUsersService } from './admin-users.service';
import { ListUsersDto } from './dto/list-users.dto';

@ApiTags('Admin API')
@Controller('admin/users')
@UseGuards(AuthGuard(StrategyKey.JWT.ADMIN), RolesGuard)
@RequireRoles(...CONSOLE_ROLES)
export class AdminUsersController {
  constructor(private readonly adminUsers: AdminUsersService) {}

  @Get()
  async list(@Query() query: ListUsersDto): Promise<AdminUserListResult> {
    return this.adminUsers.list(query);
  }
}
