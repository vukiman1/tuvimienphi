import {
  Controller,
  Get,
  ParseFilePipe,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { StrategyKey } from '@org/backend-constants';
import { User } from '@org/backend-decorators';
import { AVATAR_FORM_FIELD, AVATAR_MAX_BYTES } from '@org/shared-contracts';
import { AVATAR_UPLOAD_THROTTLE } from './avatar/avatar.constants';
import { UserAvatarService } from './avatar/user-avatar.service';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';

interface UploadedAvatarFile {
  buffer: Buffer;
}

@UseGuards(AuthGuard(StrategyKey.JWT.USER))
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userAvatarService: UserAvatarService,
  ) {}

  @Get('credit')
  async getUserCredit(@User() user: UserEntity) {
    return this.userService.getUserCredit(user.id);
  }

  @Put('avatar')
  @Throttle(AVATAR_UPLOAD_THROTTLE)
  @UseInterceptors(
    FileInterceptor(AVATAR_FORM_FIELD, { limits: { fileSize: AVATAR_MAX_BYTES, files: 1 } }),
  )
  async updateAvatar(
    @User() user: UserEntity,
    @UploadedFile(new ParseFilePipe()) file: UploadedAvatarFile,
  ) {
    return this.userAvatarService.replace(user, file.buffer);
  }
}
