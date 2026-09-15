import { randomUUID } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import type { UpdateAvatarResponse } from '@org/shared-contracts';
import { ObjectStorageService } from '../../../storage/object-storage.service';
import { UserEntity } from '../entities/user.entity';
import { UserService } from '../user.service';
import { AVATAR_FILE_EXTENSIONS, AVATAR_KEY_PREFIX } from './avatar.constants';
import {
  AvatarUploadUnavailableException,
  UnsupportedAvatarTypeException,
} from './avatar.exceptions';
import { detectAvatarMimeType } from './detect-avatar-mime-type';

@Injectable()
export class UserAvatarService {
  private readonly logger = new Logger(UserAvatarService.name);

  constructor(
    private readonly userService: UserService,
    private readonly objectStorage: ObjectStorageService,
  ) {}

  async replace(user: UserEntity, image: Buffer): Promise<UpdateAvatarResponse> {
    if (!this.objectStorage.isConfigured()) {
      throw new AvatarUploadUnavailableException();
    }

    const mimeType = detectAvatarMimeType(image);
    if (!mimeType) {
      throw new UnsupportedAvatarTypeException();
    }

    const previousKey = user.avatar ? this.objectStorage.keyFromPublicUrl(user.avatar) : null;
    const avatar = await this.objectStorage.putPublicObject({
      key: `${AVATAR_KEY_PREFIX}/${user.id}/${randomUUID()}.${AVATAR_FILE_EXTENSIONS[mimeType]}`,
      body: image,
      contentType: mimeType,
    });
    await this.userService.update(user, { avatar });

    if (previousKey) {
      await this.deletePrevious(previousKey, user.id);
    }
    return { avatar };
  }

  private async deletePrevious(key: string, userId: string): Promise<void> {
    try {
      await this.objectStorage.deleteObject(key);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Left an orphaned avatar for user ${userId}: ${reason}`);
    }
  }
}
